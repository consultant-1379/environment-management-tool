const { exec } = require('child_process');

const request = require('superagent');
const logger = require('./../../logger/logger');

async function retrieveVmPasswordFromEmt(clusterId, vmToGetPasswordFor) {
  const environmentPasswordInformationUrl = 'http://127.0.0.1:3000/environment-password-information';
  let vmPassword = '';

  await request.get(`${environmentPasswordInformationUrl}/${clusterId}`)
    .set('Accept', 'application/json')
    .then((response) => {
      (vmPassword = response.body[vmToGetPasswordFor]);
    }).catch(() => {
      vmPassword = '12shroot';
    });
  return vmPassword;
}

const setupPasswordlessConnection = async (req, res) => {
  const pathInfo = 'POST /ansible/setup-passwordless-connection';
  let clusterId;
  let playbookArguments;
  if (req.body.username === undefined || req.body.username === '' || req.body.username.toUpperCase() === 'ANONYMOUS') {
    return res.status(412).json({
      message: 'Username is not specified',
    });
  }
  const { username } = req.body;
  const { createUserOnWlvm } = req.body;
  if (process.env.NODE_ENV === 'PROD') {
    ({ clusterId } = req.params);
    const lmsPassword = await retrieveVmPasswordFromEmt(clusterId, 'lmsPassword');
    const wlvmPassword = await retrieveVmPasswordFromEmt(clusterId, 'wlvmPassword');
    playbookArguments = ` --extra-vars "cluster_id=${clusterId} create_user_on_wlvm=${createUserOnWlvm} 
    lms_password=${lmsPassword} wlvm_password=${wlvmPassword}"'`;
  } else {
    const clusterNum = `${process.env.HOST_NAME}`.split('.')[0].split('atvts')[1];
    clusterId = `atvts${clusterNum}`;
    playbookArguments = ` --extra-vars "cluster_id=${clusterId} create_user_on_wlvm=${createUserOnWlvm} 
    cluster_password=${process.env.CLUSTER_PASSWORD}"'`;
  }
  if (clusterId === 'undefined') {
    return res.status(412).json({
      message: 'Cluster Id is not specified',
    });
  }
  const loggingTags = { path: pathInfo, signum: username, environment: clusterId };
  const sshCommand = `
  sshpass -p ${process.env.ANSIBLE_PASSWORD} ssh -o UserKnownHostsFile=/dev/null -o CheckHostIP=no -o StrictHostKeyChecking=no root@ansible`;
  const playbookCommand = "'ansible-playbook /usr/src/app/create-session-user/tasks/setup_passwordless_connection.yml";
  exec(`${sshCommand} ${playbookCommand} ${playbookArguments}`, (err, stdout) => {
    if (err) {
      logger.error(loggingTags, 'Error when setting up passwordless connection to environment');
      return res.status(500).json('The ansible playbook setup_passwordless_connection.yml failed to execute');
    }
    return res.status(200).json(stdout);
  });
};

const removeWorkloadEntryFromAnsibleHostsFile = async (req, res) => {
  const pathInfo = 'DELETE /ansible/remove-workload-entry-from-ansible-host-file';
  let clusterId;
  let playbookArguments;
  if (req.body.username === undefined || req.body.username === '' || req.body.username.toUpperCase() === 'ANONYMOUS') {
    return res.status(412).json({
      message: 'Username is not specified',
    });
  }
  const { username } = req.body;
  if (process.env.NODE_ENV === 'PROD') {
    ({ clusterId } = req.params);
    playbookArguments = ` --extra-vars "cluster_id=${clusterId}"'`;
  } else {
    const clusterNum = `${process.env.HOST_NAME}`.split('.')[0].split('atvts')[1];
    clusterId = `atvts${clusterNum}`;
    playbookArguments = ` --extra-vars "cluster_id=${clusterId}"'`;
  }
  if (clusterId === 'undefined') {
    return res.status(412).json({
      message: 'Cluster Id is not specified',
    });
  }
  const loggingTags = { path: pathInfo, signum: username, environment: clusterId };
  const sshCommand = `
  sshpass -p ${process.env.ANSIBLE_PASSWORD} ssh -o UserKnownHostsFile=/dev/null -o CheckHostIP=no -o StrictHostKeyChecking=no root@ansible`;
  const playbookCommand = "'ansible-playbook /usr/src/app/remove-workload-entry-from-ansible-host-file/tasks/remove-workload-entry-from-ansible-host-file.yml";
  exec(`${sshCommand} ${playbookCommand} ${playbookArguments}`, (err, stdout) => {
    if (err) {
      logger.error(loggingTags, 'Error when removing passwordless connection to wlvm of the environment');
      return res.status(500).json('The ansible playbook remove-workload-entry-from-ansible-host-file.yml failed to execute');
    }
    return res.status(200).json(stdout);
  });
};

const createUserForSession = (req, res) => {
  const pathInfo = 'POST /ansible/create-user-for-session';
  let clusterId;
  let playbookCommand;
  if (req.body.username === undefined || req.body.username === '' || req.body.username.toUpperCase() === 'ANONYMOUS') {
    return res.status(412).json({
      message: 'Username is not specified',
    });
  }
  const {
    sessionUsername,
    sessionPassword,
    username,
    vmType,
  } = req.body;
  if (process.env.NODE_ENV === 'PROD') {
    ({ clusterId } = req.body);
  } else {
    const clusterNum = `${process.env.HOST_NAME}`.split('.')[0].split('atvts')[1];
    clusterId = `atvts${clusterNum}`;
  }
  if ((clusterId) && (sessionUsername) && (sessionPassword)) {
    const loggingTags = { path: pathInfo, signum: username, environment: clusterId };
    const sshCommand = `
    sshpass -p ${process.env.ANSIBLE_PASSWORD} ssh -o UserKnownHostsFile=/dev/null -o CheckHostIP=no -o StrictHostKeyChecking=no root@ansible`;
    const playbookArguments = ` --extra-vars "cluster_id=${clusterId} username=${sessionUsername} password=${sessionPassword} group=quarantine"'`;
    if (vmType === 'ms1') {
      playbookCommand = "'ansible-playbook /usr/src/app/create-session-user/tasks/create_user_in_lms_for_emt_session.yml";
    }
    if (vmType === 'wlvm') {
      playbookCommand = "'ansible-playbook /usr/src/app/create-session-user/tasks/create_user_in_wlvm_for_emt_session.yml";
    }
    exec(`${sshCommand} ${playbookCommand} ${playbookArguments}`, (err, stdout) => {
      if (err) {
        logger.error(loggingTags, 'Error when creating a user in MS or WLVM to assign to a session');
        return res.status(500).json(err);
      }
      return res.status(200).json(stdout);
    });
  } else {
    return res.status(412).json('Cluster Id or Session username/password are not specified');
  }
};

const deleteUserFromSession = (req, res) => {
  const pathInfo = 'DELETE /ansible/delete-user-from-session';
  let clusterId;
  let playbookArguments;
  if (req.query.username === undefined || req.query.username === '' || req.query.username.toUpperCase() === 'ANONYMOUS') {
    return res.status(412).json({
      message: 'Username is not specified',
    });
  }
  const {
    sessionUsername,
    username,
    vmType,
  } = req.query;

  if (process.env.NODE_ENV === 'PROD') {
    ({ clusterId } = req.query);
  } else {
    const clusterNum = `${process.env.HOST_NAME}`.split('.')[0].split('atvts')[1];
    clusterId = `atvts${clusterNum}`;
  }
  if ((clusterId) && (sessionUsername)) {
    const loggingTags = { path: pathInfo, environment: clusterId, signum: username };
    const sshCommand = `
    sshpass -p ${process.env.ANSIBLE_PASSWORD} ssh -o UserKnownHostsFile=/dev/null -o CheckHostIP=no -o StrictHostKeyChecking=no root@ansible`;
    const playbookCommand = "'ansible-playbook /usr/src/app/delete-session-user/tasks/delete_user_from_lms_and_wlvm.yml";
    playbookArguments = ` --extra-vars "cluster_id=${clusterId} username=${sessionUsername} vmType=${vmType}"'`;
    exec(`${sshCommand} ${playbookCommand} ${playbookArguments}`, (err, stdout) => {
      if (err) {
        logger.error(loggingTags, 'Error when deleting a user from MS or WLVM when session expired');
        return res.status(500).json(err);
      }
      return res.status(200).json(stdout);
    });
  } else {
    return res.status(412).json('Cluster Id or Session Username are not specified');
  }
};

const sendMessageToUserTerminal = (req, res) => {
  const pathInfo = 'POST /ansible/send-message-to-user-terminal';
  if (!req.body.username || req.body.username.toUpperCase() === 'ANONYMOUS') {
    return res.status(412).json({
      message: 'Username is not specified',
    });
  }
  const {
    troubleshootingUser,
    username,
    message,
  } = req.body;
  let clusterId;
  if (process.env.NODE_ENV === 'PROD') {
    ({ clusterId } = req.params);
  } else {
    const sandboxNumber = `${process.env.HOST_NAME}`.split('.')[0].split('atvts')[1];
    clusterId = `atvts${sandboxNumber}`;
  }
  if ((clusterId) && (troubleshootingUser) && (message)) {
    const loggingTags = { path: pathInfo, environment: clusterId, signum: username };
    const sshCommand = `
    sshpass -p ${process.env.ANSIBLE_PASSWORD} ssh -o UserKnownHostsFile=/dev/null -o CheckHostIP=no -o StrictHostKeyChecking=no root@ansible`;
    const playbookCommand = "'ansible-playbook /usr/src/app/send-message-to-user-terminal/tasks/send_terminal_message_to_user_in_lms_and_wlvm.yml";
    const playbookArguments = ` --extra-vars "cluster_id=${clusterId} message=\\"${message}\\" username=${troubleshootingUser}"'`;
    exec(`${sshCommand} ${playbookCommand} ${playbookArguments}`, (err, stdout) => {
      if (err) {
        logger.error(loggingTags, 'Error when sending message to troubleshooting user terminal with ansible');
        return res.status(500).json(err);
      }
      return res.status(200).json(stdout);
    });
  } else {
    return res.status(412).json('Required values were not provided');
  }
};


module.exports.setupPasswordlessConnection = setupPasswordlessConnection;
module.exports.removeWorkloadEntryFromAnsibleHostsFile = removeWorkloadEntryFromAnsibleHostsFile;
module.exports.createUserForSession = createUserForSession;
module.exports.deleteUserFromSession = deleteUserFromSession;
module.exports.sendMessageToUserTerminal = sendMessageToUserTerminal;
