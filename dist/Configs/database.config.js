"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const Constants_1 = require("./Constants");
exports.DBConfig = {
    development: Constants_1.DB_CREDENTIAL,
    test: Constants_1.DB_CREDENTIAL,
    production: Constants_1.DB_CREDENTIAL,
};
console.log(exports.DBConfig.development);
// module.exports = DBConfig;
exports.default = exports.DBConfig;
