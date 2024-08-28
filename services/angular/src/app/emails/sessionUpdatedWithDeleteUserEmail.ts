export function sessionUpdatedWithDeleteUser(
  environment: string, sessionUsername: string, vmType: string,
) {

  /* tslint:disable:max-line-length */
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
                      <h4 style="color:white">EMT did not delete the user</h4>
                  </td>
              </tr>
              <tr>
                  <td style="background-color:#ededed; padding:20px">
                      <p>Hi Ops,</p>
                      <p> The session assigned for troubleshooting on
                      test environment <b>${environment}</b> has been updated.</p>
                      <p> The user ${sessionUsername} has to be deleted from <b>${vmType}</b> of the test environment as part of session update
                      but it was not deleted by EMT as there were active terminal(s)</p>
                      <p>Please contact the person/team and check why they are still in the environment.</p>
                      <p>Please delete the user manually if user is not being used.</p>
                      <p>Command to delete the user: <b>userdel -fr ${sessionUsername}</b></p>
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

  </html>`;
  /* tslint:enable:max-line-length */
}
