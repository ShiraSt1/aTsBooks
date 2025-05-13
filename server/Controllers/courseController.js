const nodemailer = require('nodemailer');
require('dotenv').config();
const sendEmail = require('../utils/sendEmail');

const registerToCourse = (req, res) => {
    const { firstName, lastName, email, schoolName, grade } = req.body
console.log(req.body);

    if (!firstName || !lastName || !email || !schoolName || !grade) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const emailHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color:rgb(23, 86, 221);">New Registration Pending Approval</h2>
        <p>
        A new girl is interested in joining the program!<br /><br />
        <strong>First Name:</strong> ${firstName}<br />
        <strong>Last Name:</strong> ${lastName}<br />
        <strong>School:</strong> ${schoolName}<br />
        <strong>Grade:</strong> ${grade}<br />
        <strong>Email:</strong> <a href="mailto:${email}" style="color:rgb(23, 86, 221);">${email}</a>
        </p>
        <p>
            Press reply below to answer her email.
        </p>
        <hr style="border: none; border-top: 1px solid #ddd;" />
        <p style="font-size: 0.9em; color: #888;">This is an automated email. Please do not reply to it.</p>
    </div>
`;

    sendEmail(process.env.GMAIL_ADMIN, 'A new registration to Take It Easy 🎉', emailHtml, email)

    return res.status(201).json({
        message: `An email sent to administrator`
    })
}

module.exports = { registerToCourse }