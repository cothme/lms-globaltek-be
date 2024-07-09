import express from "express";
import * as AuthController from "../controllers/auth.controller";
import * as UserController from "../controllers/user.controller";
import * as AdminController from "../controllers/admin.controller";
import { loginValidationRules } from "../helpers/loginValidation";
const router = express.Router();

router.post("/google", AuthController.loginGoogle);
router.post("/login", loginValidationRules(), AuthController.login);
router.post("/register", UserController.signup);

router.post("/admin/login", loginValidationRules(), AuthController.loginAdmin);
router.post("/admin/google", AuthController.loginAdminGoogle);
router.post("/admin/create", AdminController.createAdmin);

export default router;
