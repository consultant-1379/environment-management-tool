const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  deploymentId: String,
  deploymentName: String,
  assignedTeam: [String],
  teamEmail: [String],
  assignedUserNames: [String],
  assignedUserEmails: [String],
  days: Number,
  hours: Number,
  minutes: Number,
  sessionUsername: Object,
  sessionPassword: Object,
  status:
    {
      type: String,
      default: 'created',
    },
  timePeriodId: String,
  startTime: Date,
  endTime: Date,
  jira: [String],
  username: String,
  createUserOnWlvm: Boolean,
});

module.exports = mongoose.model('Session', sessionSchema);
