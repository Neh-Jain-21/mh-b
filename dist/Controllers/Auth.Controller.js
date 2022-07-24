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
const sequelize_1 = require("sequelize");
// CONFIGS
const Mailer_1 = __importDefault(require("../Configs/Mailer"));
const Encrypt_1 = __importDefault(require("../Configs/Encrypt"));
// SCHEMAS
const Schemas_1 = __importDefault(require("../Schemas"));
const User = Schemas_1.default.UserSchema;
const Token = Schemas_1.default.TokenSchema;
/** Authentication controller functions */
class AuthController {
    /** Authentication controller functions */
    constructor() { }
    /**
     * Login route controller.
     * Can login with username or email both.
     * Generate or saves token to db.
     * @Response token and username
     */
    logIn(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = req.body;
                if (!params.username || !params.password) {
                    res.handler.validationError({});
                    return;
                }
                let userFound = null;
                if (params.username.includes("@")) {
                    userFound = yield (User === null || User === void 0 ? void 0 : User.findOne({
                        attributes: ["id", "is_active", "username", "name", "password"],
                        where: { email: params.username },
                    }));
                }
                else {
                    userFound = yield (User === null || User === void 0 ? void 0 : User.findOne({
                        attributes: ["id", "is_active", "username", "name", "password"],
                        where: { username: params.username },
                    }));
                }
                if (!userFound || (userFound && !(yield Encrypt_1.default.comparePassword(params.password, userFound.getDataValue("password"))))) {
                    res.handler.validationError({}, "Email, username or password invalid");
                    return;
                }
                if (userFound.getDataValue("is_active") && process.env.JWT_SECRET) {
                    const token = jsonwebtoken_1.default.sign({ id: userFound.getDataValue("id") }, process.env.JWT_SECRET);
                    const tokenAvailable = yield (Token === null || Token === void 0 ? void 0 : Token.findOne({ attributes: ["id"], where: { user_id: userFound.getDataValue("id") } }));
                    if (tokenAvailable) {
                        yield (Token === null || Token === void 0 ? void 0 : Token.update({ token }, { where: { user_id: userFound.getDataValue("id") } }));
                    }
                    else {
                        yield (Token === null || Token === void 0 ? void 0 : Token.create({ user_id: userFound.getDataValue("id"), token }));
                    }
                    res.handler.success({ token, name: userFound.getDataValue("name"), username: userFound.getDataValue("username") }, `Login Succesfull, Welcome ${userFound.getDataValue("username")}`);
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
    /**
     * Signup route controller
     */
    signUp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = req.body;
                if (!params.email || !params.username || !params.password) {
                    res.handler.validationError({});
                    return;
                }
                const alreadyExists = yield (User === null || User === void 0 ? void 0 : User.findOne({
                    where: {
                        [sequelize_1.Op.or]: {
                            email: params.email,
                            username: params.username,
                        },
                    },
                }));
                if (alreadyExists) {
                    if (alreadyExists.getDataValue("email") === params.email) {
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
                const userCreated = yield (User === null || User === void 0 ? void 0 : User.create({
                    username: params.username,
                    email: params.email,
                    password: encryptedPassword,
                    otp: random.toString(),
                    is_active: false,
                }));
                if (userCreated) {
                    let emailSent = true;
                    const link = `${req.protocol}://${req.get("host")}/auth/verify-email?l1=${random}&l2=${userCreated.getDataValue("id")}`;
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
                        yield (User === null || User === void 0 ? void 0 : User.destroy({ where: { id: userCreated.getDataValue("id") } }));
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
    /**
     * Verify email controller. Triggered wheh link sent through email.
     * @Renders VerfyEmail template
     */
    verifyEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.query.l2 || !req.query.l1) {
                    res.handler.validationError();
                    return;
                }
                const userFound = yield (User === null || User === void 0 ? void 0 : User.findOne({ where: { id: typeof req.query.l2 === "string" && parseInt(req.query.l2) } }));
                if (!userFound) {
                    res.handler.notFound({}, "User not found");
                    return;
                }
                if (userFound.getDataValue("is_active")) {
                    res.render("AlreadyVerified");
                    return;
                }
                if (req.query.l1 == userFound.getDataValue("otp")) {
                    const updated = yield (User === null || User === void 0 ? void 0 : User.update({ is_active: true, otp: null }, { where: { id: typeof req.query.l2 === "string" && parseInt(req.query.l2) } }));
                    if (updated) {
                        res.render("VerifyEmail");
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
    /**
     * Resend verify email controller
     */
    resendVerifyEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const random = Math.floor(100000000 + Math.random() * 900000000);
                const userUpdated = yield (User === null || User === void 0 ? void 0 : User.update({ otp: random.toString() }, { where: { email: req.body.email }, returning: true }));
                if (userUpdated && !userUpdated[0]) {
                    res.handler.notFound({}, "Email not found!");
                    return;
                }
                let emailSent = true;
                const link = userUpdated && `${req.protocol}://${req.get("host")}/auth/verify-email?l1=${random}&l2=${userUpdated[1][0].getDataValue("id")}`;
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
    /**
     * Forgot pass email controller
     */
    sendForgotPassEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const random = Math.floor(100000000 + Math.random() * 900000000);
                const userUpdated = yield (User === null || User === void 0 ? void 0 : User.update({ otp: random.toString() }, { where: { email: req.body.email } }));
                if (userUpdated && !userUpdated[0]) {
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
    /**
     * Otp verification sent on email for forgotpass
     */
    verifyOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const details = yield (User === null || User === void 0 ? void 0 : User.findOne({ where: { email: req.body.email, otp: req.body.otp } }));
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
    /**
     * Change password once otp verified
     */
    forgotPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const password = yield Encrypt_1.default.cryptPassword(req.body.password);
                const userUpdated = yield (User === null || User === void 0 ? void 0 : User.update({ password, otp: null }, { where: { email: req.body.email } }));
                if (userUpdated && !userUpdated[0]) {
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
    /**
     * Reset password controller when user is logged in
     */
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
    /**
     * Destroys token and logs out user
     */
    logOut(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const loggedOut = yield (Token === null || Token === void 0 ? void 0 : Token.destroy({ where: { user_id: req.user.id } }));
                loggedOut ? res.handler.success({}, "Logged out") : res.handler.serverError();
            }
            catch (error) {
                console.log(error);
                res.handler.serverError();
            }
        });
    }
}
module.exports = AuthController;
