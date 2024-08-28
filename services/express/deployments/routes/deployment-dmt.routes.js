const express = require('express');
const dmtController = require('../controllers/deployment-dmt.controller');

const router = express.Router();

router.get('/deploymentDescription/:dmt_id', dmtController.getDeploymentDescription);
router.get('/deploymentTafProperties/:dmt_id', dmtController.getDeploymentHttpdFqdn);
router.get('/getClusterAdditionalProperties/:dmt_id', dmtController.getDeploymentDdpSite);
router.post('/setDeploymentStatus/:cluster_id', dmtController.setDeploymentStatus);

module.exports = router;
