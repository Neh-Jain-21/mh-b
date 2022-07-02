"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const Mailer = (to, subject, html, callBack) => {
    //set mail transporter
    const transporter = nodemailer_1.default.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        requireTLS: true,
        secure: false,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS,
        },
    });
    const mailOptions = { from: `"MediaHost" <${process.env.EMAIL}>`, to, subject, html };
    transporter.sendMail(mailOptions, callBack);
};
exports.default = Mailer;
