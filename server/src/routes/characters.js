const express = require('express');
const router = express.Router();
const charactersController = require('../controllers/characters');

// GET and POST for a specific project's characters will be handled via the projects router
// e.g., /api/projects/:projectId/characters

router.get('/:characterId', charactersController.getCharacterById);
router.put('/:characterId', charactersController.updateCharacter);
router.delete('/:characterId', charactersController.deleteCharacter);

module.exports = router;
