const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HallSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    capacity: { type: Number, required: true },
    status: { type: String, enum: ['available', 'reserved'], default: 'available' }, 
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hall', HallSchema);
