const express = require('express');
const router = express.Router();
const scenesController = require('../controllers/scenes');

// Note: GET /api/projects/:projectId/scenes and POST /api/projects/:projectId/scenes 
// are handled in the projects router.

router.get('/:sceneId', scenesController.getSceneById);
router.put('/:sceneId', scenesController.updateScene);
router.delete('/:sceneId', scenesController.deleteScene);

module.exports = router;
