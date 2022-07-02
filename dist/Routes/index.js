"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Routes = (app) => {
    app.get("/", (req, res) => {
        console.log("HERE 111111111111");
        res.handler.success();
    });
    // app.use("/auth", require("./Auth"));
};
exports.default = Routes;
