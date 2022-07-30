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
// CONFIGS
const Mailer_1 = __importDefault(require("../Configs/Mailer"));
const Encrypt_1 = __importDefault(require("../Configs/Encrypt"));
// SCHEMAS
const Users_1 = __importDefault(require("../Database/Schemas/Users"));
const UserTokens_1 = __importDefault(require("../Database/Schemas/UserTokens"));
/** Authentication controller functions */
class AuthController {
    /** Authentication controller functions */
    constructor() { }
    /**
     * Login controller.
     * Can login with username or email both.
     * Generate or saves token to db.
     * @param req Express Request
     * @param res Express Response
     * @returns Promise<void>
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
                    userFound = yield Users_1.default.findOne({ email: params.username }, { _id: 1, username: 1, password: 1, is_active: 1, name: 1 });
                }
                else {
                    userFound = yield Users_1.default.findOne({ username: params.username }, { _id: 1, username: 1, password: 1, is_active: 1, name: 1 });
                }
                if (!userFound || (userFound && !(yield Encrypt_1.default.comparePassword(params.password, userFound.password)))) {
                    res.handler.validationError({}, "Email, username or password invalid");
                    return;
                }
                if (userFound.is_active && process.env.JWT_SECRET) {
                    const token = jsonwebtoken_1.default.sign({ _id: userFound._id }, process.env.JWT_SECRET);
                    const tokenAvailable = yield UserTokens_1.default.findOne({ user_id: userFound._id }, { _id: 1 });
                    if (tokenAvailable) {
                        yield UserTokens_1.default.updateOne({ user_id: userFound._id }, { token });
                    }
                    else {
                        yield UserTokens_1.default.create({ user_id: userFound._id, token });
                    }
                    res.handler.success({ token, name: userFound.name, username: userFound.username }, `Login Succesfull, Welcome ${userFound.username}`);
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
     * Signup controller
     * @param req Express Request
     * @param res Express Response
     * @returns Promise<void>
     */
    signUp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = req.body;
                if (!params.email || !params.username || !params.password) {
                    res.handler.validationError({});
                    return;
                }
                const alreadyExists = yield Users_1.default.findOne({ $or: [{ email: params.email, username: params.username }] });
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
                const userCreated = yield Users_1.default.create({ username: params.username, email: params.email, password: encryptedPassword, otp: random.toString(), is_active: false });
                if (userCreated) {
                    let emailSent = true;
                    const link = `${req.protocol}://${req.get("host")}/auth/verify-email?l1=${random}&l2=${userCreated._id}`;
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
                        yield Users_1.default.deleteOne({ _id: userCreated._id });
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
     * Verify email controller
     * @param req Express Request
     * @param res Express Response
     * @returns Promise<void>
     */
    verifyEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.query.l2 || !req.query.l1) {
                    res.handler.validationError();
                    return;
                }
                const userFound = yield Users_1.default.findOne({ _id: typeof req.query.l2 === "string" && parseInt(req.query.l2) });
                if (!userFound) {
                    res.handler.notFound({}, "User not found");
                    return;
                }
                if (userFound.is_active) {
                    res.render("AlreadyVerified");
                    return;
                }
                if (req.query.l1 == userFound.otp) {
                    const updated = yield Users_1.default.updateOne({ _id: typeof req.query.l2 === "string" && parseInt(req.query.l2) }, { is_active: true, otp: null });
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
     * @param req Express Request
     * @param res Express Response
     * @returns Promise<void>
     */
    resendVerifyEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const random = Math.floor(100000000 + Math.random() * 900000000);
                const userUpdated = yield Users_1.default.updateOne({ email: req.body.email }, { otp: random.toString() }, { projection: { _id: 1 } });
                if (!userUpdated.upsertedId) {
                    res.handler.notFound({}, "Email not found!");
                    return;
                }
                let emailSent = true;
                const link = `${req.protocol}://${req.get("host")}/auth/verify-email?l1=${random}&l2=${userUpdated.upsertedId}`;
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
     * @param req Express Request
     * @param res Express Response
     * @returns Promise<void>
     */
    sendForgotPassEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const random = Math.floor(100000000 + Math.random() * 900000000);
                const userUpdated = yield Users_1.default.updateOne({ email: req.body.email }, { otp: random.toString() });
                if (userUpdated.upsertedId) {
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
     * @param req Express Request
     * @param res Express Response
     * @returns Promise<void>
     */
    verifyOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const details = yield Users_1.default.findOne({ email: req.body.email, otp: req.body.otp }, { _id: 1 });
                if (!(details === null || details === void 0 ? void 0 : details._id)) {
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
     * @param req Express Request
     * @param res Express Response
     * @returns Promise<void>
     */
    forgotPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const password = yield Encrypt_1.default.cryptPassword(req.body.password);
                const userUpdated = yield Users_1.default.updateOne({ email: req.body.email }, { password, otp: null });
                if (!userUpdated.modifiedCount) {
                    res.handler.notFound({}, "Something went wrong!");
                    return;
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
     * @param req Express Request
     * @param res Express Response
     * @returns Promise<void>
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
     * @param req Express Request
     * @param res Express Response
     * @returns Promise<void>
     */
    logOut(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const loggedOut = yield UserTokens_1.default.deleteOne({ user_id: req.user._id });
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
