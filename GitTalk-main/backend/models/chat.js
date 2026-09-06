const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    repoId: {
      type: String,
      required: true,
      index: true   // fast repo-based queries
    },

    userQuery: {
      type: String,
      required: true
    },

    botAnswer: {
      type: String,
      required: true
    },

    referencedFiles: [
      {
        type: String
      }
    ],

    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
