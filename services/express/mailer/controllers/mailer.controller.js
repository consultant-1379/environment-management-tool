const { exec } = require('child_process');
const fileSystem = require('fs');
const logger = require('./../../logger/logger');

/**
 * mailer.controller.js
 *
 * @description :: Server-side logic for sending emails.
 */
module.exports = {
  send(req, res) {
    const pathInfo = 'POST /mailer';
    let emailId;
    let ccId;
    let { emailSubject } = req.body;
    if (process.env.NODE_ENV === 'STAG' || process.env.NODE_ENV === 'DEV') {
      emailId = 'BumbleBee.ENM@tcs.com';
      emailSubject = `${process.env.NODE_ENV} ENV: ${emailSubject}`;
    } else {
      ({ emailId } = req.body);
      ({ ccId } = req.body);
    }
    const { emailBody } = req.body;

    // write body to file to it can be ready by python mailer
    fileSystem.writeFile('./emailBody.html', emailBody, (err) => {
      if (err) logger.error(pathInfo, 'Error writing HTML file for email.', err);
    });

    exec(`python ./mailer/controllers/sendEmail.py -s "${emailSubject}" -r "${emailId}" -c "${ccId}"`, (err, stdout, stderr) => {
      if (err) {
        logger.error(pathInfo, 'ERROR calling python file sendEmail.py', stderr);
      }
      return res.status(200).json();
    });
  },
};
