import express from "express";
import * as UserController from "../controllers/user.controller";
import { requireAuth } from "../middleware/requireAuth";

const router = express.Router();
router.use(requireAuth);

router.get("/:userId", UserController.getUser);
router.patch("/:userId", UserController.updateuser);

export default router;
