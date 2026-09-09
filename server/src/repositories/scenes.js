const db = require('../db');
const { v4: uuidv4 } = require('uuid');

class SceneRepository {
    create(data) {
        const id = uuidv4();
        const stmt = db.prepare(`
            INSERT INTO scenes (
                id, projectId, sceneNumber, title, script, status
            ) VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        stmt.run(
            id,
            data.projectId,
            data.sceneNumber,
            data.title || `Scene ${data.sceneNumber}`,
            data.script,
            data.status || 'DRAFT'
        );

        return this.findById(id);
    }

    findById(id) {
        return db.prepare('SELECT * FROM scenes WHERE id = ?').get(id);
    }

    findByProjectId(projectId) {
        return db.prepare('SELECT * FROM scenes WHERE projectId = ? ORDER BY sceneNumber ASC').all(projectId);
    }

    update(id, data) {
        const setClause = [];
        const values = [];
        
        for (const [key, value] of Object.entries(data)) {
            if (key !== 'id' && key !== 'projectId' && key !== 'createdAt') {
                setClause.push(`${key} = ?`);
                values.push(value);
            }
        }
        
        if (setClause.length === 0) return this.findById(id);

        setClause.push("updatedAt = CURRENT_TIMESTAMP");
        values.push(id);

        const stmt = db.prepare(`UPDATE scenes SET ${setClause.join(', ')} WHERE id = ?`);
        stmt.run(...values);

        return this.findById(id);
    }

    delete(id) {
        db.prepare('DELETE FROM scenes WHERE id = ?').run(id);
        return true;
    }
}

module.exports = new SceneRepository();
