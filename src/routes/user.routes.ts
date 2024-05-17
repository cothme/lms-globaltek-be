import express from "express";
import * as UserController from "../controllers/user.controller";
import { requireUserAuth } from "../middleware/requireUserAuth";

const router = express.Router();
router.use(requireUserAuth);

router.get("/", UserController.getAllUser);
router.get("/:numberOfUsers", UserController.getNumberOfUsers);
router.get("/:userId", UserController.getUser);
router.patch("/:userId", UserController.updateuser);
router.delete("/:userId", UserController.deleteNote);

export default router;
