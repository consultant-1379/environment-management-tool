const express = require('express');

const router = express.Router();
const jenkinsController = require('../controllers/jenkins.controller');

router.post('/trigger-jenkins-job', jenkinsController.triggerJenkinsJob);

module.exports = router;
