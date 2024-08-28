const express = require('express');

const router = new express.Router();
const timePeriodController = require('../controllers/timePeriod.controller');

router.get('/', timePeriodController.list);

router.get('/:id', timePeriodController.fetchById);

router.put('/:id', timePeriodController.start);

router.put('/update/:id', timePeriodController.update);

router.post('/', timePeriodController.create);

router.delete('/:id', timePeriodController.remove);

module.exports = router;
