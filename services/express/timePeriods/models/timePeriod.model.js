const mongoose = require('mongoose');

const timePeriodSchema = new mongoose.Schema({
  durationHours: Number,
  durationMinutes: Number,
  timerId: mongoose.Schema.ObjectId,
});

module.exports = mongoose.model('timePeriod', timePeriodSchema);
