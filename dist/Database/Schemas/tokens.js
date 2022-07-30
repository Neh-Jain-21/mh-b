"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const TokenSchema = (sequelize, DataTypes) => {
    class Tokens extends sequelize_1.Model {
        static associate(models) {
            models.UserSchema && Tokens.belongsTo(models.UserSchema, { foreignKey: "user_id" });
        }
    }
    Tokens.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        user_id: DataTypes.INTEGER,
        token: DataTypes.STRING,
    }, {
        sequelize,
        modelName: "Tokens",
    });
    return Tokens;
};
exports.default = TokenSchema;
