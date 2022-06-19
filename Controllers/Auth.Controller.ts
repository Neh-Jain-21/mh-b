import jwt from "jsonwebtoken";
import path from "path";
// SCHEMA
import User from "../database/schemas/userSchema";
import Token from "../database/schemas/tokenSchema";
// RESPONSE HANDLER
import Mailer from "../Configs/mailer";

class AuthController {
	async logIn(req, res) {
		try {
			const params = req.body;
			let userFound = null;

			if (params.username.includes("@")) {
				userFound = await User.findOne({
					email: params.username,
					password: params.password,
				});
			} else {
				userFound = await User.findOne({
					username: params.username,
					password: params.password,
				});
			}

			if (userFound) {
				if (userFound.verified === 0) {
					res.handler.success(res, {}, "Please verify email first");
				} else {
					const token = jwt.sign({ id: userFound._id }, process.env.JWT_SECRET);

					const tokenAvailable = await Token.findOne({ user_id: userFound._id }, { _id: 0, user_id: 1 });

					if (tokenAvailable) {
						await Token.updateOne({ user_id: userFound._id }, { auth_token: token });
					} else {
						await Token.create({ user_id: userFound._id, auth_token: token });
					}

					resHandler.success(res, { token, username: userFound.username }, `Login Succesfull, Welcome ${userFound.username}`);
				}
			} else {
				resHandler.fail(res, 409, {}, "Email, username or password invalid");
			}
		} catch (error) {
			resHandler.serverError(res, error);
		}
	}

	async signUp(req, res) {
		try {
			const params = req.body;

			const emailExists = await User.findOne({ email: params.email });

			if (emailExists) {
				resHandler.fail(res, 409, {}, "Email already Exists");
			} else {
				const usernameExists = await User.findOne({ username: params.username });

				if (usernameExists) {
					resHandler.fail(res, 409, {}, "Try Different Username");
				} else {
					const random = Math.floor(100000000 + Math.random() * 900000000);

					const userCreated = await User.create({
						username: params.username,
						email: params.email,
						password: params.password,
						verify_id: random,
					});

					if (userCreated) {
						const link = `${req.protocol}://${req.get("host")}/auth/verify-email?id=${random}&userid=${userCreated._id}`;

						let emailSent = true;

						const callBack = async (error, info) => {
							if (error) {
								console.log(error);

								emailSent = false;
							} else {
								emailSent = true;
							}
						};

						sendEmail(
							params.email,
							"Confirm Email",
							`Hello,<br> Please Click on the link to verify your email.<br><a href=${link}>Click here to verify</a>`,
							callBack
						);

						if (emailSent) {
							resHandler.success(res, {}, `Welcome! Please verify your email`);
						} else {
							await User.deleteOne({ _id: userCreated._id });

							resHandler.fail(res, 400, {}, "Cannot send email!");
						}
					} else {
						resHandler.fail(res, 400, {}, "Something went wrong");
					}
				}
			}
		} catch (error) {
			resHandler.serverError(res, error);
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
			resHandler.serverError(res, error);
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
						resHandler.success(res, {}, `Email sent`);
					} else {
						resHandler.fail(res, 400, {}, "Something went wrong");
					}
				}
			} else {
				resHandler.fail(res, 409, {}, "Email not found!");
			}
		} catch (error) {
			resHandler.serverError(res, error);
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
						resHandler.success(res, {}, `Email sent`);
					} else {
						resHandler.fail(res, 400, {}, "Cannot send email!");
					}
				}
			} else {
				resHandler.fail(res, 409, {}, "Email not found!");
			}
		} catch (error) {
			resHandler.serverError(res, error);
		}
	}

	async verifyOtp(req, res) {
		try {
			const params = req.body;

			const emailExists = await User.findOne({ email: params.email });

			if (emailExists) {
				const otpCorrect = await User.findOne({ email: params.email, otp: params.otp });

				if (otpCorrect) {
					resHandler.success(res, {}, `Otp verified`);
				} else {
					resHandler.fail(res, 409, {}, `Incorrect otp`);
				}
			} else {
				resHandler.fail(res, 409, {}, "Email not found!");
			}
		} catch (error) {
			resHandler.serverError(res, error);
		}
	}

	async forgotPassword(req, res) {
		try {
			const params = req.body;

			const userUpdated = await User.findOneAndUpdate({ email: params.email }, { $set: { password: params.password }, $unset: { otp: 1 } });

			if (userUpdated) {
				resHandler.success(res, {}, "Password Changed");
			} else {
				resHandler.fail(res, 409, {}, "Something went wrong!");
			}
		} catch (error) {
			resHandler.serverError(res, error);
		}
	}

	async resetPassword(req, res) {
		try {
		} catch (error) {
			resHandler.serverError(res, error);
		}
	}

	async logOut(req, res) {
		try {
		} catch (error) {
			resHandler.serverError(res, error);
		}
	}
}

module.exports = AuthController;
