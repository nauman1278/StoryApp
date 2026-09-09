const express = require('express');
const router = express.Router();
const voicesController = require('../controllers/voices');

router.get('/', voicesController.getVoices);
router.post('/preview', voicesController.previewVoice);

module.exports = router;
