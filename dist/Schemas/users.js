"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const UserSchema = (sequelize, DataTypes) => {
    class Users extends sequelize_1.Model {
        static associate(models) {
            models.TokenSchema &&
                Users.hasMany(models.TokenSchema, {
                    foreignKey: "user_id",
                    onDelete: "CASCADE",
                });
        }
    }
    Users.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
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
    }, {
        sequelize,
        modelName: "Users",
    });
    return Users;
};
exports.default = UserSchema;
