const db = require('../db');
const { v4: uuidv4 } = require('uuid');

class ProjectRepository {
    create(data) {
        const id = uuidv4();
        const stmt = db.prepare(`
            INSERT INTO projects (
                id, name, title, language, visualStyle, aspectRatio, storyInputMode, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        stmt.run(
            id,
            data.name,
            data.title,
            data.language,
            data.visualStyle,
            data.aspectRatio,
            data.storyInputMode,
            data.status || 'DRAFT'
        );

        return this.findById(id);
    }

    findById(id) {
        return db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    }

    findAll() {
        return db.prepare('SELECT * FROM projects ORDER BY createdAt DESC').all();
    }

    update(id, data) {
        const setClause = [];
        const values = [];
        
        for (const [key, value] of Object.entries(data)) {
            if (key !== 'id' && key !== 'createdAt') {
                setClause.push(`${key} = ?`);
                values.push(value);
            }
        }
        
        if (setClause.length === 0) return this.findById(id);

        setClause.push("updatedAt = CURRENT_TIMESTAMP");
        values.push(id);

        const stmt = db.prepare(`UPDATE projects SET ${setClause.join(', ')} WHERE id = ?`);
        stmt.run(...values);

        return this.findById(id);
    }

    delete(id) {
        db.prepare('DELETE FROM projects WHERE id = ?').run(id);
        return true;
    }
}

module.exports = new ProjectRepository();
