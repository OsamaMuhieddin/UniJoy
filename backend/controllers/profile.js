const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const User = require('../models/user');

exports.getProfile = (req, res, next) => {
  const userId = req.userId;

  User.findById(userId)
    .select('-password') // Don't send password
    .then((user) => {
      if (!user) {
        const error = new Error('User not found.');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: 'Profile fetched', user });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

exports.updateProfile = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }
  const userId = req.userId;
  const userRole = req.userRole;

  // Build update data based on role
  let updateData = {
    name: req.body.name,
    email: req.body.email,
  };

  if (userRole === 'host') {
    updateData.profileInfo = req.body.profileInfo;
    updateData.hostCategory = req.body.hostCategory;
  }

  // For users and admins, only name and email updated here

  User.findByIdAndUpdate(userId, { $set: updateData }, { new: true })
    .select('-password')
    .then((updatedUser) => {
      if (!updatedUser) {
        const error = new Error('User not found.');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        message: 'Profile updated successfully',
        user: updatedUser,
      });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};
