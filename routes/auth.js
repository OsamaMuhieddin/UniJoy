const express = require('express');
const { body, param } = require('express-validator');

const isAuth = require('../middleware/is-auth');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

// POST /auth/signup
router.post(
  '/signup',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address')
      .custom((value) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              'E-Mail exists already, please pick a different one.'
            );
          }
        });
      })
      .normalizeEmail(),
    body(
      'password',
      'please enter a password of only numbers and text and contains at least 6 charachters.'
    )
      .isLength({ min: 6 })
      .isAlphanumeric()
      .withMessage('Password must be at least 6 characters long'),
    body('name')
      .not()
      .isEmpty()
      .isLength({ min: 3 })
      .isAlphanumeric()
      .withMessage('Name is required'),
    body('role')
      .isIn(['user', 'host'])
      .withMessage('Role must be either user or host'),
    body('hostCategory')
      .if(body('role').equals('host'))
      .isLength({ min: 3 })
      .notEmpty()
      .withMessage('Host category is required for hosts'),

    body('profileInfo')
      .if(body('role').equals('host'))
      .isLength({ min: 6 })
      .notEmpty()
      .withMessage('Profile info is required for hosts'),
  ],
  authController.signUp
);

// POST /auth/login
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address.')
      .normalizeEmail(),
    body('password', 'Password has to be valid.')
      .trim()
      .isLength({ min: 6 })
      .isAlphanumeric(),
  ],
  authController.login
);

// POST /auth/reset-password
router.post(
  '/reset-password',
  [body('email').isEmail().withMessage('Please enter a valid email')],
  authController.postReset
);

// POST /auth/new-password
router.post(
  '/new-password',
  [
    body('password')
      .trim()
      .isLength({ min: 6 })
      .isAlphanumeric()
      .withMessage('Password must be at least 6 characters long'),
    body('token').notEmpty().withMessage('Reset token is required'),
  ],
  authController.postNewPassword
);

module.exports = router;
