"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const bcrypt_1 = __importDefault(require("bcrypt"));
const Encrypt = {
    cryptPassword: (password) => bcrypt_1.default
        .genSalt(10)
        .then((salt) => bcrypt_1.default.hash(password, salt))
        .then((hash) => hash),
    comparePassword: (password, hashPassword) => bcrypt_1.default.compare(password, hashPassword).then((resp) => resp),
};
module.exports = Encrypt;
