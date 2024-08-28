import { Session } from '../models/session';
import { Deployment } from '../models/deployment';
import { Time } from '@angular/common';

export function sessionUpdatedOperation(
  session: Session, deployment: Deployment, allSessionAssignees: string[], addedAssignees: string[],
  removedAssignees: string[], differenceInHours: any, differenceInMinutes: any,
  startLMI: Time, expiryLMI: Time, wasDurationChanged: boolean,
  oldHours: number, oldMinutes: number,
) {
  const jiras = generateJira(session.jira);
  const addedSessionAssigneesHtml = generateSessionAssigneesHtml(addedAssignees, 'added');
  const removedSessionAssigneesHtml = generateSessionAssigneesHtml(removedAssignees, 'removed');
  const durationChangedHtml = generateDurationChangedHtml(wasDurationChanged, differenceInHours,
                                                          differenceInMinutes, oldHours,
                                                          oldMinutes);

  /* tslint:disable:max-line-length */
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
                      <h4 style="color:white">The Session Assigned To You Has Been Updated</h4>
                  </td>
              </tr>
              <tr>
                  <td style="background-color:#ededed; padding:20px">
                      <p>Hi All,</p>
                      <p> The session assigned for troubleshooting on
                      test environment <b>${deployment[0].name}</b> has been updated.</p>
                      ${addedSessionAssigneesHtml}
                      ${removedSessionAssigneesHtml}
                      ${durationChangedHtml}
                      ${jiras}
                      <h3>Quarantine Details:</h3>
                      <ul>
                        <li>Assignees: ${allSessionAssignees}.</li>
                        <li>The time remaining for the session is ${differenceInHours}
                         hour(s) & ${differenceInMinutes} minute(s).</li>
                        <li>Start Time: LMI Athlone ${startLMI}.</li>
                        <li>Expiry Time: LMI Athlone ${expiryLMI}.</li>
                      </ul>
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
  /* tslint:enable:max-line-length */
}

function generateJira(jiras: string[]) {
  let jiraHtml = '';
  if (!(jiras[0] === '')) {
    jiraHtml = '<h3>JIRA(s):</h3><ul>';
    jiras.forEach((jira) => {
      jiraHtml += `<li><a href='https://jira-oss.seli.wh.rnd.internal.ericsson.com/browse/${jira}'>
      ${jira.toLocaleUpperCase()}</a></li>`;
    });
    jiraHtml += '</ul>';
  }
  return jiraHtml;
}

function generateSessionAssigneesHtml(sessionAssigneesList: string[], action: string) {
  let sessionAssigneeHtml = '';
  const addedSessionAssigneeHeading =
  '<h3>Team(s)/User(s) Added to the Session Environment:</h3><ul>';
  const removedSessionAssigneeHeading =
  '<h3>Team(s)/User(s) Removed from the Session Environment:</h3><ul>';

  if (sessionAssigneesList.length > 0) {
    if (action === 'added') {
      sessionAssigneeHtml = addedSessionAssigneeHeading;
    } else {
      sessionAssigneeHtml = removedSessionAssigneeHeading;
    }

    sessionAssigneesList.forEach((assigneeName) => {
      sessionAssigneeHtml += `<li>${assigneeName}</li>`;
    });

    sessionAssigneeHtml += '</ul>';
  }
  return sessionAssigneeHtml;
}

function generateDurationChangedHtml(wasDurationChanged: boolean, differenceInHours: number,
                                     differenceInMinutes: number, oldHours: number,
                                     oldMinutes: number) {
  let durationChangedHtml = '';
  if (wasDurationChanged === true) {
    durationChangedHtml += `
    <h3>Session Time Remaining Updated:</h3>
    <ul>
      <li>
        Old Time Remaining - ${oldHours} hour(s) & ${oldMinutes} minute(s)
      </li>
      <li>
        New Time Remaining - ${differenceInHours} hour(s) & ${differenceInMinutes} minute(s)
      </li>
    </ul>
    `;
  }
  return durationChangedHtml;
}
