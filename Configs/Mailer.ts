import nodemailer from "nodemailer";

/**
 * Email sender.
 *
 * Update details in env to send email.
 */
const Mailer = (to: string, subject: string, html: any, callBack: (err: Error | null, info: any) => void) => {
	const transporter = nodemailer.createTransport({
		host: "smtp.gmail.com",
		port: 587,
		requireTLS: true,
		secure: false,
		auth: { user: process.env.EMAIL, pass: process.env.PASS },
	});

	const mailOptions = { from: `"MediaHost" <${process.env.EMAIL}>`, to, subject, html };

	transporter.sendMail(mailOptions, callBack);
};

export = Mailer;
