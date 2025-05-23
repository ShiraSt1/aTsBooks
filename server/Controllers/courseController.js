const File = require("../models/File")
const fs = require("fs");
const path = require("path");
const mime = require("mime-types");
const { log } = require("console");

const nodemailer = require('nodemailer');
require('dotenv').config();
const sendEmail = require('../utils/sendEmail');

const registerToCourse = async(req, res) => {
    const { firstName, lastName, email ,message} = req.body

    if (!firstName || !lastName || !email ||!message) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const file = req.file ? [{
        filename: req.file.originalname,
        content: req.file.buffer,
        contentType: req.file.mimetype
    }] : [];
    console.log("Uploaded req.file:", req.file);
    console.log("Uploaded file:", file);

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

    sendEmail(process.env.GMAIL_ADMIN, `A new message from ${firstName} ${lastName}`, emailHtml, email,file?file:[])

    return res.status(201).json({
        message: `An email sent to administrator`
    })
}

const click=(req, res) => {
    console.log("clicked in server");
    res.status(200).json({ message: 'Clicked!' });
}

module.exports = { registerToCourse, click}