const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startDate: { type: Date, required: true }, // hall reservation start
    endDate: { type: Date, required: true }, // hall reservation end
    time: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    capacity: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    location: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hall: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hall',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HostCategory',
      required: true,
    },
    registeredUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', EventSchema);
