import { Request, Response } from "express-serve-static-core";
import ResponseHandler from "./Configs/ResponseHandler";

declare module "express-serve-static-core" {
	export interface Response {
		/** Custom response handler */
		handler: ResponseHandler;
	}

	export interface Request {
		/** User details if logged in */
		user: { _id: string };
	}
}
