const ttsFactory = require('../tts');
const path = require('path');
const fs = require('fs');

exports.getVoices = async (req, res) => {
    try {
        const { provider, lang } = req.query;
        if (!provider) return res.status(400).json({ error: 'Provider is required' });

        const tts = ttsFactory.getProvider(provider);
        const voices = await tts.getVoices(lang);
        
        res.json(voices);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.previewVoice = async (req, res) => {
    try {
        const { provider, voiceId, text, settings } = req.body;
        
        if (!provider || !voiceId || !text) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const tts = ttsFactory.getProvider(provider);
        
        // Setup preview directory
        const previewDir = path.join(__dirname, '../../../output/previews');
        if (!fs.existsSync(previewDir)) {
            fs.mkdirSync(previewDir, { recursive: true });
        }

        const filename = `preview_${Date.now()}.mp3`;
        const filePath = path.join(previewDir, filename);

        await tts.generateSpeech(text, voiceId, filePath, settings);

        // We return the relative URL
        res.json({
            success: true,
            previewUrl: `/output/previews/${filename}`
        });

    } catch (err) {
        console.error('Voice preview error:', err);
        res.status(500).json({ error: err.message });
    }
};
