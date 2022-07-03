"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = (sequelize, DataTypes) => {
    class Tokens extends sequelize_1.Model {
        static associate(models) {
            console.log(models);
            Tokens.belongsTo(models.Users);
        }
    }
    Tokens.init({
        user_id: DataTypes.INTEGER,
        token: DataTypes.STRING,
    }, {
        sequelize,
        modelName: "Tokens",
    });
    return Tokens;
};
