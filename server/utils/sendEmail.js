const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, 
    pass: process.env.GMAIL_PASS
  }
});

const sendEmail = (to, subject, html,replyTo=null, attachments = []) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject,
    html,
    replyTo: replyTo || process.env.GMAIL_USER,
    attachments
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.error('Error in sending email:', error);
    } else {
    }
  });
};

module.exports = sendEmail;