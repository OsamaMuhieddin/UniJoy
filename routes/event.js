const express = require('express');
const router = express.Router();

const eventController = require('../controllers/event');

// Public routes for events
// GET /events  - get all approved events
router.get('/', eventController.getAllEvents);

// GET /events/:eventId - get a single approved event
router.get('/:eventId', eventController.getSingleEvent);

module.exports = router;
