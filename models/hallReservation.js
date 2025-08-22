const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hallReservationSchema = new Schema(
  {
    hall: { type: mongoose.Schema.Types.ObjectId, ref: 'Hall', required: true },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['reserved', 'cancelled'],
      default: 'reserved',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HallReservation', hallReservationSchema);
