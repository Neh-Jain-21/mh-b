"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Auth_1 = __importDefault(require("./Auth"));
const Routes = (app) => {
    app.get("/", (req, res) => {
        res.render("MediaHost");
    });
    app.use("/auth", Auth_1.default);
};
exports.default = Routes;
