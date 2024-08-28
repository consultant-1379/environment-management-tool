const jenkins = require('jenkins');


const logger = require('./../../logger/logger');

const triggerJenkinsJob = async (req) => {
  const pathInfo = 'POST /jenkins/trigger-jenkins-job';
  const loggingTags = { path: pathInfo, environment: req.body.clusterID };
  const deployment = req.body.clusterID;
  const { platformType } = req.body;
  let jobToTrigger;
  if (platformType === 'vENM') {
    jobToTrigger = 'vENM_System_Health_Checks_Functional_Test_Autofix_Enabled';
  } else {
    jobToTrigger = 'pENM_System_Health_Checks_test_Autofix_Enabled';
  }
  if (deployment) {
    const jenkinsClient = jenkins({
      baseUrl:
        `https://${process.env.BB_FUNCTIONAL_USER}:${process.env.BB_FUNCTIONAL_USER_PASSWORD}@fem4s11-eiffel004.eiffel.gic.ericsson.se:8443/jenkins`,
    });
    if ((process.env.NODE_ENV === 'PROD' || process.env.NODE_ENV === 'STAG') && process.env.BB_FUNCTIONAL_USER && process.env.BB_FUNCTIONAL_USER_PASSWORD) {
      logger.info(loggingTags, 'should kick of job in production or staging env.');
      const jobParams = {
        cluster_id: deployment,
      };
      jenkinsClient.job.build({
        name: jobToTrigger,
        parameters: jobParams,
      }, (err) => {
        if (err) {
          logger.error(loggingTags, 'Error when triggering Jenkins job');
          logger.error(loggingTags, err);
        }
      });
    } else {
      logger.info(loggingTags, 'Kicked of job in DEV env');
    }
  }
};

module.exports.triggerJenkinsJob = triggerJenkinsJob;
