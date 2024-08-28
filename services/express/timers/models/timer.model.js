const mongoose = require('mongoose');

const timerSchema = new mongoose.Schema({
  startTime: Date,
  endTime: Date,
  hasTeamBeenNotified: Boolean,
});

module.exports = mongoose.model('timer', timerSchema);
