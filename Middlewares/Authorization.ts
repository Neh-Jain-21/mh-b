import jwt from "jsonwebtoken";
// TYPES
import { Request, Response, NextFunction } from "express";
// SCHEMAS
import Schemas from "../Schemas";

const User = Schemas.UserSchema;
const Token = Schemas.TokenSchema;

const Authorization = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const token = req.headers["authorization"];

		if (!token) {
			res.handler.validationError(undefined, "Invalid token");
		}

		const secret = process.env.JWT_SECRET;

		if (token && secret) {
			const data: any = jwt.verify(token, secret);

			const userData = await Token?.findOne({
				where: { token: token, user_id: data.id },
			});
			console.log(JSON.stringify(userData));

			if (!userData) {
				res.handler.unauthorized();
				return;
			}

			req.user = { id: parseInt(data.id) };

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
