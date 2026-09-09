const { exec } = require('child_process');
const util = require('util');
const path = require('path');
const fs = require('fs');
const execPromise = util.promisify(exec);
const sceneRepository = require('../repositories/scenes');

exports.renderProjectVideo = async (project, scenes, projectDir, onProgress) => {
    const clipsDir = path.join(projectDir, 'clips');
    const finalDir = path.join(projectDir, 'final');
    
    if (!fs.existsSync(clipsDir)) fs.mkdirSync(clipsDir, { recursive: true });
    if (!fs.existsSync(finalDir)) fs.mkdirSync(finalDir, { recursive: true });

    const clipPaths = [];
    const baseOutputRoot = path.join(__dirname, '../../../output');

    for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        
        if (!scene.imagePath || !scene.audioPath) {
            console.warn(`Skipping scene ${scene.sceneNumber}: missing image or audio`);
            continue;
        }

        const imageFile = path.join(baseOutputRoot, scene.imagePath);
        const audioFile = path.join(baseOutputRoot, scene.audioPath);
        
        const paddedNumber = String(scene.sceneNumber).padStart(3, '0');
        const outputClip = path.join(clipsDir, `scene_${paddedNumber}.mp4`);
        
        // padding
        const duration = scene.audioDuration + 0.2; 
        
        // Build FFmpeg command for static image + audio
        let vfFilter = 'scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,format=yuv420p';

        if (project.visualStyle === 'Vintage') {
            // We'll wrap the text tightly so it forms a tall, narrow column on the left side
            const wrapText = (text, maxChars) => {
                const words = text.split(' ');
                let lines = [], currentLine = '';
                for (const word of words) {
                    if ((currentLine + word).length > maxChars) {
                        lines.push(currentLine.trim());
                        currentLine = word + ' ';
                    } else {
                        currentLine += word + ' ';
                    }
                }
                if (currentLine.trim()) lines.push(currentLine.trim());
                return lines.join('\n');
            };
            
            // 28 characters max forces it to stay strictly on the left half of the screen
            const wrappedScript = wrapText(scene.script, 28);
            const textFile = path.join(clipsDir, `scene_${paddedNumber}.txt`);
            fs.writeFileSync(textFile, wrappedScript);
            
            // Clean path for ffmpeg
            const escapedTextPath = textFile.replace(/\\/g, '/').replace(/:/g, '\\:');
            
            // x=120, y=120 places it at the top left.
            vfFilter += `,drawtext=textfile='${escapedTextPath}':fontcolor=black:fontsize=56:x=120:y=120:line_spacing=25:font='sans-serif'`;
            
            // Add a subtle vintage color grade or sepia overlay
            vfFilter += ',colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131';
        } else {
            // Cinematic: Chunked timing, Bottom Center, White text, Black Outline
            const srtFile = path.join(clipsDir, `scene_${paddedNumber}.srt`);
            const srtService = require('./srtService');
            srtService.generateSRT(scene.script, duration, srtFile);
            const escapedSrtPath = srtFile.replace(/\\/g, '/').replace(/:/g, '\\:');
            vfFilter += `,subtitles='${escapedSrtPath}':force_style='FontName=sans-serif,FontSize=24,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1,Outline=3,Shadow=1,MarginV=60,Alignment=2'`;
        }

        const cmd = `ffmpeg -y -loop 1 -framerate 30 -i "${imageFile}" -i "${audioFile}" -c:v libx264 -t ${duration} -vf "${vfFilter}" -c:a aac -b:a 192k -pix_fmt yuv420p -shortest "${outputClip}"`;
        
        console.log(`Rendering clip for scene ${scene.sceneNumber}...`);
        await execPromise(cmd);
        
        clipPaths.push(outputClip);
        
        sceneRepository.update(scene.id, {
            clipPath: path.join(project.name, 'clips', `scene_${paddedNumber}.mp4`).replace(/\\\\/g, '/'),
            clipDuration: duration,
            status: 'SCENE_READY'
        });

        if (onProgress) {
            const percent = Math.round(((i + 1) / scenes.length) * 90);
            onProgress(percent);
        }
    }

    if (clipPaths.length > 0) {
        console.log('Concatenating clips...');
        const concatFilePath = path.join(clipsDir, 'concat.txt');
        
        const concatContent = clipPaths.map(cp => `file '${cp}'`).join('\n');
        fs.writeFileSync(concatFilePath, concatContent);

        const finalVideoPath = path.join(finalDir, `${project.name}_final.mp4`);
        
        const concatCmd = `ffmpeg -y -f concat -safe 0 -i "${concatFilePath}" -c copy "${finalVideoPath}"`;
        await execPromise(concatCmd);

        console.log(`Final video created at: ${finalVideoPath}`);
        
        if (onProgress) {
            onProgress(100);
        }
    }
};
