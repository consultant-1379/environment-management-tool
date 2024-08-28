const express = require('express');

const router = express.Router();
const sessionController = require('../controllers/session.controller');

router.get('/', sessionController.list);

router.post('/', sessionController.create);

router.put('/:id', sessionController.update);

router.delete('/:id', sessionController.remove);

router.get('/search', sessionController.search);

module.exports = router;
