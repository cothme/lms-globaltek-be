import express from "express";
import * as AuthController from "../controllers/auth.controller";
import * as UserController from "../controllers/user.controller";
import passport from "passport";
import { requireAuth } from "../middleware/requireAuth";
const router = express.Router();

router.post("/google", AuthController.loginGoogle);
router.post("/login", AuthController.login);
router.get("/logout", AuthController.logout);
router.post("/register", UserController.signup);

export default router;
