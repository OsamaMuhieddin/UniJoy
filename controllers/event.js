const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');
const { checkReservationConflict } = require('../util/conflictChecker');

const Event = require('../models/event');
const User = require('../models/user');
const Hall = require('../models/hall');
const HallReservation = require('../models/hallReservation');

exports.getHostEvents = (req, res, next) => {
  if (req.userRole !== 'host') {
    const error = new Error(
      'Not authorized. Only hosts can view their events.'
    );
    error.statusCode = 403;
    return next(error);
  }

  const currentPage = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 2;

  let totalItems;

  Event.find({ host: req.userId })
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Event.find({ host: req.userId })
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((events) => {
      res.status(200).json({
        message: 'Fetched events successfully',
        events: events,
        totalItems: totalItems,
      });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

exports.createEvent = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file) {
      clearImage(req.file.path);
    }
    const error = new Error('Valdation failed, Entered data is incorrect');
    error.statusCode = 422;
    throw error;
  }
  if (!req.file) {
    const error = new Error('No Image Provided!');
    error.statusCode = 422;
    throw error;
  }

  const image = req.file.path;
  const title = req.body.title;
  const description = req.body.description;
  const date = req.body.date;
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;
  const time = req.body.time;
  const capacity = req.body.capacity;
  let price = req.body.price || 0.0;
  const location = req.body.location;
  const hall = req.body.hall;
  const category = req.body.category;

  const host = req.userId;
  User.findById(host)
    .then((user) => {
      if (!user || (user.role !== 'host' && user.role !== 'admin')) {
        const error = new Error(
          'Not authorized. Only hosts or admins can create events.'
        );
        error.statusCode = 403;
        throw error;
      }

      // If hall specified, check if there is any approved event conflicting for the same hall/time
      if (hall) {
        return Event.findOne({
          hall: hall,
          status: 'approved',
          $or: [
            {
              startDate: { $lt: new Date(endDate), $gte: new Date(startDate) },
            },
            {
              endDate: { $gt: new Date(startDate), $lte: new Date(endDate) },
            },
            {
              startDate: { $lte: new Date(startDate) },
              endDate: { $gte: new Date(endDate) },
            },
          ],
        }).then((conflict) => {
          if (conflict) {
            const error = new Error(
              'Hall is already reserved for the selected time.'
            );
            error.statusCode = 409; // Conflict
            throw error;
          }
          return user;
        });
      }
      // No hall or no conflicts, proceed
      return user;
    })
    .then(() => {
      const event = new Event({
        title: title,
        description: description,
        date: date,
        startDate: startDate,
        endDate: endDate,
        time: time,
        image: image,
        capacity: capacity,
        price: price,
        location: location,
        host: host,
        hall: hall || null, // only set if present
        category: category,
        status: 'pending',
      });

      return event.save();
    })
    .then((event) => {
      // Hall is NOT reserved on creation — reservation happens on admin approval
      // So just return the saved event
      res.status(201).json({
        message: 'Event created successfully! Pending admin approval.',
        event: event,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getHostEvent = (req, res, next) => {
  const eventId = req.params.eventId;

  Event.findById(eventId)
    .then((event) => {
      if (!event) {
        const error = new Error('Could not find event');
        error.statusCode = 404;
        throw error;
      }

      if (req.userRole !== 'admin' && event.host.toString() !== req.userId) {
        const error = new Error('Not authorized to access this event');
        error.statusCode = 403;
        throw error;
      }

      res.status(200).json({ message: 'Event fetched!', event: event });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updateEvent = (req, res, next) => {
  const eventId = req.params.eventId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect');
    error.statusCode = 422;
    throw error;
  }

  const title = req.body.title;
  const description = req.body.description;
  const date = req.body.date;
  const time = req.body.time;
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;
  const capacity = req.body.capacity;
  const location = req.body.location;
  const price = req.body.price;
  const hall = req.body.hall;
  const category = req.body.category;
  let image;
  if (req.file) {
    image = req.file.path;
  }

  let eventDoc;
  Event.findById(eventId)
    .then((event) => {
      if (!event) {
        const error = new Error('Could not find event');
        error.statusCode = 404;
        throw error;
      }
      if (!image && !event.image) {
        const error = new Error('No file picked');
        error.statusCode = 422;
        throw error;
      }

      // Role check: must be host or admin
      if (event.host.toString() !== req.userId && req.userRole !== 'admin') {
        const error = new Error('Not authorized to update this event.');
        error.statusCode = 403;
        throw error;
      }
      eventDoc = event;
      // Check if hall or time changed, then check for conflicts
      const hallChanged =
        hall && (!event.hall || event.hall.toString() !== hall.toString());
      const startDateChanged =
        req.body.startDate &&
        new Date(req.body.startDate).getTime() !== event.startDate.getTime();
      const endDateChanged =
        req.body.endDate &&
        new Date(req.body.endDate).getTime() !== event.endDate.getTime();

      if (hallChanged || startDateChanged || endDateChanged) {
        // Check for reservation conflict excluding current event reservation
        return checkReservationConflict(
          hall,
          new Date(req.body.startDate),
          new Date(req.body.endDate),
          event._id //exclude current event from check
        ).then((conflict) => {
          if (conflict) {
            const error = new Error(
              'Hall is already reserved for the selected time.'
            );
            error.statusCode = 409;
            throw error;
          }
          return true;
        });
      }
      return true;
    })
    .then(() => {
      // Update image if changed
      if (image) {
        clearImage(eventDoc.image);
        eventDoc.image = image;
      }
      // Update fields
      eventDoc.title = title;
      eventDoc.description = description;
      eventDoc.date = new Date(date);
      eventDoc.time = time;
      eventDoc.capacity = capacity;
      eventDoc.location = location;
      eventDoc.price = price || 0;
      eventDoc.category = category;

      // If hall or time changed and event was approved, revert to pending and delete previous reservation
      const hallChanged =
        hall &&
        (!eventDoc.hall || eventDoc.hall.toString() !== hall.toString());
      const startDateChanged =
        req.body.startDate &&
        new Date(req.body.startDate).getTime() !== eventDoc.startDate.getTime();
      const endDateChanged =
        req.body.endDate &&
        new Date(req.body.endDate).getTime() !== eventDoc.endDate.getTime();

      // If hall/time changed and event was approved, mark as pending and delete reservation
      if (hallChanged || startDateChanged || endDateChanged) {
        if (eventDoc.status === 'approved') {
          eventDoc.status = 'pending'; // Revert for re-approval
          // Remove previous hall reservation if exists
          return HallReservation.findOneAndDelete({ event: eventDoc._id })
            .then(() => {
              // Only free old hall if no other reservation exists for it
              if (eventDoc.hall) {
                return HallReservation.findOne({
                  hall: eventDoc.hall,
                  status: 'reserved',
                  event: { $ne: eventDoc._id },
                }).then((otherReservation) => {
                  if (!otherReservation) {
                    return Hall.findById(eventDoc.hall).then((oldHall) => {
                      if (oldHall) {
                        oldHall.status = 'available';
                        return oldHall.save();
                      }
                    });
                  }
                });
              }
            })
            .then(() => {
              // Update hall and reservation dates
              eventDoc.hall = hall || null;
              eventDoc.startDate = new Date(startDate);
              eventDoc.endDate = new Date(endDate);
              return eventDoc.save();
            });
        } else {
          // Not approved: just update hall and dates
          eventDoc.hall = hall || null;
          eventDoc.startDate = new Date(startDate);
          eventDoc.endDate = new Date(endDate);
          return eventDoc.save();
        }
      }

      // No hall/date/time change: just save
      return eventDoc.save();
    })
    .then((result) => {
      res.status(200).json({
        message: 'Event updated successfully.',
        event: result,
      });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

exports.deleteEvent = (req, res, next) => {
  const eventId = req.params.eventId;

  let eventDoc;
  Event.findById(eventId)
    .then((event) => {
      if (!event) {
        const error = new Error('Could not find event!');
        error.statusCode = 404;
        throw error;
      }
      if (event.host.toString() !== req.userId && req.userRole !== 'admin') {
        const error = new Error('Not authorized to delete this event.');
        error.statusCode = 403;
        throw error;
      }
      eventDoc = event;

      // Delete associated hall reservation if it exists
      return HallReservation.findOneAndDelete({ event: event._id });
    })
    .then((reservation) => {
      if (reservation) {
        return HallReservation.find({
          hall: reservation.hall,
          status: 'reserved',
          event: { $ne: reservation.event },
        }).then((otherReservations) => {
          if (otherReservations.length === 0) {
            // No other reservations exist, free the hall
            return Hall.findById(reservation.hall).then((hall) => {
              if (hall) {
                hall.status = 'available';
                return hall.save();
              }
            });
          }
          // Other reservations exist, do not free hall
          return Promise.resolve();
        });
      }
    })
    .then(() => {
      clearImage(eventDoc.image);

      return Event.findByIdAndDelete(eventId);
    })
    .then(() => {
      res.status(200).json({ message: 'Event deleted successfully.' });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, (err) => {
    console.log(err);
  });
};
