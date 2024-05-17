import express from "express";
import * as UserController from "../controllers/user.controller";
import { requireAdminAuth } from "../middleware/requireAdminAuth";

const router = express.Router();
// router.use(requireUserAuth);

router.get("/", requireAdminAuth, UserController.getAllUser);
router.get(
  "/count/:numberOfUsers",
  requireAdminAuth,
  UserController.getNumberOfUsers
);
router.get("/:userId", requireAdminAuth, UserController.getUser);
router.patch("/:userId", requireAdminAuth, UserController.updateuser);
router.delete("/:userId", requireAdminAuth, UserController.deleteNote);

export default router;
