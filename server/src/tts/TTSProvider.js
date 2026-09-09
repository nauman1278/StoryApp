class TTSProvider {
    async getVoices(language) {
        throw new Error('Not implemented');
    }

    async generateSpeech(text, voiceId, outputPath, settings) {
        throw new Error('Not implemented');
    }
}

module.exports = TTSProvider;
