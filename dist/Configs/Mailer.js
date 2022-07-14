"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const nodemailer_1 = __importDefault(require("nodemailer"));
/**
 * Email sender.
 *
 * Update details in env to send email.
 */
const Mailer = (to, subject, html, callBack) => {
    // SET MAIL TRANSPORTER
    const transporter = nodemailer_1.default.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        requireTLS: true,
        secure: false,
        auth: { user: process.env.EMAIL, pass: process.env.PASS },
    });
    const mailOptions = { from: `"MediaHost" <${process.env.EMAIL}>`, to, subject, html };
    transporter.sendMail(mailOptions, callBack);
};
module.exports = Mailer;
