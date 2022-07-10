import { Request, Response } from "express-serve-static-core";
import { ModelStatic, Sequelize, DataTypes as DataTypesType, Model } from "sequelize";
import ResponseHandler from "./Configs/ResponseHandler";
// SCHEMAS
import { UserAttributes, UserCreationAttributes } from "./Schemas/users";
import { TokenAttributes, TokenCreationAttributes } from "./Schemas/tokens";

declare module "express-serve-static-core" {
	export interface Response {
		/**
		 * Custom response handler
		 */
		handler: ResponseHandler;
	}

	export interface Request {
		/**
		 * User details if logged in
		 */
		user: { id: number };
	}
}

export interface ICustomModel extends ModelStatic<Model> {
	associate?: (DBSchemas) => void;
}

export type DBSchemas = {
	["UserSchema"]?: ModelStatic<Model<UserAttributes, UserCreationAttributes>>;
	["TokenSchema"]?: ModelStatic<Model<TokenAttributes, TokenCreationAttributes>>;
};
