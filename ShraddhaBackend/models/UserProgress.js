const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  completedContent: {
    type: Map,
    of: Boolean,
    default: {}
  },
  videoProgress: {
    type: Map,
    of: Number,
    default: {}
  },
  unlockedPhases: {
    type: [String],
    default: ['beginner']
  },
  currentPhase: {
    type: String,
    default: 'beginner'
  }
}, { timestamps: true });

module.exports = mongoose.model('UserProgress', userProgressSchema); 