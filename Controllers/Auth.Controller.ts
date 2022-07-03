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

			const userCreated = await User.create({ username: params.username, email: params.email, password: params.password, otp: random });

			if (userCreated) {
				let emailSent = true;
				const link = `${req.protocol}://${req.get("host")}/auth/verify-email?l1=${random}&l2=${userCreated.id}`;

				const callBack = async (error: Error | null, info: any) => {
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
			res.handler.serverError();
		}
	}

	async verifyEmail(req, res) {
		try {
			const userFound = await User.findOne({ _id: req.query.userid });

			if (userFound) {
				if (userFound.verified) {
					res.sendFile(path.resolve("views/alreadyVerified.html"));
				} else {
					if (parseInt(req.query.id) === userFound.verify_id) {
						const updated = await User.updateOne({ _id: req.query.userid }, { verified: 1, $unset: { verify_id: 1 } });

						if (updated) {
							res.sendFile(path.resolve("views/verifyEmail.html"));
						} else {
							res.status(400).send("Incorrect credentials");
						}
					} else {
						res.status(400).send("Incorrect credentials");
					}
				}
			} else {
				res.status(404).send("User not found");
			}
		} catch (error) {
			res.handler.serverError(res, error);
		}
	}

	async resendVerifyEmail(req, res) {
		try {
			const params = req.body;

			const emailExists = await User.findOne({ email: params.email });

			if (emailExists) {
				const random = Math.floor(100000000 + Math.random() * 900000000);

				const userUpdated = await User.updateOne({ email: params.email }, { verify_id: random });

				if (userUpdated) {
					const link = `${req.protocol}://${req.get("host")}/auth/verify-email?id=${random}&userid=${userUpdated._id}`;

					const mailSent = sendEmail(
						params.email,
						"Confirm Email",
						`Hello,<br> Please Click on the link to verify your email.<br><a href=${link}>Click here to verify</a>`
					);

					if (mailSent) {
						res.handler.success(res, {}, `Email sent`);
					} else {
						res.handler.fail(res, 400, {}, "Something went wrong");
					}
				}
			} else {
				res.handler.fail(res, 409, {}, "Email not found!");
			}
		} catch (error) {
			res.handler.serverError(res, error);
		}
	}

	async sendForgotPassEmail(req, res) {
		try {
			const params = req.body;

			const emailExists = await User.findOne({ email: params.email });

			if (emailExists) {
				const random = Math.floor(100000000 + Math.random() * 900000000);

				const userUpdated = await User.updateOne({ email: params.email }, { otp: random });

				if (userUpdated) {
					let emailSent = true;

					const callBack = async (error, info) => {
						if (error) {
							console.log(error);

							emailSent = false;
						} else {
							emailSent = true;
						}
					};

					sendEmail(params.email, "Forgot Password", `${random} is OTP for resetting password.`, callBack);

					if (emailSent) {
						res.handler.success(res, {}, `Email sent`);
					} else {
						res.handler.fail(res, 400, {}, "Cannot send email!");
					}
				}
			} else {
				res.handler.fail(res, 409, {}, "Email not found!");
			}
		} catch (error) {
			res.handler.serverError(res, error);
		}
	}

	async verifyOtp(req, res) {
		try {
			const params = req.body;

			const emailExists = await User.findOne({ email: params.email });

			if (emailExists) {
				const otpCorrect = await User.findOne({ email: params.email, otp: params.otp });

				if (otpCorrect) {
					res.handler.success(res, {}, `Otp verified`);
				} else {
					res.handler.fail(res, 409, {}, `Incorrect otp`);
				}
			} else {
				res.handler.fail(res, 409, {}, "Email not found!");
			}
		} catch (error) {
			res.handler.serverError(res, error);
		}
	}

	async forgotPassword(req, res) {
		try {
			const params = req.body;

			const userUpdated = await User.findOneAndUpdate({ email: params.email }, { $set: { password: params.password }, $unset: { otp: 1 } });

			if (userUpdated) {
				res.handler.success(res, {}, "Password Changed");
			} else {
				res.handler.fail(res, 409, {}, "Something went wrong!");
			}
		} catch (error) {
			res.handler.serverError(res, error);
		}
	}

	async resetPassword(req, res) {
		try {
		} catch (error) {
			res.handler.serverError(res, error);
		}
	}

	async logOut(req, res) {
		try {
		} catch (error) {
			res.handler.serverError(res, error);
		}
	}
}

export default AuthController;
