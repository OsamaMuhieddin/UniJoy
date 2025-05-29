const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const Event = require('../models/event');
const User = require('../models/user');
const Hall = require('../models/hall');
const HostCategory = require('../models/hostCategory');
const HallReservation = require('../models/hallReservation');
const { checkReservationConflict } = require('../util/conflictChecker');

exports.manageHostApproval = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }

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

      if (user.role !== 'host') {
        const error = new Error(
          'User is not a host and cannot have host status updated.'
        );
        error.statusCode = 400;
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

exports.approveEvent = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }

  if (req.userRole !== 'admin') {
    const error = new Error('Not authorized. Only admins can approve events.');
    error.statusCode = 403;
    return next(error);
  }

  const eventId = req.params.eventId;
  let currentEvent; // Will store the event document for later use

  Event.findById(eventId)
    .then((event) => {
      if (!event) {
        const error = new Error('Event not found');
        error.statusCode = 404;
        throw error;
      }
      if (event.status === 'approved') {
        const error = new Error('Event is already approved');
        error.statusCode = 400;
        throw error;
      }

      currentEvent = event;

      if (!event.hall) {
        // If no hall is reserved for this event,
        // just approve the event without hall reservation
        event.status = 'approved';
        return event.save();
      }

      // Check if the requested hall is free for the event's time slot
      return checkReservationConflict(
        event.hall,
        event.startDate,
        event.endDate,
        currentEvent._id
      );
    })
    .then((conflict) => {
      if (conflict) {
        // Conflict found - the hall is already reserved for the overlapping time
        const error = new Error(
          'Hall is already reserved for the requested time range'
        );
        error.statusCode = 409; // Conflict
        throw error;
      }

      if (!currentEvent.hall) {
        // If no hall (handled in previous step), return event directly
        return currentEvent;
      }

      // Remove any existing reservation linked to this event (important for updates)
      return HallReservation.findOneAndDelete({ event: currentEvent._id }).then(
        () => {
          // Create a new hall reservation for the event
          const reservation = new HallReservation({
            hall: currentEvent.hall,
            event: currentEvent._id,
            startDate: currentEvent.startDate,
            endDate: currentEvent.endDate,
            status: 'reserved',
          });

          currentEvent.status = 'approved';

          // Update hall status and save all changes
          return Promise.all([
            reservation.save(),
            Hall.findById(currentEvent.hall).then((hall) => {
              if (!hall) {
                const error = new Error('Associated hall not found');
                error.statusCode = 404;
                throw error;
              }
              hall.status = 'reserved';
              return hall.save();
            }),
            currentEvent.save(),
          ]);
        }
      );
    })
    .then(() => {
      res.status(200).json({
        message: 'Event approved and hall reserved',
        event: currentEvent,
      });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

exports.rejectEvent = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }

  if (req.userRole !== 'admin') {
    const error = new Error('Not authorized. Only admins can reject events.');
    error.statusCode = 403;
    return next(error);
  }

  const eventId = req.params.eventId;
  let currentEvent; // to store the event document

  Event.findById(eventId)
    .then((event) => {
      if (!event) {
        const error = new Error('Event not found');
        error.statusCode = 404;
        throw error;
      }

      if (event.status === 'rejected') {
        const error = new Error('Event is already rejected');
        error.statusCode = 400;
        throw error;
      }

      currentEvent = event;

      // If event is not approved yet or no hall reserved,
      // just update status and save (no reservation to cancel)
      if (!event.hall || event.status !== 'approved') {
        currentEvent.status = 'rejected';
        return currentEvent.save();
      }

      // Event was approved and hall reserved, so delete reservation and free hall
      return HallReservation.findOneAndDelete({ event: eventId })
        .then(() => Hall.findById(event.hall))
        .then((hall) => {
          if (!hall) {
            const error = new Error('Associated hall not found');
            error.statusCode = 404;
            throw error;
          }

          if (hall.status === 'reserved') {
            hall.status = 'available';
            return hall.save();
          }
        })
        .then(() => {
          currentEvent.status = 'rejected';
          currentEvent.hall = null; // optional
          return currentEvent.save();
        });
    })
    .then(() => {
      res.status(200).json({
        message: 'Event rejected and hall freed if reserved',
        event: currentEvent,
      });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};
