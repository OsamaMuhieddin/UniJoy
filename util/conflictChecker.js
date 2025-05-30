const HallReservation = require('../models/hallReservation');
const mongoose = require('mongoose');
exports.checkReservationConflict = (
  hallId,
  startDate,
  endDate,
  excludeEventId
) => {
  const query = {
    $and: [
      { hall: new mongoose.Types.ObjectId(hallId) },
      { status: 'reserved' },
      {
        $or: [{ startDate: { $lt: endDate }, endDate: { $gt: startDate } }],
      },
    ],
  };

  if (excludeEventId) {
    query.$and.push({
      event: { $ne: new mongoose.Types.ObjectId(excludeEventId) },
    });
  }

  return HallReservation.findOne(query);
};
