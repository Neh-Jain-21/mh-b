"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
if (process.env.DB_DATABASE && process.env.DB_USERNAME && process.env.DB_PASSWORD) {
    const sequelize = new sequelize_1.Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
        host: process.env.DB_HOST,
        dialect: "postgres",
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },
    });
    sequelize
        .authenticate()
        .then(() => {
        console.log("Connected to database :)");
    })
        .catch((reason) => {
        console.log(reason);
        console.error("Unable to connect to the database :(");
    });
}
