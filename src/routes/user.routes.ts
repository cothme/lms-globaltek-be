import express from "express";
import * as UserController from "../controllers/user.controller";
import { requireUserAuth } from "../middleware/requireUserAuth";
import { requireAdminAuth } from "../middleware/requireAdminAuth";
import multer from "multer";

const upload = multer({ dest: "uploads/" });
const router = express.Router();
// router.use(requireUserAuth);
router.post("/upload", UserController.uploadFile);
router.get("/", requireAdminAuth, UserController.getAllUser);
router.get(
  "/count/:numberOfUsers",
  requireAdminAuth,
  UserController.getNumberOfUsers
);
router.post("/enroll/:courseId", UserController.enrollUser);
router.get("/:userId", UserController.getUser);
router.patch("/:userId", UserController.updateuser);
router.delete("/:userId", UserController.deleteUser);

export default router;
