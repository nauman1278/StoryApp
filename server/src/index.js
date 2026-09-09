const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const projectsRouter = require('./routes/projects');
const scenesRouter = require('./routes/scenes');
const charactersRouter = require('./routes/characters');
const voicesRouter = require('./routes/voices');
const jobsRouter = require('./routes/jobs');

app.use('/api/projects', projectsRouter);
app.use('/api/scenes', scenesRouter);
app.use('/api/characters', charactersRouter);
app.use('/api/voices', voicesRouter);
app.use('/api/jobs', jobsRouter);

// Serve output directory statically for previewing images/audio/video
const path = require('path');
app.use('/output', express.static(path.join(__dirname, '../../output')));

// Basic health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Serve frontend in production
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));
app.get('*', (req, res) => {
    // Only send the React index.html for non-API requests
    if (!req.path.startsWith('/api/') && !req.path.startsWith('/output/')) {
        res.sendFile(path.join(clientDistPath, 'index.html'));
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: {
            message: err.message || 'Internal Server Error',
            details: err.stack
        }
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
