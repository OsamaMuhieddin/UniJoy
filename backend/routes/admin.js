const express = require('express');
const { body, param } = require('express-validator');

const isAuth = require('../middleware/is-auth');

const adminController = require('../controllers/admin');
const eventController = require('../controllers/event');

const User = require('../models/user');

const router = express.Router();

// PATCH /admin/hosts/:hostId/status
router.patch(
  '/hosts/:hostId/status',
  [
    isAuth,
    param('hostId').isMongoId().withMessage('Invalid host ID'),
    body('hostStatus')
      .trim()
      .isIn(['approved', 'rejected', 'pending'])
      .withMessage(
        'Invalid host status. It must be one of the following: approved, rejected, pending'
      ),
  ],
  adminController.manageHostApproval
);

// PATCH /admin/events/:eventId/approve
router.patch(
  '/events/:eventId/approve',
  isAuth,
  [param('eventId').isMongoId().withMessage('Invalid event ID')],
  adminController.approveEvent
);

// PATCH /admin/events/:eventId/reject
router.patch(
  '/events/:eventId/reject',
  isAuth,
  [param('eventId').isMongoId().withMessage('Invalid event ID')],
  adminController.rejectEvent
);

// GET /admin/users
router.get('/users', isAuth, adminController.getAllUsers);

// DELETE /admin/users/:userId
router.delete(
  '/users/:userId',
  isAuth,
  param('userId').isMongoId().withMessage('Invalid user ID'),
  adminController.deleteUser
);

// GET /admin/events?page=1&perPage=10&type=upcoming //or past - get all events regardless of status
router.get('/events', isAuth, eventController.getAllEvents);

// GET /admin/events/:eventId
router.get('/events/:eventId', isAuth, eventController.getSingleEvent);

module.exports = router;
