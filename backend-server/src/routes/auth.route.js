import { Router} from "express";
import { get_user_login , get_user_register , get_user_logout, get_user_profile , send_Verification_otp , verify_email , is_authenticated,send_reset_otp , reset_password} from "../controllers/auth.controller.js";
import {protected_routes} from "../middlewares/auth.middleware.js"
const router = Router();

router
.post("/login", get_user_login)
.post("/register", get_user_register)
.post ("/logout", get_user_logout)
.get("/profile",protected_routes ,get_user_profile)
.post("/send-verification-otp", protected_routes, send_Verification_otp)
.post("/verify-email", protected_routes, verify_email)
.post("/is-authenticated", protected_routes, is_authenticated)
.post("/send-reset-password-otp", send_reset_otp)
.post("/reset-password", reset_password)

export default router;