const express = require('express');

const router = express.Router();
const environmentPasswordInformationController = require('../controllers/environmentPasswordInformation.controller');

router.get('/:environmentName', environmentPasswordInformationController.fetchPasswordInformationByEnvironmentName);

router.put('/:environmentName', environmentPasswordInformationController.put);

router.delete('/:id', environmentPasswordInformationController.remove);

module.exports = router;
