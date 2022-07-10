import fs from "fs";
import path from "path";
import { Sequelize, DataTypes } from "sequelize";
// DB CONFIG
import DBConfig from "../Configs/database.config";
// TYPES
import { ICustomModel, DBSchemas } from "..";

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = DBConfig[env];

const db: DBSchemas = {};

if (config.database && config.username && config.password) {
	let sequelize = new Sequelize(config.database, config.username, config.password, { host: config.host, dialect: config.dialect });

	fs.readdirSync(__dirname)
		.filter((file) => {
			return file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js";
		})
		.forEach((file) => {
			const model: { default: (sequelize: Sequelize, dataTypes: typeof DataTypes) => ICustomModel } = require(path.join(__dirname, file));
			// @ts-ignore
			db[model.default.name] = model.default(sequelize, DataTypes);
		});

	Object.keys(db).forEach((modelName) => {
		// @ts-ignore
		if (db[modelName].associate) {
			// @ts-ignore
			db[modelName].associate?.(db);
		}
	});
}

export = db;
