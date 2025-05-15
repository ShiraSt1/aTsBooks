const nodemailer = require('nodemailer');
require('dotenv').config();
const sendEmail = require('../utils/sendEmail');

const registerToCourse = (req, res) => {
    const { firstName, lastName, email ,message} = req.body

    if (!firstName || !lastName || !email ||!message) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const emailHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <p>
        ${firstName} ${lastName} left a message for you:<br />
        <strong>${message}</strong>
        </p>
        <br/>
        <p>
            Press reply below to answer her email.
        </p>
        <hr style="border: none; border-top: 1px solid #ddd;" />
    </div>
`;

    sendEmail(process.env.GMAIL_ADMIN, `A new message from ${firstName} ${lastName}`, emailHtml, email)

    return res.status(201).json({
        message: `An email sent to administrator`
    })
}

module.exports = { registerToCourse }