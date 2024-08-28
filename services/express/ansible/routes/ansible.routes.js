const express = require('express');

const router = express.Router();
const ansibleController = require('../controllers/ansible.controller');

router.post('/setup-passwordless-connection/:clusterId', ansibleController.setupPasswordlessConnection);
router.post('/create-user-for-session', ansibleController.createUserForSession);
router.post('/send-message-to-user-terminal/:clusterId', ansibleController.sendMessageToUserTerminal);
router.delete('/delete-user-from-session', ansibleController.deleteUserFromSession);
router.delete('/remove-workload-entry-from-ansible-host-file/:clusterId', ansibleController.removeWorkloadEntryFromAnsibleHostsFile);


module.exports = router;
