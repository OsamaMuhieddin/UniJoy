const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const Event = require('../models/event');
const User = require('../models/user');
const Hall = require('../models/hall');

exports.getHalls = (req, res, next) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  const skip = (page - 1) * limit;

  const shouldPaginate = !isNaN(page) && !isNaN(limit);

  let totalItems;

  const countPromise = shouldPaginate
    ? Hall.countDocuments()
    : Promise.resolve(null);

  countPromise
    .then((count) => {
      totalItems = count;
      const findQuery = Hall.find();

      if (shouldPaginate) {
        findQuery.skip(skip).limit(limit);
      }

      return findQuery;
    })
    .then((halls) => {
      res.status(200).json({
        message: 'Halls fetched successfully',
        halls: halls,
        totalItems: totalItems || halls.length,
        paginated: shouldPaginate,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.createHall = (req, res, next) => {
  if (req.userRole !== 'admin') {
    const error = new Error('Not authorized to create halls');
    error.statusCode = 403;
    throw error;
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect');
    error.statusCode = 422;
    throw error;
  }

  const name = req.body.name;
  const location = req.body.location;
  const capacity = req.body.capacity;

  const hall = new Hall({
    name: name,
    location: location,
    capacity: capacity,
  });
  hall
    .save()
    .then((result) => {
      res.status(201).json({
        message: 'Hall created successfully',
        hall: result,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getHall = (req, res, next) => {
  const hallId = req.params.hallId;
  Hall.findById(hallId)
    .then((hall) => {
      if (!hall) {
        const error = new Error('Could not find hall');
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: 'Hall fetched!', hall: hall });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updateHall = (req, res, next) => {
  const hallId = req.params.hallId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect');
    error.statusCode = 422;
    throw error;
  }

  const name = req.body.name;
  const location = req.body.location;
  const capacity = req.body.capacity;
  const status = req.body.status;

  let foundHall;

  Hall.findById(hallId)
    .then((hall) => {
      if (!hall) {
        const error = new Error('Could not find hall');
        error.statusCode = 404;
        throw error;
      }
      if (req.userRole !== 'admin') {
        const error = new Error('Not authorized to update this hall');
        error.statusCode = 403;
        throw error;
      }

      foundHall = hall;
      // If capacity is being reduced, check approved events only
      if (capacity < hall.capacity) {
        return Event.find({
          hall: hallId,
          status: 'approved',
          capacity: { $gt: capacity },
        }).then((conflictingEvents) => {
          if (conflictingEvents.length > 0) {
            const error = new Error(
              'Cannot reduce hall capacity. Some approved events exceed the new capacity.'
            );
            error.statusCode = 409;
            throw error;
          }
        });
      }
    })
    .then(() => {
      foundHall.name = name;
      foundHall.location = location;
      foundHall.capacity = capacity;
      if (status && ['available', 'reserved'].includes(status)) {
        foundHall.status = status;
      }
      return foundHall.save();
    })
    .then((updatedHall) => {
      res.status(200).json({
        message: 'Hall updated successfully',
        hall: updatedHall,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deleteHall = (req, res, next) => {
  const hallId = req.params.hallId;
  Hall.findById(hallId)
    .then((hall) => {
      if (!hall) {
        const error = new Error('Could not find hall!');
        error.statusCode = 404;
        throw error;
      }
      if (req.userRole !== 'admin') {
        const error = new Error('Not authorized to delete this hall');
        error.statusCode = 403;
        throw error;
      }

      // Check for approved events using this hall
      return Event.find({ hall: hallId, status: 'approved' }).then(
        (linkedEvents) => {
          if (linkedEvents.length > 0) {
            const error = new Error(
              'Cannot delete hall. It is linked to approved events.'
            );
            error.statusCode = 409;
            throw error;
          }

          // Safe to delete
          return Hall.findByIdAndDelete(hallId);
        }
      );
    })
    .then(() => {
      res.status(200).json({ message: 'Hall deleted successfully' });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
