module.exports = {
  failedDeleteUserEmail(sessionUsername, sessionPassword, deploymentName) {
    return `<!DOCTYPE html>

  <html>

  <head>
  </head>

  <body>
      <table width="100%" cellpadding="0" cellspacing="0" style="min-width:100%">
          <tbody>
              <tr>
                  <td style="background-color:#ff0000; padding:20px">
                      <h3 style="color:white">Environment Management Tool (EMT)</h3>
                      <h4 style="color:white">Failed To Delete A User</h4>
                  </td>
              </tr>
              <tr>
                  <td style="background-color:#ededed; padding:20px">
                      <p>Hi Ops,</p>
                      <p>The quarantine session created on <b>${deploymentName}</b> has expired and 
                        the test environment is no longer available for troubleshooting.</p>
                      <p>However, EMT failed to delete the user <b>${sessionUsername}</b> which was created 
                        on the LMS of the test environment <b>${deploymentName}</b> for the duration of the quarantine session.</p>
                      <p>Please create support ticket on Bumblebee and meanwhile you can delete the user manually.</p>
                      <p>Command to delete the user: <b>userdel -fr ${sessionUsername}</b></p>
                      <h3>LMS Login Details:</h3>
                        <ul>
                          <li><b>Username:</b> ${sessionUsername}</li>
                          <li><b>Password:</b> ${sessionPassword}</li>
                        </ul>
                      <p>
                        Kind Regards, <br>
                        EMT
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
