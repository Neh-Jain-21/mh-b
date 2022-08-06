import jwt from "jsonwebtoken";
// CONFIGS
import Mailer from "../Configs/Mailer";
import Encrypt from "../Configs/Encrypt";
// TYPES
import { Request, Response } from "express";
// SCHEMAS
import Users from "../Database/Schemas/Users";
import UserTokens from "../Database/Schemas/UserTokens";
import Images from "../Database/Schemas/Images";

/** Image controller functions */
class ImagesController {
	/** Image controller functions */
	constructor() {}

	/**
	 * Image list controller.
	 * @param req Express Request
	 * @param res Express Response
	 * @returns Promise<void>
	 */
	async list(req: Request, res: Response) {
		try {
			const params = req.body;

			const countQuery = Images.count({ user_id: req.user._id });
			const listQuery = Images.find(
				{ user_id: req.user._id },
				{ _id: 0, title: 1, caption: 1, isPrivate: 1, image: 1 },
				{ limit: 10, skip: params.skip, sort: { field: "desc", updatedAt: -1 } }
			);

			const [count, list] = await Promise.all([countQuery, listQuery]);

			res.handler.success({ count: count || 0, list: list || [] });
		} catch (error) {
			console.log(error);
			res.handler.serverError();
		}
	}

	/**
	 * Add image controller
	 * @param req Express Request
	 * @param res Express Response
	 * @returns Promise<void>
	 */
	async add(req: Request, res: Response) {
		try {
			const params = req.body;

			const image = Images.create({ image: req.file?.originalname, title: params?.title || null, caption: params?.caption || null, isPrivate: params?.isPrivate || true, user_id: req.user._id });

			res.handler.created(image);
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

export = ImagesController;
