const sceneRepository = require('../repositories/scenes');
const projectRepository = require('../repositories/projects');
const Groq = require('groq-sdk');

exports.getProjectScenes = (req, res) => {
    try {
        const scenes = sceneRepository.findByProjectId(req.params.projectId);
        res.json(scenes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSceneById = (req, res) => {
    try {
        const scene = sceneRepository.findById(req.params.sceneId);
        if (!scene) return res.status(404).json({ error: 'Scene not found' });
        res.json(scene);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createScene = (req, res) => {
    try {
        const project = projectRepository.findById(req.params.projectId);
        if (!project) return res.status(404).json({ error: 'Project not found' });

        const scenes = sceneRepository.findByProjectId(project.id);
        const nextNumber = scenes.length > 0 ? scenes[scenes.length - 1].sceneNumber + 1 : 1;

        const scene = sceneRepository.create({
            projectId: project.id,
            sceneNumber: req.body.sceneNumber || nextNumber,
            title: req.body.title,
            script: req.body.script,
            status: 'DRAFT'
        });
        res.status(201).json(scene);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateScene = (req, res) => {
    try {
        const scene = sceneRepository.update(req.params.sceneId, req.body);
        if (!scene) return res.status(404).json({ error: 'Scene not found' });
        res.json(scene);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteScene = (req, res) => {
    try {
        sceneRepository.delete(req.params.sceneId);
        res.status(204).end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.extractScenes = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { fullStory } = req.body;
        
        if (!fullStory || fullStory.trim() === '') {
            return res.status(400).json({ error: 'Story text is required.' });
        }
        
        if (!process.env.GROQ_API_KEY) {
            return res.status(400).json({ error: 'GROQ_API_KEY is not set in server/.env' });
        }
        
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        
        const prompt = `Analyze the following story and split it into logical visual scenes for a video.
CRITICAL RULES:
1. Break the story when the LOCATION changes, the ENVIRONMENT changes, or a significant visual action occurs.
2. The maximum length of a single scene is 50 words. If a scene is longer, you MUST split it into two scenes.
3. Output the exact original text of the story (do not summarize or skip words). Combine the text segments to ensure the entire story is narrated.
4. You MUST output a valid JSON object with a single "scenes" array property, where each item in the array is a string containing the text for that scene.

Story:
${fullStory}`;

        const response = await groq.chat.completions.create({
            model: 'openai/gpt-oss-120b',
            messages: [{ role: 'user', content: prompt }]
            // Removed response_format to prevent Groq internal validation errors on markdown outputs
        });
        
        let extractedScenesText = [];
        try {
            let content = response.choices[0].message.content;
            
            // Clean markdown formatting if present
            if (content.includes('```json')) {
                content = content.split('```json')[1].split('```')[0].trim();
            } else if (content.includes('```')) {
                content = content.split('```')[1].split('```')[0].trim();
            }
            
            // Attempt to find JSON array or object
            const startIndex = content.indexOf('{');
            const endIndex = content.lastIndexOf('}');
            if (startIndex !== -1 && endIndex !== -1) {
                content = content.substring(startIndex, endIndex + 1);
            }
            
            const data = JSON.parse(content);
            extractedScenesText = data.scenes || [];
        } catch (e) {
            console.error("Parse error on content:", response.choices[0].message.content);
            return res.status(500).json({ error: 'Failed to parse AI response' });
        }
        
        const savedScenes = [];
        let nextNumber = 1;
        for (const text of extractedScenesText) {
            const saved = sceneRepository.create({
                projectId,
                sceneNumber: nextNumber++,
                title: `Scene ${nextNumber - 1}`,
                script: text,
                status: 'DRAFT'
            });
            savedScenes.push(saved);
        }
        
        res.json({ success: true, scenes: savedScenes });
    } catch (err) {
        console.error('Scene extraction error:', err);
        res.status(500).json({ error: err.message });
    }
};
