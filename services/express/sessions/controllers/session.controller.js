const queryString = require('querystring');
const mongoMask = require('mongo-mask');
const diff = require('./../../utils/diff');
const logger = require('./../../logger/logger');
const SessionModel = require('../models/session.model');
const exporter = require('./../../exporter');

/**
 * session.controller.js
 *
 * @description :: Server-side logic for creating session.
 */
module.exports = {

  list(req, res) {
    const pathInfo = 'GET /sessions';
    SessionModel.find((err, Sessions) => {
      if (err) {
        logger.error(pathInfo, 'Error when getting sessions.', err);
        return res.status(500).json({
          message: 'Error when getting sessions.',
          error: err,
        });
      }
      return res.json(Sessions);
    });
  },

  create(req, res) {
    const pathInfo = 'POST /sessions';
    const sessionToAdd = req.body.session ? req.body.session : req.body;
    if (req.body.username === undefined || req.body.username === '' || req.body.username.toUpperCase() === 'ANONYMOUS') {
      return res.status(412).json({
        message: 'Username is not specified',
      });
    }
    const { username } = req.body;
    const loggingTags = { path: pathInfo, environment: sessionToAdd.deploymentName, username };
    const session = new SessionModel({
      deploymentId: sessionToAdd.deploymentId,
      deploymentName: sessionToAdd.deploymentName,
      assignedTeam: sessionToAdd.assignedTeam,
      teamEmail: sessionToAdd.teamEmail,
      assignedUserNames: sessionToAdd.assignedUserNames,
      assignedUserEmails: sessionToAdd.assignedUserEmails,
      days: sessionToAdd.days,
      hours: sessionToAdd.hours,
      sessionUsername: sessionToAdd.sessionUsername,
      sessionPassword: sessionToAdd.sessionPassword,
      minutes: sessionToAdd.minutes,
      jira: sessionToAdd.jira,
      username,
      createUserOnWlvm: sessionToAdd.createUserOnWlvm,
    });
    exporter.teamSessionCounters(sessionToAdd.assignedTeam);
    exporter.userSessionCounters(sessionToAdd.assignedUserNames);
    session.save((err, createdSession) => {
      if (err) {
        logger.error(loggingTags, 'Error when creating session.', err);
        return res.status(500).json({
          message: 'Error when creating session',
          error: err,
        });
      }
      loggingTags.changes = createdSession;
      logger.info(loggingTags, `${username} successfully created session`, createdSession);
      return res.status(201).json(createdSession);
    });
  },

  update: (req, res) => {
    const pathInfo = 'PUT /sessions/:id';
    const { id } = req.params;
    const sessionToEdit = req.body.session ? req.body.session : req.body;
    if (req.body.username === undefined || req.body.username === '' || req.body.username.toUpperCase() === 'ANONYMOUS') {
      return res.status(412).json({
        message: 'Username is not specified',
      });
    }
    const { username } = req.body;
    const loggingTags = { path: pathInfo, signum: username };
    SessionModel.findOne({ _id: id }, (err, session) => {
      if (err) {
        logger.error(loggingTags, 'Error when finding session to update.', err);
        return res.status(500).json({
          message: 'Error when finding session to update',
          error: err,
        });
      }

      if (!session) {
        logger.error(loggingTags, `${id} does not correspond to a known session`);
        return res.status(404).json({
          message: `${id} does not correspond to a known session`,
        });
      }

      const tempSessionObject = JSON.parse(JSON.stringify(session));
      session.deploymentId = sessionToEdit.deploymentId ? sessionToEdit.deploymentId : session.deploymentId;
      session.deploymentName = sessionToEdit.deploymentName ? sessionToEdit.deploymentName : session.deploymentName;
      session.assignedTeam = sessionToEdit.assignedTeam ? sessionToEdit.assignedTeam : session.assignedTeam;
      session.assignedUserNames = sessionToEdit.assignedUserNames ? sessionToEdit.assignedUserNames : session.assignedUserNames;
      session.assignedUserEmails = sessionToEdit.assignedUserEmails ? sessionToEdit.assignedUserEmails : session.assignedUserEmails;
      session.teamEmail = sessionToEdit.teamEmail ? sessionToEdit.teamEmail : session.teamEmail;
      session.days = sessionToEdit.days ? sessionToEdit.days : session.days;
      session.hours = sessionToEdit.hours ? sessionToEdit.hours : session.hours;
      session.minutes = sessionToEdit.minutes ? sessionToEdit.minutes : session.minutes;
      session.status = sessionToEdit.status ? sessionToEdit.status : session.status;
      session.timePeriodId = sessionToEdit.timePeriodId ? sessionToEdit.timePeriodId : session.timePeriodId;
      session.startTime = sessionToEdit.startTime ? sessionToEdit.startTime : session.startTime;
      session.endTime = sessionToEdit.endTime ? sessionToEdit.endTime : session.endTime;
      session.jira = sessionToEdit.jira ? sessionToEdit.jira : session.jira;
      session.sessionUsername = sessionToEdit.sessionUsername ? sessionToEdit.sessionUsername : session.sessionUsername;
      session.sessionPassword = sessionToEdit.sessionPassword ? sessionToEdit.sessionPassword : session.sessionPassword;
      session.createUserOnWlvm = sessionToEdit.createUserOnWlvm !== undefined
        ? sessionToEdit.createUserOnWlvm : false;
      const diffSession = diff.createDiffObject(tempSessionObject, session);
      loggingTags.environment = session.deploymentName;
      loggingTags.changes = diffSession;
      session.save((saveError) => {
        if (saveError) {
          logger.error(pathInfo, 'Error when updating session', saveError);
          return res.status(500).json({
            message: 'Error updating session',
            error: saveError,
          });
        }
      });
      logger.info(loggingTags, `${username} successfully updated session`);
      return res.json(session);
    });
  },

  search: (req, res) => {
    const pathInfo = 'GET /sessions/search/:searchCriteria';
    let query;
    const queryRequest = req.query.q;
    if (queryRequest) {
      // this will be changed with the implementation of url encoding
      // this is will mean we are more aligned with DITs way of working
      // RTD-2229
      if (queryRequest instanceof Array) {
        let queryBuilder = '';
        for (let count = 0; count < queryRequest.length; count += 1) {
          if (queryBuilder) queryBuilder += '&';
          queryBuilder += queryRequest[count];
        }
        query = queryString.parse(queryBuilder);
      } else {
        query = queryString.parse(queryRequest);
      }
    }

    let fields = null;
    if (req.query.fields) {
      fields = mongoMask(req.query.fields, {});
    }

    SessionModel.find(query).select(fields).exec((err, session) => {
      if (err) {
        logger.error(pathInfo, 'Error when searching for session', err);
        return res.status(500).json({
          message: 'Error when searching for session',
          error: err,
        });
      }
      return res.json(session);
    });
  },

  remove(req, res) {
    const pathInfo = 'DELETE /sessions/:id';
    const { id } = req.params;
    if (req.query.username === undefined || req.query.username === '' || req.query.username.toUpperCase() === 'ANONYMOUS') {
      return res.status(412).json({
        message: 'Username is not specified',
      });
    }
    const { username } = req.query;
    SessionModel.findByIdAndRemove(id, (err) => {
      if (err) {
        logger.error(pathInfo, 'Error when deleting session', err);
        return res.status(500).json({
          message: 'Error when deleting session.',
          error: err,
        });
      }
      logger.info(pathInfo, `${username} successfully deleted session`, id);
      return res.status(204).json();
    });
  },
};
