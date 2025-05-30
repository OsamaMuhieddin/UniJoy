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
  let currentEvent; // Will hold the event after finding it

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
      // If no hall is reserved for this event,
      // just approve the event without hall reservation
      if (!event.hall) {
        event.status = 'approved';
        return event.save().then((savedEvent) => {
          res.status(200).json({
            message: 'Event approved (no hall reservation needed)',
            event: savedEvent,
          });
          return null;
        });
      }
      // Check if the requested hall is free for the event's time slot
      return checkReservationConflict(
        event.hall,
        event.startDate,
        event.endDate,
        event._id
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

      // Now check capacity vs hall capacity before reserving hall
      return Hall.findById(currentEvent.hall).then((hall) => {
        if (!currentEvent.hall) {
          // Hall not set - already approved earlier
          return currentEvent;
        }

        if (!hall) {
          const error = new Error('Associated hall not found');
          error.statusCode = 404;
          throw error;
        }

        if (currentEvent.capacity > hall.capacity) {
          const error = new Error(
            `Event capacity (${currentEvent.capacity}) exceeds hall capacity (${hall.capacity}).`
          );
          error.statusCode = 422;
          throw error;
        }

        // Remove any existing reservation linked to this event (important for updates)
        return HallReservation.findOneAndDelete({
          event: currentEvent._id,
        }).then(() => {
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
          const hallUpdatePromise =
            hall.status === 'available'
              ? (() => {
                  hall.status = 'reserved';
                  return hall.save();
                })()
              : Promise.resolve();

          return Promise.all([
            reservation.save(),
            hallUpdatePromise,
            currentEvent.save(),
          ]);
        });
      });
    })
    .then((result) => {
      // Don’t respond again if early return was triggered
      if (result === null) return;

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
        .then(async (hall) => {
          if (!hall) {
            const error = new Error('Associated hall not found');
            error.statusCode = 404;
            throw error;
          }

          //Check if other reservations exist before freeing hall
          const otherReservations = await HallReservation.find({
            hall: hall._id,
            status: 'reserved',
            event: { $ne: eventId },
          });

          if (otherReservations.length === 0 && hall.status === 'reserved') {
            hall.status = 'available';
            await hall.save();
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
        message:
          'Event rejected and hall freed if reserved with no other reservations',
        event: currentEvent,
      });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};
