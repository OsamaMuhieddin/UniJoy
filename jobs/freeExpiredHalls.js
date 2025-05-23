const mongoose = require('mongoose');
const cron = require('node-cron');
const Event = require('../models/event');
const Hall = require('../models/hall');
const HallReservation = require('../models/hallReservation');

//checking completed events to free halls automatically
// Run every hour
cron.schedule('0 * * * *', () => {
  console.log('Running hall freeing job...');

  const now = new Date();

  HallReservation.find({ endDate: { $lt: now } })
    .then((reservations) => {
      const hallIds = reservations.map((r) => r.hall);
      return Hall.updateMany(
        { _id: { $in: hallIds } },
        { $set: { status: 'available' } }
      ).then(() => {
        return HallReservation.deleteMany({
          _id: { $in: reservations.map((r) => r._id) },
        });
      });
    })
    .then(() => {
      console.log('Expired halls freed successfully.');
    })
    .catch((err) => {
      if (!err.statusCode) err.statusCode = 500;
      console.error('Error freeing halls:', err);
    });
});
