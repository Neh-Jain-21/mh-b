"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = require("express");
// CONTROLLERS
const Auth_Controller_1 = __importDefault(require("../Controllers/Auth.Controller"));
const router = (0, express_1.Router)();
const Auth = new Auth_Controller_1.default();
router.post("/login", Auth.logIn);
router.post("/signup", Auth.signUp);
router.get("/verify-email", Auth.verifyEmail);
router.post("/resend-verify-email", Auth.resendVerifyEmail);
router.post("/send-forgotpass-email", Auth.sendForgotPassEmail);
router.post("/verify-otp", Auth.verifyOtp);
router.post("/forgotpass", Auth.forgotPassword);
module.exports = router;
