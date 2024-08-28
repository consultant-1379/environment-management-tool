import sys, urllib, json, datetime, os, smtplib, re, argparse, socket, logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage

SMTP_SERVER = 'smtp-central.internal.ericsson.com'
FROM_EMAIL_ADDRESS = 'environment.management.tool@ericsson.com'
HOME_DIRECTORY = '/usr/src/app/'

class EMTMailer():
    """
    Mailer functionality for sending emails from EMT
    """

    def __init__(self, recipients, subject, cc=None):
        self.message = MIMEMultipart()
        self.message['From'] = FROM_EMAIL_ADDRESS
        self.parse_recipients(recipients)
        self.parse_cc(cc)
        self.message['Subject'] = subject
        self.server = smtplib.SMTP(SMTP_SERVER)

    def parse_recipients(self, recipients):
        """
        :param recipients: who we want to send the email to
        Functionality to check the format of recipients and do formating as necessary.
        """
        if (',' in recipients):
            all_reciptients = recipients.split(",")
            self.recipients = all_reciptients
            self.message['To'] = ", ".join(all_reciptients)
        else:
            self.recipients =  eval('[\'' + recipients + '\']')
            self.message['To'] = recipients

    def parse_cc(self, cc):
        """
        :param cc: who we want to CC on the email
        Functionality to check the format of cc recipients and do formating as necessary.
        """
        if (',' in cc):
            all_cc = cc.split(",")
            self.cc = all_cc
            self.message['cc'] = ", ".join(all_cc)
        else:
            self.cc =  eval('[\'' + cc + '\']')
            self.message['cc'] = cc


    def get_html_body(self):
        """
        Read the HTML file to be used for the email.
        """
        html_file_body = open(HOME_DIRECTORY + 'emailBody.html', 'r')
        return html_file_body.read()

    def attach_image(self):
        """
        Attach the image to the email and set the content ID.
        """
        image = open(HOME_DIRECTORY + 'mailer/controllers/ericsson_logo.png', 'rb')
        message_image = MIMEImage(image.read())
        image.close()

        message_image.add_header('Content-ID', '<ericssonLogo>')
        self.message.attach(message_image)

    def attach_html_body(self):
        """
        Attach the HTML which can be used as the body for the email.
        """
        body_as_html = MIMEText(self.get_html_body(), 'html')
        self.message.attach(body_as_html)

    def send_message(self):
        """
        Send the email.
        """
        text = self.message.as_string()
        to_address = self.recipients + self.cc
        self.server.sendmail(FROM_EMAIL_ADDRESS, to_address, text)
        self.server.quit()

    def remove_file(self):
        """
        Remove the html file. Clean up for the docker container.
        """
        os.remove(HOME_DIRECTORY + 'emailBody.html')

def parseArgs():
    """
    Function used to parse the arguments passed in
    """
    parser = argparse.ArgumentParser()
    parser.add_argument('-s', '--subject',
    help="Subject for the email",
    required=True)
    parser.add_argument('-r', '--recipients',
    help="recipients we want to send email to",
    required=True)
    parser.add_argument('-c', '--cc', 
    help="people or distribution lists we want to send the email to")
    return parser.parse_args()

def email_retry(max_retry):
    """
    Retry wrapper function that takes in an EMTMailer right before
    the intended mailer.send_email() to retry any failures in sending.
    :param max_retry:
    """
    for send_attempt in range(1, max_retry+1):
        try:
            parsed_args = parseArgs()
            mailer = EMTMailer(parsed_args.recipients, parsed_args.subject, parsed_args.cc)
            mailer.attach_html_body()
            mailer.send_message()
            mailer.remove_file()
            break
        except socket.error as socket_error:
            logging.warning("Attempt %d to send email failed...", send_attempt)
            logging.error("Socket Error: %s", os.strerror(socket_error.errno))
            if send_attempt >= max_retry:
                logging.error("Could not send email after %d attempts.", max_retry)

if __name__ == "__main__":
    email_retry(5)
