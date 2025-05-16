const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const Event = require('../models/event');
const User = require('../models/user');
const Hall = require('../models/hall');

exports.getHostEvents = (req, res, next) => {
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
        const error = new Error('Not Autherized');
        error.statusCode = 403;
        throw error;
      }
      const event = new Event({
        title: title,
        description: description,
        date: date,
        time: time,
        image: image,
        capacity: capacity,
        price: price,
        location: location,
        host: host,
        hall: hall,
        category: category,
      });

      return event.save();
    })
    .then((event) => {
      if (hall) {
        return Hall.findById(hall).then((hall) => {
          if (hall) {
            hall.status = 'reserved';
            return hall.save();
          }
        });
      }
      return event;
    })
    .then((result) => {
      res.status(201).json({
        message: 'Event created successfully!',
        event: result,
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
  const capacity = req.body.capacity;
  const location = req.body.location;
  const price = req.body.price;
  const hall = req.body.hall;
  const category = req.body.category;
  let image = req.file.path;
  if (req.file) {
    image = req.file.path;
  }
  if (!image) {
    const error = new Error('No file picked');
    error.statusCode = 422;
    throw error;
  }
  Event.findById(eventId)
    .then((event) => {
      if (!event) {
        const error = new Error('Could not find event');
        error.statusCode = 404;
        throw error;
      }
      if (image !== event.image) {
        clearImage(event.image);
      }
      event.title = title;
      event.image = image;
      event.description = description;
      event.date = new Date(date);
      event.time = time;
      event.capacity = capacity;
      event.location = location;
      event.price = price || 0;
      event.category = category;
      if (hall) {
        if (event.hall && event.hall.toString() !== hall.toString()) {
          // If the hall is being changed, reset the old hall status and update the new hall
          return Hall.findById(event.hall)
            .then((oldHall) => {
              if (oldHall) {
                oldHall.status = 'available'; // Set old hall as available
                return oldHall.save();
              }
            })
            .then(() => {
              event.hall = hall; // Set new hall for event
              return Hall.findById(hall);
            })
            .then((newHall) => {
              if (newHall) {
                newHall.status = 'reserved'; // Set new hall as reserved
                return newHall.save();
              }
            })
            .then(() => {
              return event.save();
            })
            .catch((err) => {
              const error = new Error('Error updating hall status');
              error.statusCode = 500;
              throw error;
            });
        } else {
          event.hall = hall;
          return event.save();
        }
      }
      return event.save();
    })
    .then((result) => {
      res.status(200).json({ message: 'Event Updated', event: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deleteEvent = (req, res, next) => {
  const eventId = req.params.eventId;
  Post.findById(eventId)
    .then((event) => {
      if (!event) {
        const error = new Error('Could not find event!');
        error.statusCode = 404;
        throw error;
      }
      if (event.host.toString() !== req.userId || req.userRole !== 'admin') {
        const error = new Error('Not authorized to delete this event');
        error.statusCode = 403;
        throw error;
      }
      if (event.hall) {
        return Hall.findById(event.hall)
          .then((hall) => {
            if (hall) {
              hall.status = 'available';
              return hall.save();
            }
          })
          .then(() => {
            clearImage(event.image);
            return Event.findByIdAndDelete(eventId);
          });
      } else {
        clearImage(event.image);
        return Event.findByIdAndDelete(eventId);
      }
    })
    .then((result) => {
      console.log(result);
      res.status(200).json({ message: 'Event deleted successfully' });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, (err) => {
    console.log(err);
  });
};
