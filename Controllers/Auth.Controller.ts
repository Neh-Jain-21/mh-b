import jwt from "jsonwebtoken";
import path from "path";
import { Op } from "sequelize";
// CONFIGS
import Mailer from "../Configs/Mailer";
import Multer from "../Configs/Multer";
// TYPES
import { Request, Response } from "express";
// SCHEMAS
import Schemas from "../Schemas";
const User = Schemas.Users;
const Token = Schemas.Tokens;

class AuthController {
	async logIn(req: Request, res: Response) {
		try {
			const params = req.body;
			let userFound = null;

			if (params.username.includes("@")) {
				userFound = await User.findOne({
					attributes: ["id", "is_active", "username"],
					where: { email: params.username, password: params.password },
				});
			} else {
				userFound = await User.findOne({
					attributes: ["id", "is_active", "username"],
					where: { username: params.username, password: params.password },
				});
			}

			if (!userFound) {
				res.handler.validationError({}, "Email, username or password invalid");
				return;
			}

			if (userFound.is_active && process.env.JWT_SECRET) {
				const token = jwt.sign({ id: userFound.id }, process.env.JWT_SECRET);

				const tokenAvailable = await Token.findOne({ attributes: ["id"], where: { user_id: userFound.id } });

				if (tokenAvailable) {
					await Token.update({ token }, { where: { user_id: userFound.id } });
				} else {
					await Token.create({ user_id: userFound.id, auth_token: token });
				}

				res.handler.success({ token, username: userFound.username }, `Login Succesfull, Welcome ${userFound.username}`);
			} else {
				res.handler.notAllowed({}, "Please verify email first");
			}
		} catch (error) {
			console.log(error);
			res.handler.serverError();
		}
	}

	async signUp(req: Request, res: Response) {
		try {
			const params = req.body;

			const alreadyExists = await User.findOne({
				where: {
					[Op.or]: {
						email: params.email,
						username: params.username,
					},
				},
			});

			if (alreadyExists) {
				if (alreadyExists.email === params.email) {
					res.handler.conflict({}, "Email already taken");
					return;
				} else {
					res.handler.conflict({}, "Username already taken");
					return;
				}
			}

			const random = Math.floor(100000000 + Math.random() * 900000000);

			const userCreated = await User.create({
				username: params.username,
				email: params.email,
				password: params.password,
				otp: random,
				is_active: false,
			});

			if (userCreated) {
				let emailSent = true;
				const link = `${req.protocol}://${req.get("host")}/auth/verify-email?l1=${random}&l2=${userCreated.id}`;

				const callBack = (error: Error | null, info: any) => {
					if (error) {
						console.log(error);

						emailSent = false;
					} else {
						emailSent = true;
					}
				};

				Mailer(
					params.email,
					"Confirm Email",
					`Hello,<br> Please Click on the link to verify your email.<br><a href=${link}>Click here to verify</a>`,
					callBack
				);

				if (emailSent) {
					res.handler.success({}, `Welcome! Please verify your email`);
				} else {
					await User.destroy({ where: { id: userCreated.id } });

					res.handler.serverError({}, "Cannot send email!");
				}
			} else {
				res.handler.serverError();
			}
		} catch (error) {
			console.log(error);
			res.handler.serverError();
		}
	}

	async verifyEmail(req: Request, res: Response) {
		try {
			if (!req.query.l2 || !req.query.l1) {
				res.handler.validationError();
				return;
			}

			const userFound = await User.findOne({ where: { id: req.query.l2 } });

			if (!userFound) {
				res.handler.notFound({}, "User not found");
				return;
			}

			if (userFound.is_active) {
				res.sendFile(path.resolve("views/alreadyVerified.html"));
				return;
			}

			if (req.query.l1 == userFound.otp) {
				const updated = await User.update({ is_active: true, otp: null }, { where: { id: req.query.l2 } });

				if (updated) {
					res.sendFile(path.resolve("views/verifyEmail.html"));
				} else {
					res.handler.notFound({}, "Incorrect credentials");
				}
			} else {
				res.handler.notFound({}, "Incorrect credentials");
			}
		} catch (error) {
			console.log(error);
			res.handler.serverError();
		}
	}

	async resendVerifyEmail(req: Request, res: Response) {
		try {
			const random = Math.floor(100000000 + Math.random() * 900000000);
			const userUpdated = await User.update({ otp: random }, { where: { email: req.body.email }, returning: true });

			if (!userUpdated[0]) {
				res.handler.notFound({}, "Email not found!");
				return;
			}

			let emailSent = true;
			const link = `${req.protocol}://${req.get("host")}/auth/verify-email?l1=${random}&l2=${userUpdated[1][0].id}`;

			Mailer(
				req.body.email,
				"Confirm Email",
				`Hello,<br> Please Click on the link to verify your email.<br><a href=${link}>Click here to verify</a>`,
				(error: Error | null, info: any) => {
					if (error) {
						console.log(error);
						emailSent = false;
					} else {
						emailSent = true;
					}
				}
			);

			if (emailSent) {
				res.handler.success({}, "Email sent");
			} else {
				res.handler.serverError({}, "Cannot send email!");
			}
		} catch (error) {
			console.log(error);
			res.handler.serverError();
		}
	}

	async sendForgotPassEmail(req: Request, res: Response) {
		try {
			const random = Math.floor(100000000 + Math.random() * 900000000);
			const userUpdated = await User.update({ otp: random }, { where: { email: req.body.email } });

			if (!userUpdated[0]) {
				res.handler.notFound({}, "Email not found!");
				return;
			}

			let emailSent = true;

			Mailer(req.body.email, "Forgot Password", `${random} is OTP for resetting password.`, (error: Error | null, info: any) => {
				if (error) {
					console.log(error);
					emailSent = false;
				} else {
					emailSent = true;
				}
			});

			if (emailSent) {
				res.handler.success({}, "Email sent");
			} else {
				res.handler.serverError({}, "Cannot send email!");
			}
		} catch (error) {
			console.log(error);
			res.handler.serverError();
		}
	}

	async verifyOtp(req: Request, res: Response) {
		try {
			const details = await User.findOne({ where: { email: req.body.email, otp: req.body.otp } });

			if (!details) {
				res.handler.notFound();
				return;
			}

			res.handler.success({}, "Otp verified");
		} catch (error) {
			console.log(error);
			res.handler.serverError();
		}
	}

	async forgotPassword(req: Request, res: Response) {
		try {
			const userUpdated = await User.update({ password: req.body.password, otp: null }, { where: { email: req.body.email } });

			if (!userUpdated[0]) {
				res.handler.notFound({}, "Something went wrong!");
			}

			res.handler.success({}, "Password updated");
		} catch (error) {
			console.log(error);
			res.handler.serverError();
		}
	}

	async resetPassword(req: Request, res: Response) {
		try {
		} catch (error) {
			console.log(error);
			res.handler.serverError();
		}
	}

	async logOut(req: Request, res: Response) {
		try {
		} catch (error) {
			console.log(error);
			res.handler.serverError();
		}
	}
}

export default AuthController;
