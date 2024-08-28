module.exports = {
  sessionExpiredEmail(session, sessionAssignees, deployment) {
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
                      <h4 style="color:white">A Quarantined Test Environment Has Been Deallocated</h4>
                  </td>
              </tr>
              <tr>
                  <td style="background-color:#ededed; padding:20px">
                      <p>Hi ${sessionAssignees},</p>
                      <p>The test environment <b>${deployment[0].name}</b> provided to you for troubleshooting has expired.</p>
                      <p>The test environment is no longer available for troubleshooting.</p>
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
  },
};
