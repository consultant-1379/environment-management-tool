const express = require('express');
const router = express.Router();
const deploymentController = require('../controllers/deployment.controller');

router.get('/', deploymentController.list);

router.post('/', deploymentController.create);

router.put('/:id', deploymentController.update);

router.delete('/:id', deploymentController.remove);

router.get('/search', deploymentController.search);

module.exports = router;