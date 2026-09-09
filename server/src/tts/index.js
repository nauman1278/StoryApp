const EdgeTTSProvider = require('./edgeTtsProvider');
const ElevenLabsProvider = require('./elevenLabsProvider');
const MockProvider = require('./mockProvider');

exports.getProvider = (providerName) => {
    switch (providerName?.toLowerCase()) {
        case 'edgetts':
        case 'edge':
            return new EdgeTTSProvider();
        case 'elevenlabs':
            return new ElevenLabsProvider();
        case 'mock':
            return new MockProvider();
        default:
            throw new Error(`Unknown TTS provider: ${providerName}`);
    }
};
