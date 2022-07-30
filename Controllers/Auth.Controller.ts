import jwt from "jsonwebtoken";
// CONFIGS
import Mailer from "../Configs/Mailer";
import Encrypt from "../Configs/Encrypt";
// TYPES
import { Request, Response } from "express";
// SCHEMAS
import Users from "../Database/Schemas/Users";
import UserTokens from "../Database/Schemas/UserTokens";

/** Authentication controller functions */
class AuthController {
	/** Authentication controller functions */
	constructor() {}

	/**
	 * Login controller.
	 * Can login with username or email both.
	 * Generate or saves token to db.
	 * @param req Express Request
	 * @param res Express Response
	 * @returns Promise<void>
	 */
	async logIn(req: Request, res: Response) {
		try {
			const params = req.body;

			if (!params.username || !params.password) {
				res.handler.validationError({});
				return;
			}

			let userFound = null;

			if (params.username.includes("@")) {
				userFound = await Users.findOne({ email: params.username }, { _id: 1, username: 1, password: 1, is_active: 1, name: 1 });
			} else {
				userFound = await Users.findOne({ username: params.username }, { _id: 1, username: 1, password: 1, is_active: 1, name: 1 });
			}

			if (!userFound || (userFound && !(await Encrypt.comparePassword(params.password, userFound.password)))) {
				res.handler.validationError({}, "Email, username or password invalid");
				return;
			}

			if (userFound.is_active && process.env.JWT_SECRET) {
				const token = jwt.sign({ _id: userFound._id }, process.env.JWT_SECRET);

				const tokenAvailable = await UserTokens.findOne({ user_id: userFound._id }, { _id: 1 });

				if (tokenAvailable) {
					await UserTokens.updateOne({ user_id: userFound._id }, { token });
				} else {
					await UserTokens.create({ user_id: userFound._id, token });
				}

				res.handler.success({ token, name: userFound.name, username: userFound.username }, `Login Succesfull, Welcome ${userFound.username}`);
			} else {
				res.handler.notAllowed({}, "Please verify email first");
			}
		} catch (error) {
			console.log(error);
			res.handler.serverError();
		}
	}

	/**
	 * Signup controller
	 * @param req Express Request
	 * @param res Express Response
	 * @returns Promise<void>
	 */
	async signUp(req: Request, res: Response) {
		try {
			const params = req.body;

			if (!params.email || !params.username || !params.password) {
				res.handler.validationError({});
				return;
			}

			const alreadyExists = await Users.findOne({ $or: [{ email: params.email, username: params.username }] });

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
			const encryptedPassword = await Encrypt.cryptPassword(params.password);

			const userCreated = await Users.create({ username: params.username, email: params.email, password: encryptedPassword, otp: random.toString(), is_active: false });

			if (userCreated) {
				let emailSent = true;
				const link = `${req.protocol}://${req.get("host")}/auth/verify-email?l1=${random}&l2=${userCreated._id}`;

				const callBack = (error: Error | null, info: any) => {
					if (error) {
						console.log(error);

						emailSent = false;
					} else {
						emailSent = true;
					}
				};

				Mailer(params.email, "Confirm Email", `Hello,<br> Please Click on the link to verify your email.<br><a href=${link}>Click here to verify</a>`, callBack);

				if (emailSent) {
					res.handler.success({}, `Welcome! Please verify your email`);
				} else {
					await Users.deleteOne({ _id: userCreated._id });

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

	/**
	 * Verify email controller
	 * @param req Express Request
	 * @param res Express Response
	 * @returns Promise<void>
	 */
	async verifyEmail(req: Request, res: Response) {
		try {
			if (!req.query.l2 || !req.query.l1) {
				res.handler.validationError();
				return;
			}

			const userFound = await Users.findOne({ _id: typeof req.query.l2 === "string" && parseInt(req.query.l2) });

			if (!userFound) {
				res.handler.notFound({}, "User not found");
				return;
			}

			if (userFound.is_active) {
				res.render("AlreadyVerified");
				return;
			}

			if (req.query.l1 == userFound.otp) {
				const updated = await Users.updateOne({ _id: typeof req.query.l2 === "string" && parseInt(req.query.l2) }, { is_active: true, otp: null });

				if (updated) {
					res.render("VerifyEmail");
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

	/**
	 * Resend verify email controller
	 * @param req Express Request
	 * @param res Express Response
	 * @returns Promise<void>
	 */
	async resendVerifyEmail(req: Request, res: Response) {
		try {
			const random = Math.floor(100000000 + Math.random() * 900000000);
			const userUpdated = await Users.updateOne({ email: req.body.email }, { otp: random.toString() }, { projection: { _id: 1 } });

			if (!userUpdated.upsertedId) {
				res.handler.notFound({}, "Email not found!");
				return;
			}

			let emailSent = true;
			const link = `${req.protocol}://${req.get("host")}/auth/verify-email?l1=${random}&l2=${userUpdated.upsertedId}`;

			Mailer(req.body.email, "Confirm Email", `Hello,<br> Please Click on the link to verify your email.<br><a href=${link}>Click here to verify</a>`, (error: Error | null, info: any) => {
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

	/**
	 * Forgot pass email controller
	 * @param req Express Request
	 * @param res Express Response
	 * @returns Promise<void>
	 */
	async sendForgotPassEmail(req: Request, res: Response) {
		try {
			const random = Math.floor(100000000 + Math.random() * 900000000);
			const userUpdated = await Users.updateOne({ email: req.body.email }, { otp: random.toString() });

			if (userUpdated.upsertedId) {
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

	/**
	 * Otp verification sent on email for forgotpass
	 * @param req Express Request
	 * @param res Express Response
	 * @returns Promise<void>
	 */
	async verifyOtp(req: Request, res: Response) {
		try {
			const details = await Users.findOne({ email: req.body.email, otp: req.body.otp }, { _id: 1 });

			if (!details?._id) {
				res.handler.notFound();
				return;
			}

			res.handler.success({}, "Otp verified");
		} catch (error) {
			console.log(error);
			res.handler.serverError();
		}
	}

	/**
	 * Change password once otp verified
	 * @param req Express Request
	 * @param res Express Response
	 * @returns Promise<void>
	 */
	async forgotPassword(req: Request, res: Response) {
		try {
			const password = await Encrypt.cryptPassword(req.body.password);

			const userUpdated = await Users.updateOne({ email: req.body.email }, { password, otp: null });

			if (!userUpdated.modifiedCount) {
				res.handler.notFound({}, "Something went wrong!");
				return;
			}

			res.handler.success({}, "Password updated");
		} catch (error) {
			console.log(error);
			res.handler.serverError();
		}
	}

	/**
	 * Reset password controller when user is logged in
	 * @param req Express Request
	 * @param res Express Response
	 * @returns Promise<void>
	 */
	async resetPassword(req: Request, res: Response) {
		try {
		} catch (error) {
			console.log(error);
			res.handler.serverError();
		}
	}

	/**
	 * Destroys token and logs out user
	 * @param req Express Request
	 * @param res Express Response
	 * @returns Promise<void>
	 */
	async logOut(req: Request, res: Response) {
		try {
			const loggedOut = await UserTokens.deleteOne({ user_id: req.user._id });

			loggedOut ? res.handler.success({}, "Logged out") : res.handler.serverError();
		} catch (error) {
			console.log(error);
			res.handler.serverError();
		}
	}
}

export = AuthController;
