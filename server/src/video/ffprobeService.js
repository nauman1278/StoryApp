const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

exports.getAudioDuration = async (filePath) => {
    try {
        const command = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`;
        const { stdout } = await execPromise(command);
        
        const duration = parseFloat(stdout.trim());
        if (isNaN(duration)) throw new Error('Could not parse duration');
        
        return duration;
    } catch (err) {
        console.error('ffprobe error:', err);
        throw new Error(`Failed to get audio duration: ${err.message}`);
    }
};
