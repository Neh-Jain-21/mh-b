"use strict";
const Constants_1 = require("./Constants");
const DBConfig = {
    development: Constants_1.DB_CREDENTIAL,
    test: Constants_1.DB_CREDENTIAL,
    production: Constants_1.DB_CREDENTIAL,
};
module.exports = DBConfig;
