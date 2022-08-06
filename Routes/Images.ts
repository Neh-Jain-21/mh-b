import { Router } from "express";
// CONTROLLERS
import ImagesController from "../Controllers/Images.Controller";
// MIDDLEWARE
import Authorization from "../Middlewares/Authorization";
// CONFIGS
import Multer from "../Configs/Multer";

const router = Router();
const Image = new ImagesController();

router.get("/", Authorization, Image.list);
router.post("/", Authorization, Multer("./uploads/images/", "uploadMedia").single("image"), Image.add);
router.get("/verify-email", Image.verifyEmail);
router.post("/resend-verify-email", Image.resendVerifyEmail);
router.post("/send-forgotpass-email", Image.sendForgotPassEmail);
router.post("/verify-otp", Image.verifyOtp);
router.post("/forgotpass", Image.forgotPassword);
router.get("/logout", Authorization, Image.logOut);

export = router;
