const express = require('express');
const { body, param } = require('express-validator');

const userController = require('../controllers/user');

const isAuth = require('../middleware/is-auth');

const router = express.Router();

// POST /user/events/:eventId/register
router.post(
  '/events/:eventId/register',
  isAuth,
  [param('eventId').isMongoId().withMessage('Invalid event ID')],
  userController.registerForEvent
);

// POST /user/events/:eventId/confirm
router.post(
  '/events/:eventId/confirm',
  isAuth,
  [
    param('eventId').isMongoId().withMessage('Invalid event ID'),
    body('paymentIntentId')
      .optional()
      .isString()
      .withMessage('Invalid paymentIntentId'),
  ],
  userController.confirmRegistration
);

// DELETE /user/events/:eventId/unregister
router.delete(
  '/events/:eventId/unregister',
  isAuth,
  [param('eventId').isMongoId().withMessage('Invalid event ID')],
  userController.unregisterForEvent
);

// GET /user/registered-events?page=1&perPage=5
router.get(
  '/registered-events',
  isAuth,
  userController.getUserRegisteredEvents
);

// GET /user/registered-events/:eventId
router.get(
  '/registered-events/:eventId',
  isAuth,
  userController.getUserRegisteredEvent
);

module.exports = router;
