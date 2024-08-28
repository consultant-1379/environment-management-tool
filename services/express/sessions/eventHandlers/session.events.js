const { EventEmitter } = require('events');
const request = require('superagent');
const cron = require('node-cron');
const moment = require('moment-timezone');
const sessionExpired = require('../../mailer/emails/sessionExpiredEmail');
const sessionReminder = require('../../mailer/emails/sessionReminderEmail');
const failedUserDelete = require('../../mailer/emails/failedDeleteUserEmail');
const deleteUser = require('../../mailer/emails/deleteUserEmail');
const sessionModel = require('../models/session.model');
const logger = require('./../../logger/logger');


const eventEmitter = new EventEmitter();

const LIST_OF_OPS_MAILS = {
  MTE: 'PDLMTOPSMT@pdl.internal.ericsson.com',
  CDL: 'Ericsson.ENMMTV@tcs.com',
  LongLoop: 'Ericsson.ENMMTV@tcs.com',
  PLM: 'PDLENMSPIN@pdl.internal.ericsson.com',
  DROPBACK: 'PDLENMSPIN@pdl.internal.ericsson.com',
  RVB: 'PDLENM14BR@pdl.internal.ericsson.com',
  ENDURANCE: 'PDLENMBLAC@pdl.internal.ericsson.com',
  STKPI: 'PDLENM14BR@pdl.internal.ericsson.com',
  RTD: 'PDLTORBLAD@pdl.internal.ericsson.com,EricssonENM.Bravo@tcs.com,BumbleBee.ENM@tcs.com',
  SprintValidation: 'TeamWhiteWalkers@tcscomprod.onmicrosoft.com,enmtargaryens.hyd@tcs.com,pdlenmlant@pdl.internal.ericsson.com',
  CS: 'PDLMIROICB@pdl.internal.ericsson.com,PDLLMIROCB@pdl.internal.ericsson.com',
};

function sendMail(deployment, session) {
  const logMessage = 'EVENTS sendMail';
  const mailerUrl = 'http://127.0.0.1:3000/mailer/';
  const sessionAssignees = session[0].assignedTeam.concat(session[0].assignedUserNames);
  const sessionAssigneeEmails = session[0].teamEmail.concat(session[0].assignedUserEmails);
  request.post(mailerUrl)
    .set('Content-Type', 'application/json')
    .send({
      emailId: sessionAssigneeEmails,
      ccId: LIST_OF_OPS_MAILS[deployment[0].testPhase],
      emailSubject: `Test Environment ${deployment[0].name} has been deallocated`,
      emailBody: sessionExpired.sessionExpiredEmail(session, sessionAssignees, deployment),
    })
    .end((err, res) => {
      if (err) {
        logger.error(logMessage, 'Error when sending a session elapsed mail', err);
        return res.status(500).json({
          message: 'Error when sending a session elapsed mail',
          error: err,
        });
      }
      logger.info(logMessage, 'Successfully sent expired mail');
    });
}

function sendReminderMail(deployment, session) {
  const logMessage = 'EVENTS sendReminderMail';
  const mailerUrl = 'http://127.0.0.1:3000/mailer/';
  const sessionAssignees = session[0].assignedTeam.concat(session[0].assignedUserNames);
  const sessionAssigneeEmails = session[0].teamEmail.concat(session[0].assignedUserEmails);
  request.post(mailerUrl)
    .set('Content-Type', 'application/json')
    .send({
      emailId: sessionAssigneeEmails,
      ccId: '',
      emailSubject: `REMINDER: The Session on Test Environment ${deployment[0].name} is about to expire`,
      emailBody: sessionReminder.sessionReminderEmail(session, sessionAssignees, deployment),
    })
    .end((err, res) => {
      if (err) {
        logger.error(logMessage, 'Error when sending the mail about session almost expired', err);
        return res.status(500).json({
          message: 'Error when sending the mail about session almost expired',
          error: err,
        });
      }
      logger.info(logMessage, 'Successfully sent reminder  mail');
    });
}

function sendReminderMessageToTerminal(deployment, session, assigneeUsernames) {
  if (assigneeUsernames.length > 0) {
    const logMessage = 'EVENTS sendReminderMessageToTerminal';
    const reminderMessageUrl = `http://127.0.0.1:3000/ansible/send-message-to-user-terminal/${deployment.name}`;
    let reminderMessage = 'WARNING Your EMT troubleshooting session will expire in 30 minutes.';
    reminderMessage = `${reminderMessage} Please contact ${deployment.testPhase} Release Operations if you require further time.`;
    for (const assigneeUsername in assigneeUsernames) {
      if (assigneeUsername) {
        request.post(reminderMessageUrl)
          .set('Content-Type', 'application/json')
          .send({
            username: 'expressEvents',
            troubleshootingUser: assigneeUsernames[assigneeUsername],
            message: reminderMessage,
          })
          .end((err) => {
            if (err) {
              logger.error(logMessage, 'Error when sending the reminder message about session expiry', err);
            }
          });
      }
    }
  }
}

function sendMailWhenFailedToDeleteUser(deployment, sessionUsername, sessionPassword) {
  const logMessage = 'EVENTS sendMail';
  const mailerUrl = 'http://127.0.0.1:3000/mailer/';
  request.post(mailerUrl)
    .set('Content-Type', 'application/json')
    .send({
      emailId: LIST_OF_OPS_MAILS[deployment[0].testPhase],
      ccId: 'BumbleBee.ENM@tcs.com',
      emailSubject: `Failed to delete the user ${sessionUsername} from Test Environment ${deployment[0].name}`,
      emailBody: failedUserDelete.failedDeleteUserEmail(sessionUsername, sessionPassword, deployment[0].name),
    })
    .end((err, res) => {
      if (err) {
        logger.error(logMessage, 'Error when sending mail for user delete failure', err);
        return res.status(500).json({
          message: 'Error when sending mail for user delete failure',
          error: err,
        });
      }
      logger.info(logMessage, 'Successfully sent delete user failure mail');
    });
}

function sendMailWhenUserNotDeleted(deployment, sessionUsername, vmType) {
  const logMessage = 'EVENTS sendMailWhenUserNotDeleted';
  if (vmType === 'ms1') {
    vmType = 'LMS';
  } else {
    vmType = 'WLVM';
  }
  const mailerUrl = 'http://127.0.0.1:3000/mailer/';
  request.post(mailerUrl)
    .set('Content-Type', 'application/json')
    .send({
      emailId: LIST_OF_OPS_MAILS[deployment[0].testPhase],
      ccId: '',
      emailSubject: `WARNING: EMT did not delete the user ${sessionUsername} from Test Environment ${deployment[0].name}`,
      emailBody: deleteUser.deleteUserEmail(sessionUsername, vmType, deployment[0].name),
    })
    .end((err, res) => {
      if (err) {
        logger.error(logMessage, 'Error when sending delete user mail', err);
        return res.status(500).json({
          message: 'Error when sending delete user mail',
          error: err,
        });
      }
      logger.info(logMessage, 'Successfully sent delete user mail');
    });
}

async function deleteUsersFromMsOrWlvm(usersToDelete, passwordsOfUsers, deployment, vmType) {
  const logMessage = 'EVENTS TimePeriodExpired';
  for (const userToDelete in usersToDelete) {
    if (userToDelete) {
      const additionalQuery = `?clusterId=${deployment[0].name}&sessionUsername=${usersToDelete[userToDelete]}&username=express&vmType=${vmType}`;
      const deleteUserUrl = `http://127.0.0.1:3000/ansible/delete-user-from-session${additionalQuery}`;
      await request.delete(deleteUserUrl)
        .then((res, err) => {
          if (err) {
            setTimeout(() => sendMailWhenFailedToDeleteUser(deployment, usersToDelete[userToDelete], passwordsOfUsers[userToDelete]), 60000);
            logger.error(logMessage, 'Failed to Delete the user', err);
          } else if (res.body.includes('User not deleted')) {
            logger.info(logMessage, 'User did not get deleted');
            setTimeout(() => sendMailWhenUserNotDeleted(deployment, usersToDelete[userToDelete], vmType), 60000);
          } else {
            logger.info(logMessage, 'Successfully Deleted the user');
          }
        });
    }
  }
}

eventEmitter.on('TimePeriodExpired', (timePeriodId) => {
  const logMessage = 'EVENTS TimePeriodExpired';
  const ms = 'ms1';
  const wlvm = 'wlvm';
  logger.info(logMessage, `The time period ${timePeriodId} has expired. Triggering Session events`);
  const sessionUrl = 'http://127.0.0.1:3000/sessions/';
  const getUrl = `${sessionUrl}search?q=timePeriodId=${timePeriodId}`;
  request.get(getUrl)
    .set('Accept', 'application/json')
    .then((response) => {
      const session = response.body;
      const putUrl = `${sessionUrl}${session[0]._id}`;
      request.put(putUrl)
        .set('Content-Type', 'application/json')
        .send({
          session: {
            status: 'expired',
            endTime: session[0].endTime,
          },
          username: 'express',
        }).then(() => {
          logger.info(logMessage, 'Session has been updated');
        });
      return session;
    })
    .then((session) => {
      const deploymentsUrl = 'http://127.0.0.1:3000/deployments/';
      const getDeploymentUrl = `${deploymentsUrl}search/?q=_id=${session[0].deploymentId}`;
      request.get(getDeploymentUrl)
        .set('Accept', 'application/json')
        .then((response) => {
          const deployment = response.body;
          return [deployment, session];
        })
        .then(async ([deployment, sessionData]) => {
          if (deployment[0].platformType === 'physical') {
            await deleteUsersFromMsOrWlvm(sessionData[0].sessionUsername.assignedTeamUsername,
              sessionData[0].sessionPassword.assignedTeamPassword, deployment, ms);
            await deleteUsersFromMsOrWlvm(sessionData[0].sessionUsername.assignedTeamUsername,
              sessionData[0].sessionPassword.assignedTeamPassword, deployment, wlvm);
            await deleteUsersFromMsOrWlvm(sessionData[0].sessionUsername.assignedUserUsername,
              sessionData[0].sessionPassword.assignedUserPassword, deployment, ms);
            await deleteUsersFromMsOrWlvm(sessionData[0].sessionUsername.assignedUserUsername,
              sessionData[0].sessionPassword.assignedUserPassword, deployment, wlvm);
          }
          return [deployment, session];
        })
        .then(([deployment, sessionData]) => {
          const res = sendMail(deployment, sessionData);
          return res;
        });
      request.put(`${deploymentsUrl}${session[0].deploymentId}`)
        .set('Accept', 'application/json')
        .send({
          isSessionCreated: 'false',
          username: 'express',
        })
        .then();
    });
});

eventEmitter.on('TimerAboutToExpire', (timePeriodId) => {
  const logMessage = 'EVENTS TimerAboutToExpire';
  logger.info(logMessage, `The time period ${timePeriodId} is about to expire. Notifying teams of a session.`);
  const sessionUrl = 'http://127.0.0.1:3000/sessions/';
  const getUrl = `${sessionUrl}search?q=timePeriodId=${timePeriodId}`;
  request.get(getUrl)
    .set('Accept', 'application/json')
    .then((sessionResponse) => {
      const session = sessionResponse.body;
      const deploymentUrl = 'http://127.0.0.1:3000/deployments/';
      const getDeploymentUrl = `${deploymentUrl}search/?q=_id=${session[0].deploymentId}`;
      request.get(getDeploymentUrl)
        .set('Accept', 'application/json')
        .then((deploymentResponse) => {
          const deployment = deploymentResponse.body;
          return [deployment, session];
        })
        .then(([deployment, sessionData]) => {
          sendReminderMessageToTerminal(deployment[0], sessionData[0], sessionData[0].sessionUsername.assignedTeamUsername);
          sendReminderMessageToTerminal(deployment[0], sessionData[0], sessionData[0].sessionUsername.assignedUserUsername);
          const mailResponse = sendReminderMail(deployment, sessionData);
          return mailResponse;
        });
    });
});

eventEmitter.on('TimePeriodDeleted', (timePeriodId) => {
  const logMessage = 'EVENTS TimePeriodDeleted';
  logger.info(logMessage, `The time period ${timePeriodId} has been deleted. Triggering Session events`);
});

cron.schedule('0 14 * * *', () => {
  const logMessage = 'EVENTS deleteOldSessions';
  sessionModel.find({}, (err, result) => {
    result.forEach((session) => {
      const currentMoment = moment(new Date());
      const endDate = moment(session.endTime);
      const differenceInDays = currentMoment.diff(endDate, 'days');
      if (differenceInDays > 31) {
        logger.info(logMessage, `The session ${session._id} is over one month old! Removing it.`);
        sessionModel.findByIdAndRemove(session._id, (findErr) => {
          if (findErr) {
            logger.error(logMessage, `Error in removing session ${session._id}`);
          } else {
            logger.info(logMessage, `Session ${session._id} has been removed.`);
          }
        });
      }
    });
  });
});

exports.eventEmitter = eventEmitter;
