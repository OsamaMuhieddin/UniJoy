const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HostCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HostCategory', HostCategorySchema);
