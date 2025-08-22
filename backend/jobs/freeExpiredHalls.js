const mongoose = require('mongoose');
const cron = require('node-cron');
const Event = require('../models/event');
const Hall = require('../models/hall');
const HallReservation = require('../models/hallReservation');

// Run every hour to free up halls whose reservations have expired
cron.schedule('0 * * * *', () => {
  console.log('Running hall freeing job...');

  const now = new Date();

  HallReservation.find({ endDate: { $lt: now } })
    .then((expiredReservations) => {
      const expiredReservationIds = expiredReservations.map((r) => r._id);
      const affectedHallIds = expiredReservations.map((r) => r.hall);

      // Delete expired reservations
      return HallReservation.deleteMany({
        _id: { $in: expiredReservationIds },
      }).then(() => {
        // For each affected hall, check if it still has active/future reservations
        return Promise.all(
          affectedHallIds.map((hallId) => {
            return HallReservation.findOne({
              hall: hallId,
              endDate: { $gte: now },
            }).then((stillReserved) => {
              if (!stillReserved) {
                return Hall.findByIdAndUpdate(hallId, {
                  status: 'available',
                });
              }
            });
          })
        );
      });
    })
    .then(() => {
      console.log('Expired hall reservations cleaned up.');
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      console.error('Error in freeing expired halls:', err);
    });
});
