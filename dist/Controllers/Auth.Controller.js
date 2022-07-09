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
const path_1 = __importDefault(require("path"));
const sequelize_1 = require("sequelize");
// CONFIGS
const Mailer_1 = __importDefault(require("../Configs/Mailer"));
const Encrypt_1 = __importDefault(require("../Configs/Encrypt"));
// SCHEMAS
const Schemas_1 = __importDefault(require("../Schemas"));
const User = Schemas_1.default.Users;
const Token = Schemas_1.default.Tokens;
class AuthController {
    logIn(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = req.body;
                let userFound = null;
                if (params.username.includes("@")) {
                    userFound = yield User.findOne({
                        attributes: ["id", "is_active", "username"],
                        where: { email: params.username, password: params.password },
                    });
                }
                else {
                    userFound = yield User.findOne({
                        attributes: ["id", "is_active", "username"],
                        where: { username: params.username, password: params.password },
                    });
                }
                if (!userFound) {
                    res.handler.validationError({}, "Email, username or password invalid");
                    return;
                }
                if (userFound.is_active && process.env.JWT_SECRET) {
                    const token = jsonwebtoken_1.default.sign({ id: userFound.id }, process.env.JWT_SECRET);
                    const tokenAvailable = yield Token.findOne({ attributes: ["id"], where: { user_id: userFound.id } });
                    if (tokenAvailable) {
                        yield Token.update({ token }, { where: { user_id: userFound.id } });
                    }
                    else {
                        yield Token.create({ user_id: userFound.id, auth_token: token });
                    }
                    res.handler.success({ token, username: userFound.username }, `Login Succesfull, Welcome ${userFound.username}`);
                }
                else {
                    res.handler.notAllowed({}, "Please verify email first");
                }
            }
            catch (error) {
                console.log(error);
                res.handler.serverError();
            }
        });
    }
    signUp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = req.body;
                if (!params.email || !params.username || !params.password) {
                    res.handler.validationError({});
                    return;
                }
                const alreadyExists = yield User.findOne({
                    where: {
                        [sequelize_1.Op.or]: {
                            email: params.email,
                            username: params.username,
                        },
                    },
                });
                if (alreadyExists) {
                    if (alreadyExists.email === params.email) {
                        res.handler.conflict({}, "Email already taken");
                        return;
                    }
                    else {
                        res.handler.conflict({}, "Username already taken");
                        return;
                    }
                }
                const random = Math.floor(100000000 + Math.random() * 900000000);
                const encryptedPassword = yield Encrypt_1.default.cryptPassword(params.password);
                const userCreated = yield User.create({
                    username: params.username,
                    email: params.email,
                    password: encryptedPassword,
                    otp: random,
                    is_active: false,
                });
                if (userCreated) {
                    let emailSent = true;
                    const link = `${req.protocol}://${req.get("host")}/auth/verify-email?l1=${random}&l2=${userCreated.id}`;
                    const callBack = (error, info) => {
                        if (error) {
                            console.log(error);
                            emailSent = false;
                        }
                        else {
                            emailSent = true;
                        }
                    };
                    (0, Mailer_1.default)(params.email, "Confirm Email", `Hello,<br> Please Click on the link to verify your email.<br><a href=${link}>Click here to verify</a>`, callBack);
                    if (emailSent) {
                        res.handler.success({}, `Welcome! Please verify your email`);
                    }
                    else {
                        yield User.destroy({ where: { id: userCreated.id } });
                        res.handler.serverError({}, "Cannot send email!");
                    }
                }
                else {
                    res.handler.serverError();
                }
            }
            catch (error) {
                console.log(error);
                res.handler.serverError();
            }
        });
    }
    verifyEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.query.l2 || !req.query.l1) {
                    res.handler.validationError();
                    return;
                }
                const userFound = yield User.findOne({ where: { id: req.query.l2 } });
                if (!userFound) {
                    res.handler.notFound({}, "User not found");
                    return;
                }
                if (userFound.is_active) {
                    res.sendFile(path_1.default.resolve("views/alreadyVerified.html"));
                    return;
                }
                if (req.query.l1 == userFound.otp) {
                    const updated = yield User.update({ is_active: true, otp: null }, { where: { id: req.query.l2 } });
                    if (updated) {
                        res.sendFile(path_1.default.resolve("views/verifyEmail.html"));
                    }
                    else {
                        res.handler.notFound({}, "Incorrect credentials");
                    }
                }
                else {
                    res.handler.notFound({}, "Incorrect credentials");
                }
            }
            catch (error) {
                console.log(error);
                res.handler.serverError();
            }
        });
    }
    resendVerifyEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const random = Math.floor(100000000 + Math.random() * 900000000);
                const userUpdated = yield User.update({ otp: random }, { where: { email: req.body.email }, returning: true });
                if (!userUpdated[0]) {
                    res.handler.notFound({}, "Email not found!");
                    return;
                }
                let emailSent = true;
                const link = `${req.protocol}://${req.get("host")}/auth/verify-email?l1=${random}&l2=${userUpdated[1][0].id}`;
                (0, Mailer_1.default)(req.body.email, "Confirm Email", `Hello,<br> Please Click on the link to verify your email.<br><a href=${link}>Click here to verify</a>`, (error, info) => {
                    if (error) {
                        console.log(error);
                        emailSent = false;
                    }
                    else {
                        emailSent = true;
                    }
                });
                if (emailSent) {
                    res.handler.success({}, "Email sent");
                }
                else {
                    res.handler.serverError({}, "Cannot send email!");
                }
            }
            catch (error) {
                console.log(error);
                res.handler.serverError();
            }
        });
    }
    sendForgotPassEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const random = Math.floor(100000000 + Math.random() * 900000000);
                const userUpdated = yield User.update({ otp: random }, { where: { email: req.body.email } });
                if (!userUpdated[0]) {
                    res.handler.notFound({}, "Email not found!");
                    return;
                }
                let emailSent = true;
                (0, Mailer_1.default)(req.body.email, "Forgot Password", `${random} is OTP for resetting password.`, (error, info) => {
                    if (error) {
                        console.log(error);
                        emailSent = false;
                    }
                    else {
                        emailSent = true;
                    }
                });
                if (emailSent) {
                    res.handler.success({}, "Email sent");
                }
                else {
                    res.handler.serverError({}, "Cannot send email!");
                }
            }
            catch (error) {
                console.log(error);
                res.handler.serverError();
            }
        });
    }
    verifyOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const details = yield User.findOne({ where: { email: req.body.email, otp: req.body.otp } });
                if (!details) {
                    res.handler.notFound();
                    return;
                }
                res.handler.success({}, "Otp verified");
            }
            catch (error) {
                console.log(error);
                res.handler.serverError();
            }
        });
    }
    forgotPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userUpdated = yield User.update({ password: req.body.password, otp: null }, { where: { email: req.body.email } });
                if (!userUpdated[0]) {
                    res.handler.notFound({}, "Something went wrong!");
                }
                res.handler.success({}, "Password updated");
            }
            catch (error) {
                console.log(error);
                res.handler.serverError();
            }
        });
    }
    resetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
            }
            catch (error) {
                console.log(error);
                res.handler.serverError();
            }
        });
    }
    logOut(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
            }
            catch (error) {
                console.log(error);
                res.handler.serverError();
            }
        });
    }
}
module.exports = AuthController;
