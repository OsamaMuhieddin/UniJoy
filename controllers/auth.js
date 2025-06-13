const { validationResult } = require('express-validator');

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const User = require('../models/user');

// Setup transporter with SendGrid, reading API key from env
const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY, // API key stored in environment variable
    },
  })
);

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
    const error = new Error(
      'Host category and profile info are required for host accounts.'
    );
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

exports.postReset = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }

  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      err.statusCode = 500;
      return next(err);
    }

    const token = buffer.toString('hex'); // Generate secure reset token

    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          const error = new Error('No account with that email found.');
          error.statusCode = 404;
          throw error;
        }

        // Set reset token and expiration on user document
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000; // 1 hour expiry

        return user.save();
      })
      .then(() => {
        // Send password reset email
        return transporter.sendMail({
          to: req.body.email,
          from: 'osama.tm.royale@gmail.com',
          subject: 'Password Reset Request',
          html: `
            <p>You requested a password reset</p>
            <p>Click this <a href="http://localhost:3000/reset-password/${token}">link</a> to set a new password.</p> /
            <p>If you did not request this, please ignore this email.</p>
          `,
        }); //front end domain
      })
      .then(() => {
        res.status(200).json({ message: 'Password reset email sent.' });
      })
      .catch((err) => {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
      });
  });
};

exports.postNewPassword = (req, res, next) => {
  // Validate new password and token in request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }

  const newPassword = req.body.password;
  const passwordToken = req.body.token;

  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() }, // Token not expired
  })
    .then((user) => {
      if (!user) {
        const error = new Error('Invalid or expired token.');
        error.statusCode = 400;
        throw error;
      }
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      // Update password and clear reset fields
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(() => {
      res
        .status(200)
        .json({ message: 'Password has been reset successfully.' });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};
