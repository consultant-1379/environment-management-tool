const { EventEmitter } = require('events');
const timePeriodModel = require('../models/timePeriod.model');
const timePeriodEvents = require('../../sessions/eventHandlers/session.events');
const logger = require('./../../logger/logger');

const timePeriodEmitter = timePeriodEvents.eventEmitter;
const eventEmitter = new EventEmitter();

function findAndRemove(timerId, eventToEmit) {
  const logMessage = 'EVENTS findAndRemove';
  timePeriodModel.find({}, (err, timePeriods) => {
    timePeriods.forEach((timePeriod) => {
      if (String(timePeriod.timerId) === String(timerId)) {
        timePeriodModel.findByIdAndRemove(timePeriod._id, (error) => {
          if (error) {
            logger.error(logMessage, `Error when trying to find time period ${timePeriod._id}`, error);
            return false;
          }
          timePeriodEmitter.emit(eventToEmit, timePeriod._id);
          logger.info(logMessage, 'Successfully removed time period', timePeriod._id);
          return true;
        });
      }
    });
  });
}

eventEmitter.on('TimerExpired', (timerId) => {
  findAndRemove(timerId, 'TimePeriodExpired');
});

eventEmitter.on('TimerAboutToExpire', (timerId) => {
  timePeriodModel.find({}, (err, timePeriods) => {
    timePeriods.forEach((timePeriod) => {
      if (String(timePeriod.timerId) === String(timerId)) {
        timePeriodEmitter.emit('TimerAboutToExpire', timePeriod._id);
      }
    });
  });
});

exports.eventEmitter = eventEmitter;
