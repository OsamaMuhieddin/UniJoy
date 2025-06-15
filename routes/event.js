const express = require('express');

const isAuth = require('../middleware/is-auth');

const eventController = require('../controllers/event');

const router = express.Router();
// Public routes for events
// GET /events?page=1&perPage=10&type=upcoming  - get all approved events
router.get('/', eventController.getAllEvents);

// GET /events/:eventId - get a single approved event
router.get('/:eventId', eventController.getSingleEvent);

// GET /events/:eventId/invoice
router.get('/:eventId/invoice', isAuth, eventController.getInvoice);

module.exports = router;
