const fs = require('fs');

function formatTime(seconds) {
    const d = new Date(seconds * 1000);
    const hh = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const mm = String(d.getUTCMinutes()).padStart(2, '0');
    const ss = String(d.getUTCSeconds()).padStart(2, '0');
    const ms = String(d.getUTCMilliseconds()).padStart(3, '0');
    return `${hh}:${mm}:${ss},${ms}`;
}

exports.formatTime = formatTime;

exports.generateSRT = (script, duration, outputPath) => {
    // Clean script
    const text = script.replace(/\s+/g, ' ').trim();
    const words = text.split(' ');
    
    // Chunk words into groups of 5-7 words
    const chunks = [];
    let currentChunk = [];
    
    for (let i = 0; i < words.length; i++) {
        currentChunk.push(words[i]);
        // Break randomly between 5 and 7 words, or on punctuation
        const isEndPunctuation = /[.!?]$/.test(words[i]);
        if (currentChunk.length >= 6 || isEndPunctuation) {
            chunks.push(currentChunk.join(' '));
            currentChunk = [];
        }
    }
    if (currentChunk.length > 0) {
        chunks.push(currentChunk.join(' '));
    }
    
    // Distribute time based on character length
    const totalChars = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    
    let srtContent = '';
    let currentTime = 0;
    
    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const chunkRatio = chunk.length / totalChars;
        const chunkDuration = duration * chunkRatio;
        
        const startTime = currentTime;
        const endTime = currentTime + chunkDuration;
        
        srtContent += `${i + 1}\n`;
        srtContent += `${formatTime(startTime)} --> ${formatTime(endTime)}\n`;
        srtContent += `${chunk}\n\n`;
        
        currentTime = endTime;
    }
    
    fs.writeFileSync(outputPath, srtContent);
};
