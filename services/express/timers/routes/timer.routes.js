const express = require('express');

const router = new express.Router();
const timerController = require('../controllers/timer.controller');

router.post('/', timerController.create);

router.get('/:id', timerController.fetchById);

router.put('/:id', timerController.update);

router.delete('/:id', timerController.remove);

module.exports = router;
