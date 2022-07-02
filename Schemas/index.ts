"use strict";

import fs from "fs";
import path from "path";
import { Sequelize, DataTypes } from "sequelize";
// DB CONFIG
import DBConfig from "../Configs/database.config";
// TYPES
import { DBModels } from "..";

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = DBConfig[env];

const db: DBModels = {};

if (config.database && config.username && config.password) {
	let sequelize = new Sequelize(config.database, config.username, config.password, { host: config.host, dialect: config.dialect });

	fs.readdirSync(__dirname)
		.filter((file) => {
			return file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".ts";
		})
		.forEach((file) => {
			const model = require(path.join(__dirname, file))(sequelize, DataTypes);
			db[model.name] = model;
		});

	Object.keys(db).forEach((modelName) => {
		if (db[modelName].associate) {
			db[modelName].associate(db);
		}
	});

	db.sequelize = sequelize;
	db.Sequelize = Sequelize;
}

module.exports = db;
