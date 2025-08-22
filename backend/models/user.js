const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'host', 'admin'],
      default: 'user',
      required: true,
    },
    profileInfo: {
      type: String,
    },
    hostStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    registeredEvents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
      },
    ],
    createdEvents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
      },
    ],
    hostCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HostCategory',
    },
    resetToken: String,
    resetTokenExpiration: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
