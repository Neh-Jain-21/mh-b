"use strict";

import { Model, Sequelize, DataTypes as DataTypesType } from "sequelize";
import { DBSchemas } from "..";

export default (sequelize: Sequelize, DataTypes: typeof DataTypesType) => {
	class Tokens extends Model {
		static associate(models: DBSchemas) {
			console.log(models);

			Tokens.belongsTo(models.Users);
		}
	}

	Tokens.init(
		{
			user_id: DataTypes.INTEGER,
			token: DataTypes.STRING,
		},
		{
			sequelize,
			modelName: "Tokens",
		}
	);

	return Tokens;
};
