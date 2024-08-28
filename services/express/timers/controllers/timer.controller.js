const moment = require('moment');
const TimerModel = require('../models/timer.model');
const timerEvents = require('../../timePeriods/eventHandlers/timePeriod.events');
const logger = require('./../../logger/logger');

const timerEmitter = timerEvents.eventEmitter;

/**
 * timer.controller.js
 *
 * @description :: Server-side logic for managing timers.
 */
module.exports = {

  create(req, res) {
    const pathInfo = 'POST /timer';
    const exprirationDate = new Date();
    const days = (req.body.durationDays !== undefined) ? req.body.durationDays : 0;
    const hours = (req.body.durationHours !== undefined) ? req.body.durationHours : 0;
    const minutes = (req.body.durationMinutes !== undefined) ? req.body.durationMinutes : 0;
    exprirationDate.setDate(exprirationDate.getDate() + days);
    exprirationDate.setHours(exprirationDate.getHours() + hours);
    exprirationDate.setMinutes(exprirationDate.getMinutes() + minutes);
    const timer = new TimerModel({
      startTime: new Date(),
      endTime: exprirationDate,
      hasTeamBeenNotified: false,
    });

    timer.save((err, timerObj) => {
      if (err) {
        logger.error(pathInfo, 'Error when creating timer', err);
        return res.status(500).json({
          message: 'Error when creating timer',
          error: err,
        });
      }
      logger.info(pathInfo, 'Successfully created timer', timerObj);
      return res.status(201).json(timerObj);
    });
  },

  update: (req, res) => {
    const pathInfo = 'PUT /timer/:id';
    const { id } = req.params;
    TimerModel.findOne({ _id: id }, (timerErr, timer) => {
      if (timerErr) {
        logger.error({ path: pathInfo }, 'Error when getting timer', timerErr);
        return res.status(500).json({
          message: 'Error when getting timer',
          error: timerErr,
        });
      }

      if (!timer) {
        logger.info({ path: pathInfo }, `${id} does not correspond to a known timer`);
        return res.status(404).json({
          message: `${id} does not correspond to a known timer`,
        });
      }

      const currentDate = new Date();
      timer.endTime = moment(currentDate).add(req.body.period.durationHours, 'h').add(req.body.period.durationMinutes, 'm').toDate();
      timer.save((saveTimerErr, timerObj) => {
        if (saveTimerErr) {
          logger.error({ path: pathInfo }, 'Error when updating timer', saveTimerErr);
          return res.status(500).json({
            message: 'Error when updating timer',
            error: saveTimerErr,
          });
        }
        return res.json(timerObj);
      });
    });
  },

  fetchById(req, res) {
    const pathInfo = 'GET /timer/:id';
    const { id } = req.params;
    TimerModel.findById(id, (err, timer) => {
      if (err) {
        logger.error(pathInfo, 'Error when getting timer', err);
        return res.status(500).json({
          message: 'Error. No timer exists with the given timer ID',
          error: err,
        });
      }
      return res.json(timer);
    });
  },

  remove(req, res) {
    const pathInfo = 'DELETE /timer/:id';
    const { id } = req.params;
    TimerModel.findByIdAndRemove(id, (err, timer) => {
      if (err) {
        logger.error({ path: pathInfo }, 'Error when deleting timer.', err);
        return res.status(500).json({
          message: 'Error when deleting the timer.',
          error: err,
        });
      }
      timerEmitter.emit('TimerExpired', id);
      return res.status(204).json(timer);
    });
  },
};
