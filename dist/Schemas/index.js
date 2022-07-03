"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sequelize_1 = require("sequelize");
// DB CONFIG
const database_config_1 = __importDefault(require("../Configs/database.config"));
const basename = path_1.default.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = database_config_1.default[env];
const db = {};
if (config.database && config.username && config.password) {
    let sequelize = new sequelize_1.Sequelize(config.database, config.username, config.password, { host: config.host, dialect: config.dialect });
    fs_1.default.readdirSync(__dirname)
        .filter((file) => {
        return file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js";
    })
        .forEach((file) => {
        const model = require(path_1.default.join(__dirname, file))(sequelize, sequelize_1.DataTypes);
        db[model.name] = model;
    });
    Object.keys(db).forEach((modelName) => {
        var _a, _b;
        if (db[modelName].associate) {
            (_b = (_a = db[modelName]).associate) === null || _b === void 0 ? void 0 : _b.call(_a, db);
        }
    });
}
exports.default = db;
