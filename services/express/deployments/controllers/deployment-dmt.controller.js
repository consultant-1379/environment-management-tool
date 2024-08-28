const request = require('superagent');

const CIFWK_API = 'https://ci-portal.seli.wh.rnd.internal.ericsson.com';

async function getDeploymentDescription(req, res) {
  let dmtBody;
  await request.get(`${CIFWK_API}/api/deployment/deploymentDescription/${req.params.dmt_id}`).then((dmtData) => {
    dmtBody = dmtData.body;
  });
  return res.json(dmtBody);
}

async function getDeploymentHttpdFqdn(req, res) {
  let deploymentTafPropertiesResponse;
  await request.get(`${CIFWK_API}/generateTAFHostPropertiesJSON/?clusterId=${req.params.dmt_id}&tunnel=true`).then((dmtData) => {
    deploymentTafPropertiesResponse = dmtData.body;
  });
  return res.json(deploymentTafPropertiesResponse);
}

async function getDeploymentDdpSite(req, res) {
  let deploymentClusterAdditionalProperties;
  await request.get(`${CIFWK_API}/api/deployment/getClusterAdditionalProperties/clusterId/${req.params.dmt_id}`).then((dmtData) => {
    deploymentClusterAdditionalProperties = dmtData.body;
  });
  return res.json(deploymentClusterAdditionalProperties);
}

async function setDeploymentStatus(req, res) {
  await request.post(`${CIFWK_API}/api/deployment/${req.params.cluster_id}/status/`, req.body);
  return res.json();
}

module.exports.getDeploymentDescription = getDeploymentDescription;
module.exports.getDeploymentHttpdFqdn = getDeploymentHttpdFqdn;
module.exports.getDeploymentDdpSite = getDeploymentDdpSite;
module.exports.setDeploymentStatus = setDeploymentStatus;
