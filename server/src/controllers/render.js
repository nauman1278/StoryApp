const projectRepository = require('../repositories/projects');
const sceneRepository = require('../repositories/scenes');
const ttsFactory = require('../tts');
const ffprobeService = require('../video/ffprobeService');
const ffmpegService = require('../video/ffmpegService'); // We will build this next
const path = require('path');
const fs = require('fs');

exports.renderAudio = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = projectRepository.findById(projectId);
        if (!project) return res.status(404).json({ error: 'Project not found' });

        if (!project.ttsProvider || !project.selectedVoiceId) {
            return res.status(400).json({ error: 'Voice provider and voice ID must be selected first' });
        }

        const scenes = sceneRepository.findByProjectId(projectId);
        if (!scenes || scenes.length === 0) {
            return res.status(400).json({ error: 'No scenes found' });
        }

        // Generate a job ID based on project to track it
        const jobId = `audio-${projectId}-${Date.now()}`;
        
        // For SSE/WebSockets, we emit progress events. Return early and continue process
        res.json({ message: 'Audio generation started', jobId });

        // Run asynchronously
        (async () => {
            try {
                const tts = ttsFactory.getProvider(project.ttsProvider);
                const voiceSettings = project.voiceSettings ? JSON.parse(project.voiceSettings) : {};
                
                const projectDir = path.join(__dirname, '../../../output', project.name);
                const audioDir = path.join(projectDir, 'audio');
                if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

                const timeline = [];
                let currentTime = 0;

                global.jobEvents.emit('progress', { jobId, progress: 0, status: 'PROCESSING' });

                for (let i = 0; i < scenes.length; i++) {
                    const scene = scenes[i];
                    
                    // Skip if script is empty
                    if (!scene.script || scene.script.trim() === '') continue;

                    const paddedNumber = String(scene.sceneNumber).padStart(3, '0');
                    const filename = `scene_${paddedNumber}.mp3`;
                    const filePath = path.join(audioDir, filename);

                    // Generate audio
                    await tts.generateSpeech(scene.script, project.selectedVoiceId, filePath, voiceSettings);

                    // Get exact duration using ffprobe
                    const duration = await ffprobeService.getAudioDuration(filePath);

                    // Calculate timeline (including optional padding, e.g. 0.2s)
                    const padding = 0.2;
                    const sceneTotalDuration = duration + padding;
                    
                    timeline.push({
                        scene: scene.sceneNumber,
                        start: currentTime,
                        duration: sceneTotalDuration,
                        end: currentTime + sceneTotalDuration
                    });
                    
                    currentTime += sceneTotalDuration;

                    // Update scene in database
                    sceneRepository.update(scene.id, {
                        audioPath: path.join(project.name, 'audio', filename).replace(/\\\\/g, '/'),
                        audioDuration: duration,
                        status: 'VOICE_READY' 
                    });

                    // Emit progress
                    const percent = Math.round(((i + 1) / scenes.length) * 100);
                    global.jobEvents.emit('progress', { jobId, progress: percent, status: 'PROCESSING' });
                }

                // Save timeline JSON
                fs.writeFileSync(
                    path.join(projectDir, 'project.json'), 
                    JSON.stringify(timeline, null, 2)
                );

                console.log(`Audio rendering completed for project: ${project.name}`);
                global.jobEvents.emit('progress', { jobId, progress: 100, status: 'COMPLETED' });

            } catch (err) {
                console.error('Background audio generation failed:', err);
                global.jobEvents.emit('progress', { jobId, progress: 0, status: 'FAILED', error: err.message });
            }
        })();

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.renderVideo = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = projectRepository.findById(projectId);
        
        // Generate a job ID based on project to track it
        const jobId = `video-${projectId}-${Date.now()}`;
        
        // Return immediately to acknowledge request
        res.json({ message: 'Video generation started', jobId });

        (async () => {
            try {
                const scenes = sceneRepository.findByProjectId(projectId);
                const projectDir = path.join(__dirname, '../../../output', project.name);
                
                global.jobEvents.emit('progress', { jobId, progress: 0, status: 'PROCESSING' });
                
                await ffmpegService.renderProjectVideo(project, scenes, projectDir, (progress) => {
                    global.jobEvents.emit('progress', { jobId, progress, status: 'PROCESSING' });
                });
                
                console.log(`Video rendering completed for project: ${project.name}`);
                global.jobEvents.emit('progress', { jobId, progress: 100, status: 'COMPLETED' });
            } catch (err) {
                console.error('Background video generation failed:', err);
                global.jobEvents.emit('progress', { jobId, progress: 0, status: 'FAILED', error: err.message });
            }
        })();
        
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
