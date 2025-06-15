const express = require('express');
const { body, param } = require('express-validator');

const userController = require('../controllers/user');

const isAuth = require('../middleware/is-auth');

const router = express.Router();

// POST /users/me/events/:eventId/register
router.post(
  '/me/events/:eventId/register',
  isAuth,
  [param('eventId').isMongoId().withMessage('Invalid event ID')],
  userController.registerForEvent
);

// POST /users/me/events/:eventId/confirm
router.post(
  '/me/events/:eventId/confirm',
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

// DELETE /user/me/events/:eventId/unregister
router.delete(
  '/me/events/:eventId/unregister',
  isAuth,
  [param('eventId').isMongoId().withMessage('Invalid event ID')],
  userController.unregisterForEvent
);

// GET /users/me/registered-events?page=1&perPage=5&type=upcoming
router.get(
  '/me/registered-events',
  isAuth, // Auth middleware that populates req.userId and req.userRole
  userController.getUserRegisteredEvents
);

// GET /users/me/registered-events/:eventId
router.get(
  '/me/registered-events/:eventId',
  isAuth,
  userController.getUserRegisteredEvent
);

module.exports = router;
