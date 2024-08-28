const TimePeriodModel = require('../models/timePeriod.model');
const TimerModel = require('../../timers/models/timer.model');
const logger = require('./../../logger/logger');

/**
 * timePeriod.controller.js
 *
 * @description :: Server-side logic for managing time periods.
 */
module.exports = {

  list(req, res) {
    const pathInfo = 'GET /time-periods';
    TimePeriodModel.find((err, timePeriods) => {
      if (err) {
        logger.error(pathInfo, 'Error when getting time periods.', err);
        return res.status(500).json({
          message: 'Error when getting time periods.',
          error: err,
        });
      }
      return res.json(timePeriods);
    });
  },

  fetchById(req, res) {
    const pathInfo = 'GET /time-periods/:id';
    const { id } = req.params;
    TimePeriodModel.findById(id, (err, timePeriod) => {
      if (err) {
        logger.error(pathInfo, 'No time period exists with the given time period ID', err);
        return res.status(500).json({
          message: 'Error. No time period exists with the given time period ID',
          error: err,
        });
      }
      return res.json(timePeriod);
    });
  },

  create(req, res) {
    const pathInfo = 'POST /time-periods';
    const hours = (req.body.durationHours !== undefined) ? req.body.durationHours : 0;
    const minutes = (req.body.durationMinutes !== undefined) ? req.body.durationMinutes : 0;
    const timePeriod = new TimePeriodModel({
      durationHours: hours,
      durationMinutes: minutes,
      timerId: null,
    });

    timePeriod.save((err) => {
      if (err) {
        logger.error(pathInfo, 'Error when creating time period', err);
        return res.status(500).json({
          message: 'Error when creating time period',
          error: err,
        });
      }
      return res.status(201).json(timePeriod);
    });
  },

  update(req, res) {
    const pathInfo = 'PUT /time-periods/update/:id';
    const { id } = req.params;
    TimePeriodModel.findOne({ _id: id }, (timePeriodErr, timePeriod) => {
      if (timePeriodErr) {
        logger.error({ path: pathInfo }, 'Error when getting time period', timePeriodErr);
        return res.status(500).json({
          message: 'Error when getting time period',
          error: timePeriodErr,
        });
      }
      if (!timePeriod) {
        logger.error({ path: pathInfo }, `${id} does not correspond to a known time period`);
        return res.status(404).json({
          message: `${id} does not correspond to a known time period`,
        });
      }

      timePeriod.durationHours = req.body.period.durationHours;
      timePeriod.durationMinutes = req.body.period.durationMinutes;

      timePeriod.save((saveTimePeriodErr, timePeriodObj) => {
        if (saveTimePeriodErr) {
          logger.error({ path: pathInfo }, 'Error when updating time period', saveTimePeriodErr);
          return res.status(500).json({
            message: 'Error when updating time period',
            error: saveTimePeriodErr,
          });
        }
        return res.json(timePeriodObj);
      });
    });
  },

  start(req, res) {
    const pathInfo = 'PUT /time-periods/:id';
    const { id } = req.params;

    TimePeriodModel.findOne({ _id: id }, (err, timePeriod) => {
      if (err) {
        logger.error({ path: pathInfo }, 'Error when getting time period', err);
        return res.status(500).json({
          message: 'Error when getting time period',
          error: err,
        });
      }

      if (timePeriod.timerId != null) {
        logger.info({ path: pathInfo }, 'Time period has already started timer');
        return res.status(202).json({
          message: 'Time Period has already started timer',
        });
      }

      const currentDate = new Date();
      currentDate.setHours(currentDate.getHours() + timePeriod.durationHours);
      currentDate.setMinutes(currentDate.getMinutes() + timePeriod.durationMinutes);
      const timer = new TimerModel({
        startTime: new Date(),
        endTime: currentDate,
        hasTeamBeenNotified: false,
      });

      timer.save((saveTimerErr) => {
        if (saveTimerErr) {
          logger.error({ path: pathInfo }, 'Error when creating timer', saveTimerErr);
          return res.status(500).json({
            message: 'Error when creating timer',
            error: saveTimerErr,
          });
        }
      });

      timePeriod.timerId = timer._id;
      timePeriod.save((saveTimePeriodErr) => {
        if (saveTimePeriodErr) {
          logger.error({ path: pathInfo }, 'Error when saving time period', saveTimePeriodErr);
          return res.status(500).json({
            message: 'Error when saving time period',
            error: saveTimePeriodErr,
          });
        }
      });
      return res.status(201).json(timePeriod);
    });
  },

  remove(req, res) {
    const pathInfo = 'DELETE /time-periods/:id';
    const { id } = req.params;
    TimePeriodModel.findByIdAndRemove(id, (err) => {
      if (err) {
        logger.error({ path: pathInfo }, 'Error when deleting the time period.', err);
        return res.status(500).json({
          message: 'Error when deleting the time period.',
          error: err,
        });
      }
      return res.status(204).json();
    });
  },
};
