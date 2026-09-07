const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema(
  {
    time: {
      type: Date,
      default: Date.now,
    },

    type: {
      type: String,
      enum: ['document', 'review', 'login', 'approval'],
      required: true,
    },

    text: {
      type: String,
      required: true,
    },

    accessedBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Audit', auditSchema);