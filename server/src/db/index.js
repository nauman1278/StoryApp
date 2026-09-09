const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../../data');
if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath, { recursive: true });
}

const db = new Database(path.join(dbPath, 'story-video.db'), { verbose: console.log });

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize schema
const initSchema = () => {
    db.exec(`
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            title TEXT NOT NULL,
            language TEXT NOT NULL,
            visualStyle TEXT NOT NULL,
            aspectRatio TEXT NOT NULL,
            storyInputMode TEXT NOT NULL,
            ttsProvider TEXT,
            selectedVoiceId TEXT,
            voiceSettings TEXT,
            status TEXT NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS scenes (
            id TEXT PRIMARY KEY,
            projectId TEXT NOT NULL,
            sceneNumber INTEGER NOT NULL,
            title TEXT,
            script TEXT,
            imagePrompt TEXT,
            imagePromptStatus TEXT,
            imagePath TEXT,
            audioPath TEXT,
            audioDuration REAL,
            clipPath TEXT,
            clipDuration REAL,
            status TEXT NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS characters (
            id TEXT PRIMARY KEY,
            projectId TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            appearanceLock TEXT,
            FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS render_jobs (
            id TEXT PRIMARY KEY,
            projectId TEXT NOT NULL,
            type TEXT NOT NULL,
            progress INTEGER DEFAULT 0,
            status TEXT NOT NULL,
            error TEXT,
            startedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            completedAt DATETIME,
            FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
        );
    `);
};

initSchema();

module.exports = db;
