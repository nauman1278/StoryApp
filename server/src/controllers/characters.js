const characterRepository = require('../repositories/characters');
const sceneRepository = require('../repositories/scenes');
const Groq = require('groq-sdk');

exports.getProjectCharacters = (req, res) => {
    try {
        const characters = characterRepository.findByProjectId(req.params.projectId);
        res.json(characters);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createCharacter = (req, res) => {
    try {
        const character = characterRepository.create({
            projectId: req.params.projectId,
            ...req.body
        });
        res.json(character);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.extractCharacters = async (req, res) => {
    try {
        const { projectId } = req.params;
        const scenes = sceneRepository.findByProjectId(projectId);
        
        if (!scenes || scenes.length === 0) {
            return res.status(400).json({ error: 'No scenes found to analyze.' });
        }
        
        const fullStory = scenes.map(s => s.script).join('\n\n');
        
        if (!process.env.GROQ_API_KEY) {
            return res.status(400).json({ error: 'GROQ_API_KEY is not set in server/.env' });
        }
        
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        
        const prompt = `Analyze the following story and extract all distinct characters.
For each character, provide their name exactly as it appears in the story, and write a 1-sentence "appearanceLock" describing their physical traits and clothing based on context clues.
You MUST output a valid JSON object containing a "characters" array, where each object has "name" and "appearanceLock" string properties.

Story:
${fullStory}`;

        const response = await groq.chat.completions.create({
            model: 'openai/gpt-oss-120b',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' }
        });
        
        let extractedCharacters = [];
        try {
            const data = JSON.parse(response.choices[0].message.content);
            extractedCharacters = data.characters || [];
        } catch (e) {
            return res.status(500).json({ error: 'Failed to parse AI response' });
        }
        
        // Delete old characters to avoid duplicates
        const existing = characterRepository.findByProjectId(projectId);
        for (const char of existing) {
            characterRepository.delete(char.id);
        }
        
        // Save new characters
        const savedCharacters = [];
        for (const char of extractedCharacters) {
            const saved = characterRepository.create({
                projectId,
                name: char.name,
                description: 'Extracted by AI',
                appearanceLock: char.appearanceLock
            });
            savedCharacters.push(saved);
        }
        
        res.json({ success: true, characters: savedCharacters });
    } catch (err) {
        console.error('Extraction error:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.getCharacterById = (req, res) => {
    try {
        const character = characterRepository.findById(req.params.characterId);
        if (!character) return res.status(404).json({ error: 'Character not found' });
        res.json(character);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateCharacter = (req, res) => {
    try {
        const character = characterRepository.update(req.params.characterId, req.body);
        if (!character) return res.status(404).json({ error: 'Character not found' });
        res.json(character);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteCharacter = (req, res) => {
    try {
        const success = characterRepository.delete(req.params.characterId);
        if (!success) return res.status(404).json({ error: 'Character not found' });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
