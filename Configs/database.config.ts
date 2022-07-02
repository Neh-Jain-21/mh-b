import dotenv from "dotenv";
dotenv.config();
import { DB_CREDENTIAL } from "./Constants";

const DBConfig: { [key: string]: any } = {
	development: DB_CREDENTIAL,
	test: DB_CREDENTIAL,
	production: DB_CREDENTIAL,
};

module.exports = DBConfig;
