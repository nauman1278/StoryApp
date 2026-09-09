const TTSProvider = require('./TTSProvider');
const axios = require('axios');
const fs = require('fs');

class ElevenLabsProvider extends TTSProvider {
    constructor() {
        super();
        this.apiKey = process.env.ELEVENLABS_API_KEY;
        this.baseUrl = 'https://api.elevenlabs.io/v1';
    }

    async getVoices(language) {
        if (!this.apiKey) throw new Error('ElevenLabs API key is missing');
        const response = await axios.get(`${this.baseUrl}/voices`, {
            headers: { 'xi-api-key': this.apiKey }
        });
        
        return response.data.voices.map(v => ({
            id: v.voice_id,
            name: v.name,
            category: v.category,
            provider: 'ElevenLabs'
        }));
    }

    async generateSpeech(text, voiceId, outputPath, settings = {}) {
        if (!this.apiKey) throw new Error('ElevenLabs API key is missing');
        
        const response = await axios.post(
            `${this.baseUrl}/text-to-speech/${voiceId}`,
            {
                text: text,
                model_id: "eleven_monolingual_v1", // or multilingual depending on language
                voice_settings: {
                    stability: settings.stability || 0.5,
                    similarity_boost: settings.similarity || 0.75
                }
            },
            {
                headers: { 
                    'xi-api-key': this.apiKey,
                    'Content-Type': 'application/json'
                },
                responseType: 'stream'
            }
        );

        return new Promise((resolve, reject) => {
            const writer = fs.createWriteStream(outputPath);
            response.data.pipe(writer);
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    }
}

module.exports = ElevenLabsProvider;
