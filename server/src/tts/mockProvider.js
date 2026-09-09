const TTSProvider = require('./TTSProvider');
const fs = require('fs');

class MockProvider extends TTSProvider {
    async getVoices(language) {
        return [
            { id: 'mock-1', name: 'Mock Voice 1', language: 'English' },
            { id: 'mock-2', name: 'Mock Voice 2', language: 'Hindi' }
        ];
    }

    async generateSpeech(text, voiceId, outputPath, settings = {}) {
        // Just create an empty file or a dummy file to simulate an audio file
        // For testing we will generate a very small valid mp3 or just an empty file
        // But since ffprobe will complain about an empty file, we should write a tiny base64 mp3
        
        // This is a 0.5 second silent MP3
        const silentMp3 = Buffer.from('SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU5LjI3LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIwBRUVFRUVFRUVFRUVFRUVFRUVFRUVFRVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmd3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3iIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqru7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7vMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3f//////////////////////////////////////////////////////////////////////////////////////AAAAADhMQU1FMy4xMDABzQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//OEAAAoAAAABwAAAAAAAwcABwAA//OEAAIqAAAABwAAAAAAAwcABwAA//OEAAIpAAAABwAAAAAAAwcABwAA//OEAAIqAAAABwAAAAAAAwcABwAA', 'base64');
        
        fs.writeFileSync(outputPath, silentMp3);
    }
}

module.exports = MockProvider;
