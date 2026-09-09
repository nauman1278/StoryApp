const express = require('express');
const router = express.Router();
const projectsController = require('../controllers/projects');
const scenesController = require('../controllers/scenes');

router.get('/', projectsController.getProjects);
router.post('/', projectsController.createProject);
router.get('/:id', projectsController.getProjectById);
router.put('/:id', projectsController.updateProject);
router.delete('/:id', projectsController.deleteProject);

// Nested scene routes
router.get('/:projectId/scenes', scenesController.getProjectScenes);
router.post('/:projectId/scenes', scenesController.createScene);
router.post('/:projectId/scenes/extract', scenesController.extractScenes);

// Nested character routes
const charactersController = require('../controllers/characters');
router.get('/:projectId/characters', charactersController.getProjectCharacters);
router.post('/:projectId/characters', charactersController.createCharacter);
router.post('/:projectId/characters/extract', charactersController.extractCharacters);

// Prompt generation routes
const promptsController = require('../controllers/prompts');
router.post('/:projectId/scenes/:sceneId/prompt', promptsController.generateScenePrompt);
router.post('/:projectId/prompts/generate-all', promptsController.generateAllPrompts);

// Image upload route
const imagesController = require('../controllers/images');
router.post('/:projectId/scenes/:sceneId/image', imagesController.uploadMiddleware, imagesController.uploadSceneImage);

// Render routes
const renderController = require('../controllers/render');
router.post('/:projectId/render/audio', renderController.renderAudio);
router.post('/:projectId/render/video', renderController.renderVideo);

module.exports = router;
