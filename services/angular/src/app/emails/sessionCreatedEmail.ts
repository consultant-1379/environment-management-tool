import { Session } from '../models/session';
import { Deployment } from '../models/deployment';
import { Time } from '../../../node_modules/@angular/common';

export function sessionCreated(
  session: Session, sessionAssignees: String[], deployment: Deployment,
  startLMI: Time, expiryLMI: Time, assignedAssigneesIndex: any, sessionAssigneeUsernames: any,
  sessionAssigneePasswords: any, createUserOnWlvm: boolean,
) {
  const jiras = generateJira(session.jira);
  const userDetailsHtml = generateUserDetails(
      assignedAssigneesIndex, sessionAssigneeUsernames, sessionAssigneePasswords,
      deployment[0].platformType, createUserOnWlvm);
  /* tslint:disable */
  // disabled for line length and didnt want to break lines with urls
  return `<!DOCTYPE html>

  <html>

  <head>
  </head>

  <body>
      <table width="100%" cellpadding="0" cellspacing="0" style="min-width:100%">
          <tbody>
              <tr>
                  <td style="background-color:#36B07F; padding:20px">
                      <h3 style="color:white">Environment Management Tool (EMT)</h3>
                      <h4 style="color:white">A Test Environment Has Been Quarantined For You</h4>
                  </td>
              </tr>
              <tr>
                  <td style="background-color:#ededed; padding:20px">
                      <p>Hi ${sessionAssignees},</p>
                      <p>The test environment <b>${deployment[0].name}</b> has
                       been quarantined and provided to you for <b style="color:red">non-intrusive Troubleshooting and Log Collection Only.</b></p>

                      <h3>Quarantine Details:</h3>
                      <ul>
                        <li>The session is valid for ${session.hours}
                         hour(s) & ${session.minutes} minute(s).</li>
                        <li>Start Time: LMI Athlone ${startLMI}.</li>
                        <li>Expiry Time: LMI Athlone ${expiryLMI}.</li>
                      </ul>
                      ${userDetailsHtml}
                      <h3>JIRA(s):</h3>
                      ${jiras}
                      <p>
                        For more information and <b>local times</b> visit:<br>
                        <a href="http://emt.athtem.eei.ericsson.se/sessions">emt.athtem.eei.ericsson.se/sessions</a>
                      <p>
                      <p>
                        Kind Regards, <br>
                        ${deployment[0].testPhase}
                      </p>
                  </td>
              </tr>
              <tr>
                  <td style="background-color:#0C0C0C; padding:20px">
                      <table>
                          <tr>
                              <td style="padding:10px">
                                  <img src="cid:ericssonLogo">
                              </td>
                              <td>
                                  <p style="color:#F2F2F2">For questions, comments or suggestions on EMT please contact
                                      <br>
                                      <a href="mailto:BumbleBee.ENM@tcs.com?subject=EMT Troubleshooting Session">ENM/Bumblebee</a>
                                  </p>
                              </td>
                          </tr>
                      </table>

                  </td>
              </tr>
          </tbody>
      </table>
  </body>

  </html>`;
  /* tslint:enable */
}

function generateJira(jiras: string[]) {
  let jiraHtml = '<ul>';
  jiras.forEach((jira) => {
    jiraHtml += `<li><a href='https://jira-oss.seli.wh.rnd.internal.ericsson.com/browse/${jira}'>
    ${jira.toLocaleUpperCase()}</a></li>`;
  });
  jiraHtml += '</ul>';
  return jiraHtml;
}

function generateUserDetails(assignedAssigneesIndex: any, sessionAssigneeUsernames: string[],
                             sessionAssigneePasswords: string, platformType: string,
                             createUserOnWlvm: boolean) {
  let userDetailsHtml = '';
  let vmUserCreatedOn = 'LMS';
  if (createUserOnWlvm) {
    vmUserCreatedOn = 'LMS and WLVM';
  }
  if (platformType === 'physical') {
    const sessionUsernames = sessionAssigneeUsernames['assignedTeamUsername']
        .concat(sessionAssigneeUsernames['assignedUserUsername']);
    const sessionPasswords = sessionAssigneePasswords['assignedTeamPassword']
        .concat(sessionAssigneePasswords['assignedUserPassword']);
    userDetailsHtml =
      `<h3>LMS Login Details:</h3>
      <ul>
          <li>A user with <b>root access</b> has been created for
           you during the entirety of this quarantine session.</li>
          <li>Please use the following details to log on to the ${vmUserCreatedOn}:
              <ul>
                  <li><b>Username:</b> ${sessionUsernames[assignedAssigneesIndex]}</li>
                  <li><b>Password:</b> ${sessionPasswords[assignedAssigneesIndex]}</li>
              </ul>
          </li>
      </ul>`;
  }
  return userDetailsHtml;
}
