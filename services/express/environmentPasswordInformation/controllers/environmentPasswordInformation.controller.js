const logger = require('./../../logger/logger');
const EnvironmentPasswordInformationModel = require('../models/environmentPasswordInformation.model');
const DeploymentModel = require('../../deployments/models/deployment.model');

/**
 * environmentPasswordInformation.controller.js
 *
 * @description :: Server-side logic for managing the password environment information.
 */

function addOrEditEnvironmentPasswordInformationModel(res, req, environmentName, loggingTags) {
  EnvironmentPasswordInformationModel.findOne({ environmentName }, (findEnvironmentError, environmentPasswordInformation) => {
    if (findEnvironmentError) {
      logger.error(loggingTags, 'Error when getting environment password information', findEnvironmentError);
      return res.status(500).json({
        message: 'Error when getting environment password information',
        error: findEnvironmentError,
      });
    }

    if (!environmentPasswordInformation) {
      environmentPasswordInformation = new EnvironmentPasswordInformationModel({
        environmentName,
        lmsPassword: req.body.lmsPassword,
        wlvmPassword: req.body.wlvmPassword,
      });
    } else {
      environmentPasswordInformation.lmsPassword = req.body.lmsPassword ? req.body.lmsPassword : environmentPasswordInformation.lmsPassword;
      environmentPasswordInformation.wlvmPassword = req.body.wlvmPassword ? req.body.wlvmPassword : environmentPasswordInformation.wlvmPassword;
    }

    environmentPasswordInformation.save((saveError) => {
      if (saveError) {
        logger.error(loggingTags, 'Error when putting environment password information.', saveError);
        return res.status(500).json({
          message: 'Error when putting environment password information.',
          error: saveError,
        });
      }
      return res.status(200).json(environmentPasswordInformation);
    });
  });
}

module.exports = {

  fetchPasswordInformationByEnvironmentName: (req, res) => {
    const pathInfo = 'GET /environment-password-information/:environmentName';
    const { environmentName } = req.params;
    const loggingTags = { path: pathInfo, environment: environmentName };
    EnvironmentPasswordInformationModel.findOne({ environmentName }, (errorFindingEnvironmentPasswordInformation,
      environmentPasswordInformation) => {
      if (errorFindingEnvironmentPasswordInformation) {
        logger.error(loggingTags, 'Error getting environment password information.', errorFindingEnvironmentPasswordInformation);
        return res.status(500).json({
          message: 'Error getting environment password information.',
          error: errorFindingEnvironmentPasswordInformation,
        });
      }
      if (!environmentPasswordInformation) {
        logger.error(loggingTags, `${environmentName} does not have environment password information`);
        return res.status(404).json({
          message: `${environmentName} does not have environment password information`,
        });
      }
      return res.json(environmentPasswordInformation);
    });
  },

  put: (req, res) => {
    const pathInfo = 'PUT /environment-password-information/:environmentName';
    const { environmentName } = req.params;
    const loggingTags = { path: pathInfo, environment: environmentName, username: req.body.username };
    if (!loggingTags.username) {
      return res.status(400).json({
        message: 'You must specify a username',
      });
    }
    DeploymentModel.findOne({ name: environmentName }, (findEnvironmentError, environment) => {
      if (findEnvironmentError) {
        logger.error(loggingTags, 'Error when getting environment to put environment password information',
          findEnvironmentError);
        return res.status(500).json({
          message: 'Error when getting environment to put environment password information',
          error: findEnvironmentError,
        });
      }
      if (!environment) {
        return res.status(404).json({
          message: 'Environment not found in EMT',
        });
      }
      addOrEditEnvironmentPasswordInformationModel(res, req, environmentName, loggingTags);
    });
  },

  remove: (req, res) => {
    const pathInfo = 'DELETE /environment-password-information/:id';
    const { id } = req.params;
    EnvironmentPasswordInformationModel.findByIdAndRemove(id, (errorFindingEnvironmentPasswordInformation) => {
      if (errorFindingEnvironmentPasswordInformation) {
        logger.error(pathInfo, 'Error deleting environment password information.',
          errorFindingEnvironmentPasswordInformation);
        return res.status(500).json({
          message: 'Error deleting environment password information.',
          error: errorFindingEnvironmentPasswordInformation,
        });
      }
      return res.status(204).json();
    });
  },
};
