const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: String,
  imageUrl: String,
  email: { type: String, required: true }, // Add user email
  userId: { type: String, required: true }, // Add user ID
  status: { type: String, default: 'pending' },
  rejectionReason: { type: String, default: undefined }, // Add rejection reason field with default
}, { timestamps: true });

const applicationByDateSchema = new mongoose.Schema({
  date: String, // Format: 'YYYY-MM-DD'
  applications: [applicationSchema],
});

module.exports = mongoose.model('ApplicationByDate', applicationByDateSchema);
