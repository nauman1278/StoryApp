const PromptGenerator = require('../prompts/promptGenerator');
const projectRepository = require('../repositories/projects');
const sceneRepository = require('../repositories/scenes');
const characterRepository = require('../repositories/characters');

exports.generateScenePrompt = (req, res) => {
    try {
        const { projectId, sceneId } = req.params;
        
        const project = projectRepository.findById(projectId);
        if (!project) return res.status(404).json({ error: 'Project not found' });

        const scene = sceneRepository.findById(sceneId);
        if (!scene || scene.projectId !== project.id) {
            return res.status(404).json({ error: 'Scene not found in this project' });
        }

        const characters = characterRepository.findByProjectId(project.id);
        const generator = new PromptGenerator(project, characters);
        
        const prompt = generator.generateForScene(scene);
        
        // Update scene with the generated prompt
        const updatedScene = sceneRepository.update(scene.id, {
            imagePrompt: prompt,
            imagePromptStatus: 'PROMPT_READY',
            status: scene.status === 'DRAFT' || scene.status === 'SCRIPT_READY' ? 'PROMPT_READY' : scene.status
        });

        res.json(updatedScene);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.generateAllPrompts = (req, res) => {
    try {
        const { projectId } = req.params;
        
        const project = projectRepository.findById(projectId);
        if (!project) return res.status(404).json({ error: 'Project not found' });

        const characters = characterRepository.findByProjectId(project.id);
        const generator = new PromptGenerator(project, characters);
        const scenes = sceneRepository.findByProjectId(project.id);
        
        const updatedScenes = scenes.map(scene => {
            const prompt = generator.generateForScene(scene);
            return sceneRepository.update(scene.id, {
                imagePrompt: prompt,
                imagePromptStatus: 'PROMPT_READY',
                status: scene.status === 'DRAFT' || scene.status === 'SCRIPT_READY' ? 'PROMPT_READY' : scene.status
            });
        });

        res.json(updatedScenes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
