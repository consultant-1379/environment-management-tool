const express = require('express');

const router = express.Router();
const userController = require('../controllers/user.controller');

router.get('/retrieveUser/:param', userController.retrieveUser);
router.get('/retrieveAllRoles/', userController.retrieveAllRoles);
router.get('/retrieveRolesAssociatedWithUser/:param', userController.retrieveRolesAssociatedWithUser);
router.put('/updateRoles', userController.updateKeycloakUserRoles);

module.exports = router;
