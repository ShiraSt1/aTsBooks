const File = require("../models/File")
const fs = require("fs");
const path = require("path");
const mime = require("mime-types");

const nodemailer = require('nodemailer');
require('dotenv').config();
const sendEmail = require('../utils/sendEmail');

const registerToCourse = async (req, res) => {
    const { firstName, lastName, email, message } = req.body

    if (!firstName || !lastName || !email || !message) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const files = req.files
        ? req.files.map(file => ({
            filename: file.originalname,
            path: file.path,
            contentType: file.mimetype
        })) : [];

    const emailHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <p>
        ${firstName} ${lastName} left a message for you:
        </p>
        <strong>${message}</strong>
        <p>
            Press reply below to answer her email.
        </p>
        <hr style="border: none; border-top: 1px solid #ddd;" />
    </div>
`;

    await sendEmail(process.env.GMAIL_ADMIN, `A new message from ${firstName} ${lastName}`, emailHtml, email, files ? files : [])
    return res.status(201).json({
        message: `An email sent to administrator`
    })
}

const newsLetter = async (req, res) => {
    const { name, email } = req.body

    if (!name || !email) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const emailHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <p>
 (:תשמח שתוסיפי אותה לקבלת מיילים על הספרים ${name}
        </p>
        <p>
           ${email} :המייל שלה הוא 
        </p>
        <hr style="border: none; border-top: 1px solid #ddd;" />
    </div>
`;

    await sendEmail(process.env.GMAIL_ADMIN, `בקשת הצטרפות לקבלת מיילים`, emailHtml, email)

    // HTML (English)
    const newsletterWelcomeHtml = `
<div style="font-family: Arial, sans-serif; line-height: 1.7; color: #333;">
  <h2 style="color: rgb(23, 86, 221); margin-top: 0;">You're subscribed 🎉</h2>
  <p>Hi <strong>${name}</strong>,</p>
  <p>
    Thank you for subscribing to our newsletter. Your subscription was successful.
    You'll receive emails from us whenever we have updates to share.
  </p>
  
  <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
  <p style="font-size: 0.9em; color: #888;">
    This is an automated email. Please do not reply.
  </p>
</div>
`;


    // Send to the subscriber:
    sendEmail(
        email,
        'Subscription confirmed – welcome to our newsletter',
        newsletterWelcomeHtml,
    );


    return res.status(201).json({
        message: `An email sent to administrator`
    })
}
module.exports = { registerToCourse, newsLetter }