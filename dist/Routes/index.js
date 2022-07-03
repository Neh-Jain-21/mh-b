"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Routes = (app) => {
    app.get("/", (req, res) => {
        res.handler.success();
    });
    app.use("/auth", require("./Auth"));
};
exports.default = Routes;
