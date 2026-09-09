const db = require('../db');
const { v4: uuidv4 } = require('uuid');

class CharacterRepository {
    create(data) {
        const id = uuidv4();
        const stmt = db.prepare(`
            INSERT INTO characters (
                id, projectId, name, description, appearanceLock
            ) VALUES (?, ?, ?, ?, ?)
        `);
        
        stmt.run(
            id,
            data.projectId,
            data.name,
            data.description,
            data.appearanceLock
        );

        return this.findById(id);
    }

    findById(id) {
        return db.prepare('SELECT * FROM characters WHERE id = ?').get(id);
    }

    findByProjectId(projectId) {
        return db.prepare('SELECT * FROM characters WHERE projectId = ?').all(projectId);
    }

    update(id, data) {
        const setClause = [];
        const values = [];
        
        for (const [key, value] of Object.entries(data)) {
            if (key !== 'id' && key !== 'projectId') {
                setClause.push(`${key} = ?`);
                values.push(value);
            }
        }
        
        if (setClause.length === 0) return this.findById(id);

        values.push(id);

        const stmt = db.prepare(`UPDATE characters SET ${setClause.join(', ')} WHERE id = ?`);
        stmt.run(...values);

        return this.findById(id);
    }

    delete(id) {
        db.prepare('DELETE FROM characters WHERE id = ?').run(id);
        return true;
    }
}

module.exports = new CharacterRepository();
