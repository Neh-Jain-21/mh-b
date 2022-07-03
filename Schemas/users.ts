"use strict";

import { Model, Sequelize, DataTypes as DataTypesType } from "sequelize";
import { DBSchemas } from "..";

export default (sequelize: Sequelize, DataTypes: typeof DataTypesType) => {
	class Users extends Model {
		static associate(models: DBSchemas) {
			Users.hasMany(models.Tokens, {
				foreignKey: "user_id",
				onDelete: "CASCADE",
			});
		}
	}

	Users.init(
		{
			username: DataTypes.STRING,
			email: DataTypes.STRING,
			password: DataTypes.STRING,
			name: DataTypes.STRING,
			tagline: DataTypes.STRING,
			bio: DataTypes.STRING,
			profile_img: DataTypes.STRING,
			cover_img: DataTypes.STRING,
			web_link: DataTypes.STRING,
			twitter_link: DataTypes.STRING,
			meta_link: DataTypes.STRING,
			instagram_link: DataTypes.STRING,
			otp: DataTypes.STRING,
			is_active: DataTypes.BOOLEAN,
		},
		{
			sequelize,
			modelName: "Users",
		}
	);

	return Users;
};
