const projectRepository = require('../repositories/projects');

exports.getProjects = (req, res) => {
    try {
        const projects = projectRepository.findAll();
        res.json(projects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getProjectById = (req, res) => {
    try {
        const project = projectRepository.findById(req.params.id);
        if (!project) return res.status(404).json({ error: 'Project not found' });
        res.json(project);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createProject = (req, res) => {
    try {
        // Basic validation
        const { name, title, language, visualStyle, aspectRatio, storyInputMode } = req.body;
        if (!name || !title || !language || !visualStyle) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Sanitize name for filesystem use
        const sanitizedName = name.replace(/[^a-z0-9_]/gi, '_').toLowerCase();

        const project = projectRepository.create({
            ...req.body,
            name: sanitizedName,
            status: 'DRAFT'
        });
        res.status(201).json(project);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateProject = (req, res) => {
    try {
        const project = projectRepository.update(req.params.id, req.body);
        if (!project) return res.status(404).json({ error: 'Project not found' });
        res.json(project);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteProject = (req, res) => {
    try {
        projectRepository.delete(req.params.id);
        res.status(204).end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
