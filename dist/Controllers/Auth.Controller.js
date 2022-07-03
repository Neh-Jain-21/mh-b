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
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const path_1 = __importDefault(require("path"));
const sequelize_1 = require("sequelize");
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
                res.handler.serverError();
            }
        });
    }
    signUp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = req.body;
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
                        res.handler.conflict({}, "Email already Exists");
                        return;
                    }
                    else {
                        res.handler.conflict({}, "Username already Exists");
                        return;
                    }
                }
                const random = Math.floor(100000000 + Math.random() * 900000000);
                const userCreated = yield User.create({
                    username: params.username,
                    email: params.email,
                    password: params.password,
                    verify_id: random,
                });
                if (userCreated) {
                    const link = `${req.protocol}://${req.get("host")}/auth/verify-email?id=${random}&userid=${userCreated._id}`;
                    let emailSent = true;
                    const callBack = (error, info) => __awaiter(this, void 0, void 0, function* () {
                        if (error) {
                            console.log(error);
                            emailSent = false;
                        }
                        else {
                            emailSent = true;
                        }
                    });
                    sendEmail(params.email, "Confirm Email", `Hello,<br> Please Click on the link to verify your email.<br><a href=${link}>Click here to verify</a>`, callBack);
                    if (emailSent) {
                        res.handler.success(res, {}, `Welcome! Please verify your email`);
                    }
                    else {
                        yield User.deleteOne({ _id: userCreated._id });
                        res.handler.fail(res, 400, {}, "Cannot send email!");
                    }
                }
                else {
                    res.handler.fail(res, 400, {}, "Something went wrong");
                }
            }
            catch (error) {
                res.handler.serverError(res, error);
            }
        });
    }
    verifyEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userFound = yield User.findOne({ _id: req.query.userid });
                if (userFound) {
                    if (userFound.verified) {
                        res.sendFile(path_1.default.resolve("views/alreadyVerified.html"));
                    }
                    else {
                        if (parseInt(req.query.id) === userFound.verify_id) {
                            const updated = yield User.updateOne({ _id: req.query.userid }, { verified: 1, $unset: { verify_id: 1 } });
                            if (updated) {
                                res.sendFile(path_1.default.resolve("views/verifyEmail.html"));
                            }
                            else {
                                res.status(400).send("Incorrect credentials");
                            }
                        }
                        else {
                            res.status(400).send("Incorrect credentials");
                        }
                    }
                }
                else {
                    res.status(404).send("User not found");
                }
            }
            catch (error) {
                res.handler.serverError(res, error);
            }
        });
    }
    resendVerifyEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = req.body;
                const emailExists = yield User.findOne({ email: params.email });
                if (emailExists) {
                    const random = Math.floor(100000000 + Math.random() * 900000000);
                    const userUpdated = yield User.updateOne({ email: params.email }, { verify_id: random });
                    if (userUpdated) {
                        const link = `${req.protocol}://${req.get("host")}/auth/verify-email?id=${random}&userid=${userUpdated._id}`;
                        const mailSent = sendEmail(params.email, "Confirm Email", `Hello,<br> Please Click on the link to verify your email.<br><a href=${link}>Click here to verify</a>`);
                        if (mailSent) {
                            res.handler.success(res, {}, `Email sent`);
                        }
                        else {
                            res.handler.fail(res, 400, {}, "Something went wrong");
                        }
                    }
                }
                else {
                    res.handler.fail(res, 409, {}, "Email not found!");
                }
            }
            catch (error) {
                res.handler.serverError(res, error);
            }
        });
    }
    sendForgotPassEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = req.body;
                const emailExists = yield User.findOne({ email: params.email });
                if (emailExists) {
                    const random = Math.floor(100000000 + Math.random() * 900000000);
                    const userUpdated = yield User.updateOne({ email: params.email }, { otp: random });
                    if (userUpdated) {
                        let emailSent = true;
                        const callBack = (error, info) => __awaiter(this, void 0, void 0, function* () {
                            if (error) {
                                console.log(error);
                                emailSent = false;
                            }
                            else {
                                emailSent = true;
                            }
                        });
                        sendEmail(params.email, "Forgot Password", `${random} is OTP for resetting password.`, callBack);
                        if (emailSent) {
                            res.handler.success(res, {}, `Email sent`);
                        }
                        else {
                            res.handler.fail(res, 400, {}, "Cannot send email!");
                        }
                    }
                }
                else {
                    res.handler.fail(res, 409, {}, "Email not found!");
                }
            }
            catch (error) {
                res.handler.serverError(res, error);
            }
        });
    }
    verifyOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = req.body;
                const emailExists = yield User.findOne({ email: params.email });
                if (emailExists) {
                    const otpCorrect = yield User.findOne({ email: params.email, otp: params.otp });
                    if (otpCorrect) {
                        res.handler.success(res, {}, `Otp verified`);
                    }
                    else {
                        res.handler.fail(res, 409, {}, `Incorrect otp`);
                    }
                }
                else {
                    res.handler.fail(res, 409, {}, "Email not found!");
                }
            }
            catch (error) {
                res.handler.serverError(res, error);
            }
        });
    }
    forgotPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = req.body;
                const userUpdated = yield User.findOneAndUpdate({ email: params.email }, { $set: { password: params.password }, $unset: { otp: 1 } });
                if (userUpdated) {
                    res.handler.success(res, {}, "Password Changed");
                }
                else {
                    res.handler.fail(res, 409, {}, "Something went wrong!");
                }
            }
            catch (error) {
                res.handler.serverError(res, error);
            }
        });
    }
    resetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
            }
            catch (error) {
                res.handler.serverError(res, error);
            }
        });
    }
    logOut(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
            }
            catch (error) {
                res.handler.serverError(res, error);
            }
        });
    }
}
exports.default = AuthController;
