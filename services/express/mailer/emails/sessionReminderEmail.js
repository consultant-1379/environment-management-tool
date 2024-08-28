const moment = require('moment-timezone');


module.exports = {
  sessionReminderEmail(session, sessionAssignees, deployment) {
    const expiryMoment = moment(session[0].endTime);
    const timeRightNow = moment.utc();
    const differenceInHours = expiryMoment.diff(timeRightNow, 'hours');
    const differenceInMinutes = expiryMoment.diff(timeRightNow, 'minutes') - (differenceInHours * 60);
    const startTime = moment(session[0].startTime).tz('Europe/Dublin').format('MMMM Do YYYY, h:mm:ss a');
    const endTime = expiryMoment.tz('Europe/Dublin').format('MMMM Do YYYY, h:mm:ss a');
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
                      <h4 style="color:white">The session assigned to you is about to expire</h4>
                  </td>
              </tr>
              <tr>
                  <td style="background-color:#ededed; padding:20px">
                      <p>Hi ${sessionAssignees},</p>
                      <p>The session on the test environment <b>${deployment[0].name}</b> provided to you for troubleshooting is about to expire.</p>
                      <ul>
                        <li>The time remaining for the session is ${differenceInHours}
                         hour(s) & ${differenceInMinutes} minute(s).</li>
                        <li>Start Time: LMI Athlone ${startTime}.</li>
                        <li>Expiry Time: LMI Athlone ${endTime}.</li>
                      </ul>
                      <p>
                        For more information and <b>local times</b> visit:<br>
                        <a href="http://emt.athtem.eei.ericsson.se/sessions">emt.athtem.eei.ericsson.se/sessions</a>
                      <p>
                      <p>
                        If you require more time please contact 
                        <a href="mailto:PDLENMMAIN@pdl.internal.ericsson.com?subject=Extend Session time for Test Environment ${deployment[0].name}">
                        Release Operations</a>.
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

</html>
`;
  },
};
