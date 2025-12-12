const mongoose = require('mongoose');

const learningContentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: String, required: true },
  videoUrl: { type: String, default: '' },
  thumbnail: { type: String, default: '' },
  order: { type: Number, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const learningPhaseSchema = new mongoose.Schema({
  phaseId: { type: String, required: true, unique: true }, // 'beginner', 'trader', 'pro-trader', 'master-trader'
  title: { type: String, required: true }, // 'Phase 1: Beginner', etc.
  subtitle: { type: String, required: true }, // 'Foundation course for new traders'
  content: [learningContentSchema],
  price: { type: Number, default: 999 }, // Default price
  originalPrice: { type: Number, default: 1999 }, // Default original price
  currency: { type: String, default: '₹' }, // Default currency
  isActive: { type: Boolean, default: true },
  order: { type: Number, required: true } // 1, 2, 3, 4
}, { timestamps: true });

module.exports = mongoose.model('LearningPhase', learningPhaseSchema); 