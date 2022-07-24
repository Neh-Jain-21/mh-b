import { Router } from "express";
// CONTROLLERS
import AuthController from "../Controllers/Auth.Controller";
// MIDDLEWARE
import Authorization from "../Middlewares/Authorization";

const router = Router();
const Auth = new AuthController();

router.post("/login", Auth.logIn);
router.post("/signup", Auth.signUp);
router.get("/verify-email", Auth.verifyEmail);
router.post("/resend-verify-email", Auth.resendVerifyEmail);
router.post("/send-forgotpass-email", Auth.sendForgotPassEmail);
router.post("/verify-otp", Auth.verifyOtp);
router.post("/forgotpass", Auth.forgotPassword);
router.get("/logout", Authorization, Auth.logOut);

export = router;
