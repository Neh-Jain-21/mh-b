"use strict";
const sequelize_1 = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Tokens extends sequelize_1.Model {
        static associate(models) {
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
