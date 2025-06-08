const fs = require('fs');
const path = require('path');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Stripe secret key
const { validationResult } = require('express-validator');

const Event = require('../models/event');
const User = require('../models/user');
const Payment = require('../models/payment');

exports.registerForEvent = (req, res, next) => {
  const eventId = req.params.eventId;
  const userId = req.userId;

  // Only Users can register
  if (req.userRole !== 'user') {
    const error = new Error('Only users can register for events');
    error.statusCode = 403;
    return next(error);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, incorrect data.');
    error.statusCode = 422;
    return next(error);
  }

  Event.findById(eventId)
    .then((event) => {
      if (!event) {
        const error = new Error('Event not found');
        error.statusCode = 404;
        throw error;
      }

      if (event.status !== 'approved') {
        const error = new Error('Cannot register: event is not approved');
        error.statusCode = 400;
        throw error;
      }

      // Prevent registration if event has already started
      if (new Date() > new Date(event.startDate)) {
        const error = new Error(
          'Registration closed: event has already started'
        );
        error.statusCode = 400;
        throw error;
      }

      // Prevent duplicate registration
      if (event.registeredUsers.includes(userId)) {
        const error = new Error('User already registered for this event');
        error.statusCode = 409;
        throw error;
      }

      // Check if event capacity is full
      if (event.registeredUsers.length >= event.capacity) {
        const error = new Error('Event is fully booked');
        error.statusCode = 409;
        throw error;
      }

      // FREE event: Register directly
      if (!event.price || event.price === 0) {
        return User.findById(userId)
          .then((user) => {
            if (!user) {
              const error = new Error('User not found');
              error.statusCode = 404;
              throw error;
            }

            const userUpdate = user.registeredEvents.includes(event._id)
              ? Promise.resolve()
              : user.updateOne({ $addToSet: { registeredEvents: event._id } });

            const eventUpdate = event.updateOne({
              $addToSet: { registeredUsers: userId },
            });

            return Promise.all([userUpdate, eventUpdate]);
          })
          .then(() => {
            return res
              .status(200)
              .json({ message: 'Successfully registered for free event' });
          });
      }

      // PAID event: Create Stripe Checkout Session
      return stripe.checkout.sessions
        .create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: event.title,
                  description: event.description,
                },
                unit_amount: event.price * 100, // Stripe uses cents
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: `${req.protocol}://${req.get('host')}/payment-success?eventId=${eventId}`,
          cancel_url: `${req.protocol}://${req.get('host')}/payment-cancel`,
          metadata: {
            eventId,
            userId,
          },
        })
        .then((session) => {
          // Save payment with status pending
          const payment = new Payment({
            user: userId,
            event: eventId,
            stripeSessionId: session.id,
            amount: event.price,
            status: 'pending',
          });

          return payment.save().then(() => {
            return res
              .status(200)
              .json({ sessionId: session.id, url: session.url });
          });
        });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

exports.confirmRegistration = (req, res, next) => {
  const eventId = req.params.eventId;
  const userId = req.userId;

  if (req.userRole !== 'user') {
    const error = new Error('Only users can confirm registration');
    error.statusCode = 403;
    return next(error);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }

  Event.findById(eventId)
    .then((event) => {
      if (!event) {
        const error = new Error('Event not found');
        error.statusCode = 404;
        throw error;
      }

      if (event.status !== 'approved') {
        const error = new Error('Cannot register: event is not approved');
        error.statusCode = 400; // or 403 Forbidden
        throw error;
      }

      // Prevent confirmation if event start date has passed
      if (new Date() > new Date(event.startDate)) {
        const error = new Error(
          'Cannot confirm registration: event has already started'
        );
        error.statusCode = 400;
        throw error;
      }

      if (event.registeredUsers.includes(userId)) {
        return res.status(200).json({ message: 'User already registered' });
      }

      if (event.registeredUsers.length >= event.capacity) {
        const error = new Error('Event is fully booked');
        error.statusCode = 409;
        throw error;
      }

      // Update payment record (if exists)
      const paymentIntentId = req.body.paymentIntentId || null;

      return Payment.findOneAndUpdate(
        { user: userId, event: eventId, status: 'pending' },
        { status: 'completed', stripePaymentIntentId: paymentIntentId },
        { new: true }
      )
        .then((payment) => {
          if (!payment) {
            const error = new Error(
              'No pending payment found for this user/event'
            );
            error.statusCode = 404;
            throw error;
          }

          //Add event to user and user to event
          return Promise.all([
            User.updateOne(
              { _id: userId },
              { $addToSet: { registeredEvents: eventId } }
            ),
            Event.updateOne(
              { _id: eventId },
              { $addToSet: { registeredUsers: userId } }
            ),
          ]);
        })
        .then(() => {
          res
            .status(200)
            .json({ message: 'Registration confirmed successfully' });
        });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

exports.unregisterForEvent = async (req, res, next) => {
  const eventId = req.params.eventId;
  const userId = req.userId;

  try {
    // Only users can unregister
    if (req.userRole !== 'user') {
      const error = new Error('Only users can unregister');
      error.statusCode = 403;
      throw error;
    }

    // Load event
    const event = await Event.findById(eventId);
    if (!event) {
      const error = new Error('Event not found');
      error.statusCode = 404;
      throw error;
    }

    if (event.status !== 'approved') {
      const error = new Error('Cannot unregister: event is not approved');
      error.statusCode = 400; // or 403 Forbidden
      throw error;
    }

    // Prevent unregistering if event end date has passed
    if (new Date() > new Date(event.endDate)) {
      const error = new Error('Cannot unregister: event has already ended');
      error.statusCode = 400;
      throw error;
    }

    // Check if user is actually registered for this event
    const isUserRegistered = event.registeredUsers.includes(userId);
    if (!isUserRegistered) {
      const error = new Error('You are not registered for this event');
      error.statusCode = 400;
      throw error;
    }

    // Determine if free event
    const isFreeEvent = !event.price || event.price === 0;

    // If event is free, just remove the user from lists and return
    if (isFreeEvent) {
      await Promise.all([
        Event.updateOne(
          { _id: eventId },
          { $pull: { registeredUsers: userId } }
        ),
        User.updateOne(
          { _id: userId },
          { $pull: { registeredEvents: eventId } }
        ),
      ]);
      return res
        .status(200)
        .json({ message: 'Successfully unregistered from free event' });
    }

    // Paid event: find completed payment
    const payment = await Payment.findOne({
      user: userId,
      event: eventId,
      status: 'completed',
    });

    if (!payment) {
      const error = new Error('Payment record not found or payment incomplete');
      error.statusCode = 404;
      throw error;
    }

    if (payment.status === 'refunded') {
      const error = new Error('This payment has already been refunded');
      error.statusCode = 400;
      throw error;
    }

    if (!payment.stripePaymentIntentId) {
      const error = new Error('No Stripe paymentIntentId found for refund');
      error.statusCode = 400;
      throw error;
    }

    // Issue refund via Stripe
    try {
      await stripe.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
        amount: payment.amount * 100,
      });
    } catch (stripeError) {
      const error = new Error('Stripe refund failed: ' + stripeError.message);
      error.statusCode = 500;
      throw error;
    }

    // Update payment status to refunded
    payment.status = 'refunded';
    await payment.save();

    // Remove user/event association
    await Promise.all([
      Event.updateOne({ _id: eventId }, { $pull: { registeredUsers: userId } }),
      User.updateOne({ _id: userId }, { $pull: { registeredEvents: eventId } }),
    ]);

    res.status(200).json({ message: 'Successfully unregistered and refunded' });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.getUserRegisteredEvents = (req, res, next) => {
  if (req.userRole !== 'user') {
    const error = new Error(
      'Not authorized. Only users can view their registered events.'
    );
    error.statusCode = 403;
    return next(error);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }

  const currentPage = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 2;
  const filterType = req.query.type; // 'upcoming' or 'past'
  const now = new Date();

  let totalItems;
  let registeredEventIds;

  //Get the user's registered event IDs
  User.findById(req.userId)
    .then((user) => {
      if (!user) {
        const error = new Error('User not found.');
        error.statusCode = 404;
        throw error;
      }

      registeredEventIds = user.registeredEvents;
      totalItems = registeredEventIds.length;

      if (totalItems === 0) {
        // No registered events, return empty response early
        return [];
      }

      // Build filter for Event.find()
      let filter = { _id: { $in: registeredEventIds }, status: 'approved' };

      if (filterType === 'upcoming') {
        filter.endDate = { $gte: now };
      } else if (filterType === 'past') {
        filter.endDate = { $lt: now };
      }

      return Event.find(filter)
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((events) => {
      res.status(200).json({
        message: 'Fetched registered events successfully',
        events: events,
        totalItems: totalItems,
        currentPage: currentPage,
        totalPages: Math.ceil(totalItems / perPage),
      });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

exports.getUserRegisteredEvent = (req, res, next) => {
  if (req.userRole !== 'user') {
    const error = new Error(
      'Not authorized. Only users can view their registered events.'
    );
    error.statusCode = 403;
    return next(error);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }

  const eventId = req.params.eventId;

  User.findById(req.userId)
    .then((user) => {
      if (!user) {
        const error = new Error('User not found.');
        error.statusCode = 404;
        throw error;
      }

      // Check if the eventId is in the user's registeredEvents array
      if (!user.registeredEvents.includes(eventId)) {
        const error = new Error('Not registered for this event.');
        error.statusCode = 403;
        throw error;
      }

      // Fetch the event details
      return Event.findById(eventId);
    })
    .then((event) => {
      if (!event) {
        const error = new Error('Event not found.');
        error.statusCode = 404;
        throw error;
      }

      res.status(200).json({
        message: 'Fetched registered event successfully',
        event: event,
      });
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};
