import { Model, Sequelize, DataTypes as DataTypesType, Optional } from "sequelize";
import { DBSchemas } from "..";

export interface TokenAttributes {
	id: number;
	user_id: number;
	token: string;
}

export interface TokenCreationAttributes extends Optional<TokenAttributes, "id"> {}

const TokenSchema = (sequelize: Sequelize, DataTypes: typeof DataTypesType) => {
	class Tokens extends Model<TokenAttributes, TokenCreationAttributes> implements TokenAttributes {
		public id!: number;
		public user_id!: number;
		public token!: string;

		static associate(models: DBSchemas) {
			models.UserSchema && Tokens.belongsTo(models.UserSchema, { foreignKey: "user_id" });
		}
	}

	Tokens.init(
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
			},
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

export default TokenSchema;
