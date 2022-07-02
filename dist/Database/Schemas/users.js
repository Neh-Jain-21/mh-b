"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = (sequelize, DataTypes) => {
    class Users extends sequelize_1.Model {
        static associate() { }
    }
    Users.init({
        username: DataTypes.STRING,
        email: DataTypes.STRING,
        password: DataTypes.STRING,
        tagline: DataTypes.STRING,
        bio: DataTypes.STRING,
        profile_img: DataTypes.STRING,
        cover_img: DataTypes.STRING,
        web_link: DataTypes.STRING,
        twitter_link: DataTypes.STRING,
        meta_link: DataTypes.STRING,
        instagram_link: DataTypes.STRING,
    }, {
        sequelize,
        modelName: "Users",
    });
    return Users;
};
