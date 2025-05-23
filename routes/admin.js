const express = require('express');
const { body, param } = require('express-validator');

const isAuth = require('../middleware/is-auth');

const adminController = require('../controllers/admin');
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
  [param('eventId').isMongoId().withMessage('Invalid event ID')],
  adminController.approveEvent
);

// PATCH /admin/events/:eventId/reject
router.patch(
  '/events/:eventId/reject',
  [param('eventId').isMongoId().withMessage('Invalid event ID')],
  adminController.rejectEvent
);

module.exports = router;
