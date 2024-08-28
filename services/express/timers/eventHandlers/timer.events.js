const cron = require('node-cron');
const moment = require('moment-timezone');
const timerModel = require('../models/timer.model');
const timerPeriodEvents = require('../../timePeriods/eventHandlers/timePeriod.events');
const logger = require('./../../logger/logger');

const timerPeriodEmitter = timerPeriodEvents.eventEmitter;


cron.schedule('0,30 * * * * *', () => {
  const logMessage = 'EVENTS timerExpired';
  timerModel.find({}, (err, result) => {
    result.forEach((timer) => {
      const currentDate = new Date();
      const thirtyMinsFromNow = moment(currentDate).add(30, 'm').toDate();
      const startMoment = moment(timer.startTime);
      const endMoment = moment(timer.endTime);
      const differenceInMinutes = endMoment.diff(startMoment, 'minutes');
      if (timer.endTime < currentDate) {
        logger.info(logMessage, `The timer ${timer._id} has expired! Removing it.`);
        timerModel.findByIdAndRemove(timer._id, (findErr) => {
          if (findErr) {
            logger.error(logMessage, `Error in removing ${timer._id}`, findErr);
          } else {
            logger.info(logMessage, `${timer._id} has been removed successfully.`);
          }
        });
        timerPeriodEmitter.emit('TimerExpired', timer._id);
      } else if ((timer.endTime < thirtyMinsFromNow) && (timer.hasTeamBeenNotified === false) && (differenceInMinutes > 59)) {
        timer.hasTeamBeenNotified = true;
        timerModel.findByIdAndUpdate(timer._id, timer, (findErr) => {
          if (findErr) {
            logger.error(logMessage, `Error in updating ${timer._id}`, findErr);
          } else {
            logger.info(logMessage, `${timer._id} has been updated successfully.`);
          }
        });
        logger.info(logMessage, `The timer ${timer._id} is about to expire! Notifying teams.`);
        timerPeriodEmitter.emit('TimerAboutToExpire', timer._id);
      }
    });
  });
});
