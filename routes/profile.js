const express = require('express');
const { body } = require('express-validator');
const profileController = require('../controllers/profile');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// GET /profile
router.get('/', isAuth, profileController.getProfile);

// PUT /profile
router.put(
  '/',
  isAuth,
  [
    body('name')
      .trim()
      .isLength({ min: 2 })
      .withMessage('Name must be at least 2 characters long'),
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail(),

    // For host role, additional optional fields validation
    body('profileInfo')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Profile info must be less than 500 characters'),

    body('hostCategory')
      .optional()
      .isMongoId()
      .withMessage('Invalid host category ID'),
  ],
  profileController.updateProfile
);

module.exports = router;
