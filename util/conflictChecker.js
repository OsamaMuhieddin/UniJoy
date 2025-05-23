const HallReservation = require('../models/hallReservation');
const mongoose = require('mongoose');

exports.checkReservationConflict = (
  hallId,
  startDate,
  endDate,
  excludeReservationId
) => {
  const query = {
    hall: new mongoose.Types.ObjectId(hallId),
    status: 'reserved', // Only check active reservations
    $or: [
      { startDate: { $lt: endDate }, endDate: { $gt: startDate } }, // overlap check
    ],
  };

  if (excludeReservationId) {
    query._id = { $ne: new mongoose.Types.ObjectId(excludeReservationId) };
  }

  return HallReservation.findOne(query);
};
