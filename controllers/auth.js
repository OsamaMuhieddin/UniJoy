const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signUp = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    errors.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  const role = req.body.role;
  const hostCategory = req.body.hostCategory;
  const profileInfo = req.body.profileInfo;

  if (role !== 'user' && role !== 'host') {
    const error = new Error('Invalid role');
    error.statusCode = 400;
    throw error;
  }

   if (role === 'host' && (!hostCategory || !profileInfo)) {
    const error = new Error('Host category and profile info are required for host accounts.');
    error.statusCode = 400;
    throw error;
  }

  bcrypt
    .hash(password, 12)
    .then((hashedPw) => {
      const user = new User({
        email: email,
        password: hashedPw,
        name: name,
        role: role,
        hostStatus: role === 'host' ? 'pending' : undefined,
        hostCategory: role === 'host' ? hostCategory : undefined,
        profileInfo: role === 'host' ? profileInfo : undefined,
      });
      return user.save();
    })
    .then((result) => {
      if (result.role === 'host') {
        res.status(201).json({
          message: 'Host created, awaiting approval',
          userId: result._id,
        });
      } else {
        res.status(201).json({
          message: 'User created successfully',
          userId: result._id,
        });
      }
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.login = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }

  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        const error = new Error('A user with this email could not be found');
        error.statusCode = 401;
        throw error;
      }
      loadedUser = user;

      // Check if the host is approved (only for hosts)
      if (user.role === 'host' && user.hostStatus !== 'approved') {
        const error = new Error('Host is not approved yet');
        error.statusCode = 401;
        throw error;
      }

      return bcrypt.compare(password, user.password);
    })

    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error('Wrong password');
        error.statusCode = 401;
        throw error;
      }

      // Sign JWT token and include userId and role
      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString(),
          role: loadedUser.role,
        },
        'somesecret',
        { expiresIn: '1h' }
      );
      res.status(200).json({
        token: token,
        userId: loadedUser._id.toString(),
        role: loadedUser.role,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
