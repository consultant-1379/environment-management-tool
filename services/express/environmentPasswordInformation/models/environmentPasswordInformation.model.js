const mongoose = require('mongoose');

const environmentPasswordInformationSchema = new mongoose.Schema({
  environmentName: String,
  lmsPassword: String,
  wlvmPassword: String,
});

module.exports = mongoose.model('environmentPasswordInformation', environmentPasswordInformationSchema);
