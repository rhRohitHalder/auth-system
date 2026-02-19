import { Router} from "express";
import { get_user_login , get_user_register , get_user_logout, get_user_profile} from "../controllers/auth.controller.js";
import {protected_routes} from "../middlewares/auth.middleware.js"
const router = Router();

router
.post("/login", get_user_login)
.post("/register", get_user_register)
.post ("/logout", get_user_logout)
.get("/profile",protected_routes ,get_user_profile)
export default router;