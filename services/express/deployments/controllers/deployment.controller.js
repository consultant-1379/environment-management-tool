const queryString = require('querystring');
const mongoMask = require('mongo-mask');
const moment = require('moment');
const diff = require('./../../utils/diff');
const DeploymentModel = require('../models/deployment.model');
const exporter = require('./../../exporter');
const logger = require('./../../logger/logger');

const app = require('../../server');

/**
 * deployment.controller.js
 *
 * @description :: Server-side logic for managing Deployments.
 */
module.exports = {
  list: (req, res) => {
    const pathInfo = 'GET /deployments';
    DeploymentModel.find((err, Deployments) => {
      if (err) {
        logger.error(pathInfo, 'Unable to get environment', err);
        return res.status(500).json({
          message: 'Error when getting environment.',
          error: err,
        });
      }
      return res.json(Deployments);
    });
  },

  create: (req, res) => {
    const environmentToAdd = req.body.deployment ? req.body.deployment : req.body;
    const pathInfo = 'POST /deployments';
    if (req.body.username === undefined || req.body.username === '' || req.body.username.toUpperCase() === 'ANONYMOUS') {
      return res.status(412).json({
        message: 'Username is not specified',
      });
    }
    const { username } = req.body;
    const loggingTags = { path: pathInfo, environment: environmentToAdd.name, signum: username };
    const deployment = new DeploymentModel({
      name: environmentToAdd.name,
      testPhase: environmentToAdd.testPhase,
      deploymentType: environmentToAdd.deploymentType,
      platformType: environmentToAdd.platformType,
      productSet: environmentToAdd.productSet,
      nrmVersion: environmentToAdd.nrmVersion,
      nrmSize: environmentToAdd.nrmSize,
      ddp: environmentToAdd.ddp,
      nssProductSetVersion: environmentToAdd.nssProductSetVersion,
      blades: environmentToAdd.blades,
      freeIp: environmentToAdd.freeIp,
      vFarms: environmentToAdd.vFarms,
      pod: environmentToAdd.pod,
      firmware: environmentToAdd.firmware,
      sanHost: environmentToAdd.sanHost,
      sanShared: environmentToAdd.sanShared,
      nasHost: environmentToAdd.nasHost,
      nasShared: environmentToAdd.nasShared,
      nasSoftware: environmentToAdd.nasSoftware,
      hardwareType: environmentToAdd.hardwareType,
      workloadVm: environmentToAdd.workloadVm,
      nodeTypes: environmentToAdd.nodeTypes,
      nodeVersions: environmentToAdd.nodeVersions,
      externalNfs: environmentToAdd.externalNfs,
      openstackVersion: environmentToAdd.openstackVersion,
      ccdVersion: environmentToAdd.ccdVersion,
      nameSpace: environmentToAdd.nameSpace,
      clusterNodes: environmentToAdd.clusterNodes,
    });

    deployment.save((err, savedDeployment) => {
      if (err) {
        logger.error(loggingTags, 'Unable to post environment', err);
        return res.status(500).json({
          message: 'Error when creating environment',
          error: err,
        });
      }
      if (app.emitter) {
        app.emitter.emit('deploymentUpdate', 'environment updated');
      }
      loggingTags.changes = JSON.stringify(deployment);
      logger.info(loggingTags, `${username} successfully created environment`);
      return res.status(201).json(savedDeployment);
    });
  },

  update: (req, res) => {
    const pathInfo = 'PUT /deployments';
    const { id } = req.params;
    const editedEnvironment = req.body.deployment ? req.body.deployment : req.body;
    if (req.body.username === undefined || req.body.username === '' || req.body.username.toUpperCase() === 'ANONYMOUS') {
      return res.status(412).json({
        message: 'Username is not specified',
      });
    }
    const validStates = ['IDLE', 'BUSY', 'QUARANTINE'];
    if (req.body.state && !validStates.includes(req.body.state)) {
      const infoMessage = `State must be either ${validStates}. Received ${req.body.state}`;
      logger.error(pathInfo, infoMessage);
      return res.status(412).json({
        message: infoMessage,
      });
    }
    const { username } = req.body;
    const loggingTags = { path: pathInfo, signum: username };
    DeploymentModel.findOne({ _id: id }, (err, deployment) => {
      if (err) {
        logger.error(loggingTags, 'Error when getting environment', err);
        return res.status(500).json({
          message: 'Error when getting environment',
          error: err,
        });
      }
      if (!deployment) {
        logger.error(loggingTags, 'Environment does not exist', err);
        return res.status(404).json({
          message: `${id} does not correspond to a known environment`,
        });
      }

      loggingTags.environment = deployment.name;

      const tempDeploymentObject = JSON.parse(JSON.stringify(deployment));
      const previousState = deployment.state;
      deployment.name = editedEnvironment.name ? editedEnvironment.name : deployment.name;
      deployment.state = editedEnvironment.state ? editedEnvironment.state : deployment.state;
      deployment.assignedJob = editedEnvironment.assignedJob ? editedEnvironment.assignedJob : deployment.assignedJob;
      deployment.jobName = editedEnvironment.jobName ? editedEnvironment.jobName : deployment.jobName;
      deployment.testPhase = editedEnvironment.testPhase ? editedEnvironment.testPhase : deployment.testPhase;
      deployment.productSet = editedEnvironment.productSet ? editedEnvironment.productSet : deployment.productSet;
      deployment.deploymentType = editedEnvironment.deploymentType ? editedEnvironment.deploymentType : deployment.deploymentType;
      deployment.platformType = editedEnvironment.platformType ? editedEnvironment.platformType : deployment.platformType;
      deployment.systemHealthCheckStatus = editedEnvironment.systemHealthCheckStatus
        ? editedEnvironment.systemHealthCheckStatus : deployment.systemHealthCheckStatus;
      deployment.deploymentRefreshStatus = editedEnvironment.deploymentRefreshStatus
        ? editedEnvironment.deploymentRefreshStatus : deployment.deploymentRefreshStatus;
      deployment.deploymentUpgradeStatus = editedEnvironment.deploymentUpgradeStatus
        ? editedEnvironment.deploymentUpgradeStatus : deployment.deploymentUpgradeStatus;
      deployment.deploymentRollbackStatus = editedEnvironment.deploymentRollbackStatus ? editedEnvironment.deploymentRollbackStatus
        : deployment.deploymentRollbackStatus;
      deployment.otherInfo = editedEnvironment.otherInfo ? editedEnvironment.otherInfo : deployment.otherInfo;
      deployment.nrmVersion = editedEnvironment.nrmVersion ? editedEnvironment.nrmVersion : deployment.nrmVersion;
      deployment.nrmSize = editedEnvironment.nrmSize ? editedEnvironment.nrmSize : deployment.nrmSize;
      deployment.ddp = editedEnvironment.ddp ? editedEnvironment.ddp : deployment.ddp;
      deployment.nssProductSetVersion = editedEnvironment.nssProductSetVersion
        ? editedEnvironment.nssProductSetVersion : deployment.nssProductSetVersion;
      deployment.isSessionCreated = editedEnvironment.isSessionCreated !== undefined
        ? editedEnvironment.isSessionCreated : deployment.isSessionCreated;

      deployment.blades = editedEnvironment.blades ? editedEnvironment.blades : deployment.blades;
      deployment.freeIp = editedEnvironment.freeIp ? editedEnvironment.freeIp : deployment.freeIp;
      deployment.vFarms = editedEnvironment.vFarms ? editedEnvironment.vFarms : deployment.vFarms;
      deployment.pod = editedEnvironment.pod ? editedEnvironment.pod : deployment.pod;
      deployment.firmware = editedEnvironment.firmware ? editedEnvironment.firmware : deployment.firmware;
      deployment.sanHost = editedEnvironment.sanHost ? editedEnvironment.sanHost : deployment.sanHost;
      deployment.sanShared = editedEnvironment.sanShared ? editedEnvironment.sanShared : deployment.sanShared;
      deployment.nasHost = editedEnvironment.nasHost ? editedEnvironment.nasHost : deployment.nasHost;
      deployment.nasShared = editedEnvironment.nasShared ? editedEnvironment.nasShared : deployment.nasShared;
      deployment.nasSoftware = editedEnvironment.nasSoftware ? editedEnvironment.nasSoftware : deployment.nasSoftware;
      deployment.hardwareType = editedEnvironment.hardwareType ? editedEnvironment.hardwareType : deployment.hardwareType;
      deployment.workloadVm = editedEnvironment.workloadVm ? editedEnvironment.workloadVm : deployment.workloadVm;
      deployment.nodeTypes = editedEnvironment.nodeTypes ? editedEnvironment.nodeTypes : deployment.nodeTypes;
      deployment.nodeVersions = editedEnvironment.nodeVersions ? editedEnvironment.nodeVersions : deployment.nodeVersions;
      deployment.externalNfs = editedEnvironment.externalNfs ? editedEnvironment.externalNfs : deployment.externalNfs;
      deployment.openstackVersion = editedEnvironment.openstackVersion ? editedEnvironment.openstackVersion : deployment.openstackVersion;
      deployment.ccdVersion = editedEnvironment.ccdVersion ? editedEnvironment.ccdVersion : deployment.ccdVersion;
      deployment.nameSpace = editedEnvironment.nameSpace ? editedEnvironment.nameSpace : deployment.nameSpace;
      deployment.clusterNodes = editedEnvironment.clusterNodes ? editedEnvironment.clusterNodes : deployment.clusterNodes;
      const diffDeployment = diff.createDiffObject(tempDeploymentObject, deployment);

      if ((previousState !== deployment.state) && (deployment.state === 'QUARANTINE')) {
        if ((deployment.jobName !== null) && (deployment.jobName !== ' ')) {
          exporter.deploymentsInQuarantineCounters(deployment.name, deployment.jobName);
        }
      }
      if (editedEnvironment.additionalDeploymentInfo) {
        if (editedEnvironment.additionalDeploymentInfo.additionalText) {
          deployment.additionalDeploymentInfo.additionalText = editedEnvironment.additionalDeploymentInfo.additionalText;
          deployment.additionalDeploymentInfo.dateModified = (moment().format('DD-MM').toString());
        }
      }

      deployment.save((saveErr) => {
        if (err) {
          logger.error(loggingTags, 'Unable to modify environment', err);
          return res.status(500).json({
            message: 'Error when updating environment.',
            error: saveErr,
          });
        }
        if (app.emitter) {
          app.emitter.emit('deploymentUpdate', 'environment updated');
        }
        loggingTags.changes = diffDeployment;
        logger.info(loggingTags, `${username} successfully modified environment`);
        return res.json(deployment);
      });
    });
  },

  remove: (req, res) => {
    const pathInfo = 'DELETE /deployments';
    const { id } = req.params;
    if (req.query.username === undefined || req.query.username === '' || req.query.username.toUpperCase() === 'ANONYMOUS') {
      return res.status(412).json({
        message: 'Username is not specified',
      });
    }
    const { username } = req.query;
    const deletedEnvironmentName = req.query.environmentName;
    const loggingTags = { path: pathInfo, environment: deletedEnvironmentName, signum: username };
    DeploymentModel.findByIdAndRemove(id, (err) => {
      if (err) {
        logger.error(loggingTags, `Unable to delete environment ${deletedEnvironmentName}`, err);
        return res.status(500).json({
          message: 'Error when deleting the environment.',
          error: err,
        });
      }
      if (app.emitter) {
        app.emitter.emit('deploymentUpdate', 'environments updated');
      }

      logger.info(loggingTags, `${username} successfully removed environment ${deletedEnvironmentName}`);
      return res.status(204).json();
    });
  },

  search: (req, res) => {
    const pathInfo = 'GET /deployments/search';
    let query = '';
    let queryBuilder = '';
    let queryRequest = req.query.q;
    if (queryRequest) {
      // this will be changed with the implementation of url encoding
      // this is will mean we are more aligned with DITs way of working
      // RTD-2229

      // If we pass only one parameter to search by, its not an array. Lets convert it.
      if (!(queryRequest instanceof Array)) {
        queryRequest = [queryRequest];
      }
      for (let count = 0; count < queryRequest.length; count += 1) {
        if (queryBuilder) queryBuilder += '&';
        // Split something like state=IDLE into array with 2 elements
        const searchValues = queryRequest[count].split('=');
        if (searchValues[1] !== undefined) {
          if (searchValues[1].includes('%')) {
            // Split searchValues[1] which is something like MTE%CDL into an array
            const individualSearchValues = searchValues[1].split('%');
            // In this case we convert something like 'testPhase=MTE%CDL' into testPhase=MTE&testPhase=CDL using code below
            for (const individualSearchValue in individualSearchValues) {
              if (individualSearchValue !== null) {
                // Adds something like testPhase=MTE&
                queryBuilder += `${searchValues[0]}=${individualSearchValues[individualSearchValue]}&`;
              }
            }
            // Remove the last "&"
            queryBuilder = queryBuilder.slice(0, -1);
          } else {
            queryBuilder += queryRequest[count];
          }
        }
      }
      // Convert a string like testPhase=MTE&testPhase=CDL into a ParsedUrlQuery object which is used below
      query = queryString.parse(queryBuilder);
    }

    // Example of query object
    //  {
    //    testPhase: [ 'CDL', 'PLM' ],
    //    state: 'IDLE'
    //  }

    let firstPartOfQuery = '';
    let secondPartOfQueryInitial = '';
    let secondPartOfQueryFinal = '';
    // We want to group all ORs into one array and all ANDs into another array
    // From above: Give me all testphase CDL OR PLM AND state IDLE

    // Go through each property e.g. testPhase
    for (const deploymentProperty in query) {
      if (deploymentProperty !== null) {
        // If its an Array we're talking multiple ORs if not its a single AND
        // E.g. MTE or CDL vs IDLE AND vENM
        if (query[deploymentProperty] instanceof Array) {
          secondPartOfQueryInitial = '';
          secondPartOfQueryInitial = `${secondPartOfQueryInitial}{ "$or": [`;
          // Go through the array e.g. [ 'CDL', 'PLM' ]
          const deploymentPropertyValues = query[deploymentProperty];
          for (const deploymentPropertyValue in deploymentPropertyValues) {
            if (deploymentPropertyValue !== null) {
              // Example  "$or": [{ "testPhase": "MTE" },
              secondPartOfQueryInitial = `${secondPartOfQueryInitial}{ "${deploymentProperty}":
                "${deploymentPropertyValues[deploymentPropertyValue]}" },`;
            }
          }
          // Get rid of last comma
          secondPartOfQueryInitial = secondPartOfQueryInitial.slice(0, -1);
          // Close off the OR
          secondPartOfQueryInitial = `${secondPartOfQueryInitial}] }`;
          secondPartOfQueryFinal = `${secondPartOfQueryFinal}${secondPartOfQueryInitial},`;
        } else {
          // Add to the AND part - e.g { "state": "IDLE" },
          secondPartOfQueryFinal = `${secondPartOfQueryFinal}{ "${deploymentProperty}": "${query[deploymentProperty]}" },`;
        }
      }
    }
    firstPartOfQuery = firstPartOfQuery.slice(0, -1);
    secondPartOfQueryInitial = secondPartOfQueryInitial.slice(0, -1);
    secondPartOfQueryFinal = secondPartOfQueryFinal.slice(0, -1);

    // If there is both an 'AND' and 'OR' part then a comma will be put between them
    if (firstPartOfQuery !== '') {
      firstPartOfQuery = `"$and": [${firstPartOfQuery}]`;
    }
    if (firstPartOfQuery !== '' && secondPartOfQueryFinal !== '') {
      secondPartOfQueryFinal = `, ${secondPartOfQueryFinal}`;
    }

    // Example of a finalQuery: {"$and": [{ "state": "IDLE" }], "$or": [{ "testPhase": "MTE" },{ "testPhase": "PLM" }]}
    const lastQuery = `{${firstPartOfQuery}${secondPartOfQueryFinal}}`;
    let trimmedQuery = lastQuery.slice(0, -1);
    trimmedQuery = trimmedQuery.substring(1);
    const finalQuery = `{ "$and": [ ${trimmedQuery} ] }`;

    let fields = null;
    if (req.query.fields) {
      fields = mongoMask(req.query.fields, {});
    }

    DeploymentModel.find(JSON.parse(finalQuery)).select(fields).exec((err, deployment) => {
      if (err) {
        logger.error(pathInfo, 'Unable to get requested environment(s)');
        return res.status(500).json({
          message: 'Error when getting environment',
          error: err,
        });
      }
      return res.json(deployment);
    });
  },
};
