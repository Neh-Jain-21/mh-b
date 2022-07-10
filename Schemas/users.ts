import { Model, Sequelize, DataTypes as DataTypesType, Optional } from "sequelize";
import { DBSchemas } from "..";

export interface UserAttributes {
	id: number;
	username: string;
	email: string;
	password: string;
	name: string | null;
	tagline: string | null;
	bio: string | null;
	profile_img: string | null;
	cover_img: string | null;
	web_link: string | null;
	twitter_link: string | null;
	meta_link: string | null;
	instagram_link: string | null;
	otp: string | null;
	is_active: boolean;
}

export interface UserCreationAttributes extends Optional<UserAttributes, "id"> {}

const UserSchema = (sequelize: Sequelize, DataTypes: typeof DataTypesType) => {
	class Users extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
		public id!: number;
		public username!: string;
		public email!: string;
		public password!: string;
		public name!: string | null;
		public tagline!: string | null;
		public bio!: string | null;
		public profile_img!: string | null;
		public cover_img!: string | null;
		public web_link!: string | null;
		public twitter_link!: string | null;
		public meta_link!: string | null;
		public instagram_link!: string | null;
		public otp!: string | null;
		public is_active!: boolean;
		public readonly createdAt!: Date;
		public readonly updatedAt!: Date;

		static associate(models: DBSchemas) {
			models.TokenSchema &&
				Users.hasMany(models.TokenSchema, {
					foreignKey: "user_id",
					onDelete: "CASCADE",
				});
		}
	}

	Users.init(
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
			},
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

export default UserSchema;
