const User = require("../models/User")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();
const sendEmail = require('../utils/sendEmail');
const { log } = require("console");

const sendEmailFunction = async (to, subject, html) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
    });
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: to,
        subject: subject,
        html: html,
        replyTo: '',
    };
    try {
        const response = await transporter.sendMail(mailOptions);
        return response;
    } catch (error) {
        console.error('Error in sendEmail:', error.message);
        throw error;
    }
};

const getAllUser = async (req, res) => {
    const users = await User.find().lean()
    if (!users?.length)
        return res.status(404).json({ message: 'No users found' })
    res.json(users)
}

const updateUser = async (req, res) => {
    const { _id, name, phone, email } = req.body
    const user = await User.findById(_id)
    if (!email || !name) {
        return res.status(409).json({ message: 'email and name are required' })
    }
    if (!user)
        return res.status(400).json({ message: 'No user found' })
    const oldEmail = user.email
    if (oldEmail != email) {
        const foundEmail = await User.findOne({ email }).lean()
        if (foundEmail) {
            return res.status(401).json({ message: 'Cant connect' })
        }
    }
    user.name = name
    user.email = email
    user.phone = phone
    const updateUser = await user.save()
    if (!updateUser) { return res.status(201).send("The update failed") }
    res.json(updateUser)
}

const register = async (req, res) => {
    const { password, name, email, phone } = req.body

    if (!name || !password || !email) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const duplicate = await User.findOne({ email: email }).lean()
    if (duplicate) {
        return res.status(409).json({ message: "Duplicate email" })
    }
    const hashedpwd = await bcrypt.hash(password, 10)
    const userobject = { name, email, phone, confirm: false, roles: "User", password: hashedpwd }
    const user = await User.create(userobject)

    if (!user) {
        return res.status(400).json({ message: 'Invalid user received' })
    }

    const projectLink = process.env.PROJECT_PORT

    const emailHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color:rgb(23, 86, 221);">New Registration Pending Approval</h2>
        <p>
            A new user has registered: <strong>${name}</strong> (<a href="mailto:${email}" style="color:rgb(23, 86, 221);">${email}</a>).
        </p>
        <p>
            The user is waiting for approval. You can access the system through the button below:
        </p>
        <p>
            <a href="${projectLink}" style="display: inline-block; text-decoration: none; background-color: rgb(23, 86, 221); color: white; padding: 10px 20px; border-radius: 5px; font-size: 16px;">
                Go to the Website to confirm her
            </a>
        </p>
        <hr style="border: none; border-top: 1px solid #ddd;" />
        <p style="font-size: 0.9em; color: #888;">This is an automated email. Please do not reply to it.</p>
    </div>
`;
    sendEmail(process.env.GMAIL_ADMIN, 'New Registration to eTsbooks webSite 🎉', emailHtml)

    return res.status(201).json({
        message: `New user ${user.email} created`
    })
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password)
            return res.status(400).json({ message: 'All fields are required' })
        const foundUser = await User.findOne({ email }).lean()

        if (!foundUser) {
            return res.status(401).json({ message: 'Email not found' })
        }
        const Match = await bcrypt.compare(password, foundUser.password)
        if (!Match) return res.status(402).json({ message: 'Incorrect password' })

        if (!foundUser.confirm && foundUser.roles != "Admin") {
            return res.status(403).json({ message: 'You are not confirmed to login yet.' });
        }

        const NewUser = {
            _id: foundUser._id,
            name: foundUser.name,
            email: foundUser.email,
            phone: foundUser.phone,
            roles: foundUser.roles
        }

        const accessToken = jwt.sign(NewUser, process.env.ACCESS_TOKEN_SECRET)

        res.json({ accessToken, user: NewUser })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'An error occurred during login.' });
    }
}

const confirmUser = async (req, res) => {
    const { _id } = req.body

    const user = await User.findById(_id).exec()
    if (!user) {
        return res.status(400).json({ message: 'No user found' })
    }

    user.confirm = !user.confirm
    const updateUser = await user.save()
    const users = await User.find().lean()
    const projectLink = process.env.PROJECT_PORT;

    if (user.confirm) {
        try {
            const emailHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #1756DD;">hi ${user.name}</h2>
        <p>
            Your registration has been successfully completed! You can now log in and enjoy what we have to offer you.
        </p>
        <p>
            Click the button below to enter the site:
        </p>
        <p>
            <a href="${projectLink}" style="display: inline-block; text-decoration: none; background-color: #1756DD; color: white; padding: 10px 20px; border-radius: 5px; font-size: 16px;">
                aTsBooks
            </a>
        </p>
        <hr style="border: none; border-top: 1px solid #ddd;" />
        <p style="font-size: 16px; color: #888;">If you have any questions, feel free to contact us.</p>
        <p style="font-size: 16px;">
            <a href="mailto:${process.env.GMAIL_ADMIN}" style="color: #007BFF; text-decoration: underline;">
                Contact Support
            </a>
        </p>
    </div>
`;
            sendEmail(
                user.email,
                'aTsBooks Registration Confirmation',
                emailHtml
            );
        }
        catch (err) {
            console.error('Failed to send email:', err);
        }
    }
    else {
        try {
            const emailHtml = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #D9534F;">Access to aTsBooks Website Blocked 🚫</h2>
                <p>
                    Hello,${user.name}
                </p>
                <p>
                    We are sorry to inform you that your access to aTsBooks has been blocked.
                </p>
                <p>
                    If you believe this is a mistake or you would like to appeal, please contact our support team for further assistance.
                </p>
                <p>
                    <a href="mailto:${process.env.GMAIL_ADMIN}" style="display: inline-block; text-decoration: none; background-color: #D9534F; color: white; padding: 10px 20px; border-radius: 5px; font-size: 16px;">
                        Contact Support
                    </a>
                </p>
                <hr style="border: none; border-top: 1px solid #ddd;" />
                <p style="font-size: 0.9em; color: #888;">This is an automated email. Please do not reply to this email.</p>
            </div>
        `;
            sendEmail(
                user.email,
                'Access to aTsBooks Website Blocked 🚫',
                emailHtml
            );
        }
        catch (err) {
            console.error('Failed to send email:', err);
        }
    }
    res.json(users)
}

const deleteUser = async (req, res) => {
    const { id } = req.params
    const user = await User.findById(id)
    if (!user)
        return res.status(400).json({ message: 'No user found' })
    const result = await user.deleteOne()

    try {
        const emailHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #D9534F;">Access to aTsBooks Website Blocked 🚫</h2>
            <p>
                Hello,"${user.name}"
            </p>
            <p>
                We are sorry to inform you that your access to aTsBooks has been blocked.
            </p>
            <p>
                If you believe this is a mistake or you would like to appeal, please contact our support team for further assistance.
            </p>
            <p>
                <a href="mailto:${process.env.GMAIL_ADMIN}" style="display: inline-block; text-decoration: none; background-color: #D9534F; color: white; padding: 10px 20px; border-radius: 5px; font-size: 16px;">
                    Contact Support
                </a>
            </p>
            <hr style="border: none; border-top: 1px solid #ddd;" />
            <p style="font-size: 0.9em; color: #888;">This is an automated email. Please do not reply to this email.</p>
        </div>
    `;
        await sendEmail(
            user.email,
            'Access to aTsBooks Website Blocked 🚫',
            emailHtml
        );
    }
    catch (err) {
        console.error('Failed to send email:', err);
    }

    res.json(user)
}

const verificationCodes = {};

const sendVerificationCode = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }
    try {
        const user = await User.findOne({ email }).exec();

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const verificationCode = crypto.randomInt(100000, 999999);

        verificationCodes[email] = verificationCode;

        const emailHtml = `
            <p>Your password reset verification code is: <strong>${verificationCode}</strong></p>
            <p>If you did not request this, please ignore this email.</p>
        `;

        sendEmail(email, 'Password Reset Verification Code', emailHtml);
        res.status(200).json({ message: 'Verification code sent to email.' });
    } catch (err) {
        res.status(500).json({ message: 'Error sending verification code.', error: err.message });
    }
};

const resetPasswordWithCode = async (req, res) => {
    const { email, verificationCode, newPassword } = req.body;

    if (!email || !verificationCode || !newPassword) {
        return res.status(400).json({ message: 'Email, verification code, and new password are required.' });
    }

    try {
        if (verificationCodes[email] !== parseInt(verificationCode)) {
            return res.status(400).json({ message: 'Invalid verification code.' });
        }

        const user = await User.findOne({ email }).exec();

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;

        await user.save();

        delete verificationCodes[email];

        res.status(200).json({ message: 'Password reset successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Error resetting password.', error: err.message });
    }
};

module.exports = { register, login, getAllUser, updateUser, deleteUser, confirmUser, sendVerificationCode, resetPasswordWithCode }