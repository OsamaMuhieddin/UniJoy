const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const Event = require('../models/event');
const User = require('../models/user');
const Hall = require('../models/hall');
const Hall = require('../models/hostCategory');
const Hall = require('../models/eventReport');

exports.manageHostApproval = (req, res, next) => {
  const hostId = req.params.hostId;
  const hostStatus = req.body.hostStatus;

  if (
    !hostId ||
    !hostStatus ||
    !['approved', 'rejected', 'pending'].includes(hostStatus)
  ) {
    const error = new Error(
      'Invalid input. Host ID or status is missing or incorrect.'
    );
    error.statusCode = 400;
    throw error;
  }

  // Ensure only a admin can approve/reject hosts
  if (req.userRole !== 'admin') {
    const error = new Error(
      'Not authorized. Only admins can approve or reject hosts.'
    );
    error.statusCode = 403;
    throw error;
  }

  User.findById(hostId)
    .then((user) => {
      if (!user) {
        const error = new Error('Host not found.');
        error.statusCode = 404;
        throw error;
      }

      user.hostStatus = hostStatus;

      return user.save();
    })
    .then((updatedUser) => {
      res.status(200).json({
        message: `Host status updated to ${hostStatus}`,
        user: updatedUser,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
