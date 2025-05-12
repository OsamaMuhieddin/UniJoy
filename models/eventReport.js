const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//optional
const eventReportSchema = new Schema(
  {
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EventReport', EventReportSchema);
