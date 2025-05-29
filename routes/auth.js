const express = require('express');
const { body, param } = require('express-validator');

const isAuth = require('../middleware/is-auth');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

// POST /signup
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
    body('name').not().isEmpty().withMessage('Name is required'),
    body('role')
      .isIn(['user', 'host'])
      .withMessage('Role must be either user or host'),
  ],
  authController.signUp
);

// POST /login
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address.')
      .normalizeEmail(),
    body('password', 'Password has to be valid.')
      .isLength({ min: 6 })
      .isAlphanumeric()
      .trim(),
  ],
  authController.login
);

module.exports = router;
