import express from "express";
import * as UserController from "../controllers/user.controller";
import { requireUserAuth } from "../middleware/requireUserAuth";
import { requireAdminAuth } from "../middleware/requireAdminAuth";

const router = express.Router();
// router.use(requireUserAuth);

router.get("/", requireAdminAuth, UserController.getAllUser);
router.get(
  "/count/:numberOfUsers",
  requireAdminAuth,
  UserController.getNumberOfUsers
);
router.get("/:userId", UserController.getUser);
router.patch("/:userId", UserController.updateuser);
router.delete("/:userId", UserController.deleteNote);

export default router;
