const express = require('express');

const router = express.Router();
const amtelController = require('../controllers/amtel.controllers');

router.get('/search', amtelController.retrieveCandidateEnvironment);

module.exports = router;
