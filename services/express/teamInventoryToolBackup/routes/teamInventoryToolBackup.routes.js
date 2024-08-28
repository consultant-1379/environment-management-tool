const express = require('express');

const router = express.Router();
const teamInventoryToolBackupController = require('../controllers/teamInventoryToolBackup.controller');

router.get('/', teamInventoryToolBackupController.list);

module.exports = router;
