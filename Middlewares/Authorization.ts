import jwt from "jsonwebtoken";
// TYPES
import { Request, Response, NextFunction } from "express";
// SCHEMAS
import UserTokens from "../Database/Schemas/UserTokens";

const Authorization = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const token = req.headers["authorization"];

		const secret = process.env.JWT_SECRET;

		if (token && secret) {
			const data: any = jwt.verify(token, secret);

			const userData = await UserTokens.findOne({ token: token, user_id: data._id }, { _id: 1 });

			if (!userData) {
				res.handler.unauthorized();
				return;
			}

			req.user = { _id: data._id };

			next();
		} else {
			res.handler.unauthorized();
		}
	} catch (error) {
		res.handler.serverError();
		console.log(error);
	}
};

export = Authorization;
