const express = require('express');

const isAuth = require('../middleware/is-auth');
const reportController = require('../controllers/report');

const router = express.Router();

// GET /reports/event/:eventId
router.get('/event/:eventId', isAuth, reportController.generateEventReport);

module.exports = router;
