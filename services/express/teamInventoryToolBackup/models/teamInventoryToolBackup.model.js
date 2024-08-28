const mongoose = require('mongoose');

const teamInventoryToolBackup = new mongoose.Schema({
  size: Number,
  name: String,
  items: Array,
});

module.exports = mongoose.model('teamInventoryToolBackup', teamInventoryToolBackup);
