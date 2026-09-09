const express = require('express');
const router = express.Router();
const jobsController = require('../controllers/jobs');

router.get('/:jobId/events', jobsController.subscribeToJobEvents);

module.exports = router;
