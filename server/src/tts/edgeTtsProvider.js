const TTSProvider = require('./TTSProvider');
const { EdgeTTS } = require('node-edge-tts');

class EdgeTTSProvider extends TTSProvider {
    constructor() {
        super();
        this.tts = new EdgeTTS();
    }

    async getVoices(language) {
        // Edge TTS has many voices. We'll return a hardcoded curated list for MVP.
        const voices = [
            { id: 'en-US-JennyNeural', name: 'Jenny (US)', language: 'English' },
            { id: 'en-US-GuyNeural', name: 'Guy (US)', language: 'English' },
            { id: 'en-GB-SoniaNeural', name: 'Sonia (UK)', language: 'English' },
            { id: 'hi-IN-SwaraNeural', name: 'Swara (India)', language: 'Hindi' },
            { id: 'hi-IN-MadhurNeural', name: 'Madhur (India)', language: 'Hindi' }
        ];
        
        if (language) {
            return voices.filter(v => v.language.toLowerCase() === language.toLowerCase());
        }
        return voices;
    }

    async generateSpeech(text, voiceId, outputPath, settings = {}) {
        const edgeTTS = new EdgeTTS({
            voice: voiceId,
            lang: voiceId.split('-').slice(0, 2).join('-'),
            outputFormat: 'audio-24khz-48kbitrate-mono-mp3'
        });
        
        // Settings for speed/volume could be added here if supported by node-edge-tts
        // e.g. edgeTTS.rate = settings.speed
        
        await edgeTTS.ttsPromise(text, outputPath);
    }
}

module.exports = EdgeTTSProvider;
