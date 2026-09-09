const EventEmitter = require('events');
const eventEmitter = new EventEmitter();

// In a real app this would store state in DB/Redis
// We expose it globally here for the render controller to use
global.jobEvents = eventEmitter; 

exports.subscribeToJobEvents = (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const jobId = req.params.jobId;

    const onProgress = (data) => {
        if (data.jobId === jobId) {
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        }
    };

    eventEmitter.on('progress', onProgress);

    req.on('close', () => {
        eventEmitter.off('progress', onProgress);
    });
};
