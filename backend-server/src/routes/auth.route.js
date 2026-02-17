import { Router} from "express";
import { get_user_login as loginUser, get_user_register as registerUser} from "../controllers/auth.controller.js";
const router = Router();

router
.get("/login", get_user_login)
.get("/register", get_user_register)
.post("/login", loginUser)
.post("/register", registerUser)


export default router;