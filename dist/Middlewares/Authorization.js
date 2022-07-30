"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// SCHEMAS
const UserTokens_1 = __importDefault(require("../Database/Schemas/UserTokens"));
const Authorization = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.headers["authorization"];
        const secret = process.env.JWT_SECRET;
        if (token && secret) {
            const data = jsonwebtoken_1.default.verify(token, secret);
            const userData = yield UserTokens_1.default.findOne({ token: token, user_id: data._id }, { _id: 1 });
            if (!userData) {
                res.handler.unauthorized();
                return;
            }
            req.user = { _id: data._id };
            next();
        }
        else {
            res.handler.unauthorized();
        }
    }
    catch (error) {
        res.handler.serverError();
        console.log(error);
    }
});
module.exports = Authorization;
