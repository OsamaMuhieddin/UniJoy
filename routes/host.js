const express = require('express');
const { body } = require('express-validator');

const hostController = require('../controllers/host');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

//GET /host/events
router.get('/events', isAuth, hostController.getHostEvents);

//POST /host/events
router.post(
  '/events',
  isAuth,
  [
    body('title')
      .trim()
      .isLength({ min: 5 })
      .withMessage('Title must be at least 5 characters long'),

    body('description')
      .trim()
      .isLength({ min: 10 })
      .withMessage('Description must be at least 10 characters long'),

    body('date')
      .trim()
      .custom((value) => {
        const parsed = Date.parse(value);
        if (isNaN(parsed)) {
          throw new Error('Invalid date format');
        }
        return true;
      }),

    body('time')
      .trim()
      .custom((value) => {
        const timeParts = value.split(':');
        if (
          timeParts.length !== 2 ||
          isNaN(timeParts[0]) ||
          isNaN(timeParts[1]) ||
          parseInt(timeParts[0]) < 0 ||
          parseInt(timeParts[0]) > 23 ||
          parseInt(timeParts[1]) < 0 ||
          parseInt(timeParts[1]) > 59
        ) {
          throw new Error('Invalid time format');
        }
        return true;
      }),

    body('capacity')
      .trim()
      .isInt({ min: 1 })
      .withMessage('Capacity must be a positive integer'),

    body('price')
      .optional()
      .trim()
      .isFloat({ min: 0 })
      .withMessage('Price must be a non-negative number'),

    body('location')
      .trim()
      .isLength({ min: 3 })
      .withMessage('Location must be at least 3 characters long'),

    body('hall').optional().trim(),

    body('category')
      .trim()
      .notEmpty()
      .withMessage('Category must not be empty'),
  ],
  hostController.createEvent
);

// GET /host/events/:eventId
router.get('/events/:eventId', isAuth, hostController.getHostEvent);

//PUT /host/events/:eventId
router.put(
  '/events/:eventId',
  isAuth,
  [
    body('title')
      .trim()
      .isLength({ min: 5 })
      .withMessage('Title must be at least 5 characters long'),

    body('description')
      .trim()
      .isLength({ min: 10 })
      .withMessage('Description must be at least 10 characters long'),

    body('date')
      .trim()
      .custom((value) => {
        const parsed = Date.parse(value);
        if (isNaN(parsed)) {
          throw new Error('Invalid date format');
        }
        return true;
      }),

    body('time')
      .trim()
      .custom((value) => {
        const timeParts = value.split(':');
        if (
          timeParts.length !== 2 ||
          isNaN(timeParts[0]) ||
          isNaN(timeParts[1]) ||
          parseInt(timeParts[0]) < 0 ||
          parseInt(timeParts[0]) > 23 ||
          parseInt(timeParts[1]) < 0 ||
          parseInt(timeParts[1]) > 59
        ) {
          throw new Error('Invalid time format');
        }
        return true;
      }),

    body('capacity')
      .trim()
      .isInt({ min: 1 })
      .withMessage('Capacity must be a positive integer'),

    body('price')
      .optional()
      .trim()
      .isFloat({ min: 0 })
      .withMessage('Price must be a non-negative number'),

    body('location')
      .trim()
      .isLength({ min: 3 })
      .withMessage('Location must be at least 3 characters long'),

    body('hall').optional().trim(),

    body('category')
      .trim()
      .notEmpty()
      .withMessage('Category must not be empty'),
  ],
  hostController.updateEvent
);

//DELETE /host/events/:eventId
router.delete('/events/:eventId', isAuth, hostController.deleteEvent);

module.exports = router;
