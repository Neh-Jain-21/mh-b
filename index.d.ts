import { Request, Response } from "express-serve-static-core";
import { ModelStatic } from "sequelize";
import ResponseHandler from "./Configs/ResponseHandler";

declare module "express-serve-static-core" {
	export interface Response {
		/**
		 * Custom response handler
		 */
		handler: ResponseHandler;
	}
}

export interface ICustomModel extends ModelStatic<Model> {
	associate?: (DBSchemas) => void;
}

export type DBSchemas = {
	[Users: string]: ICustomModel;
	[Tokens: string]: ICustomModel;
};
