import express from "express";
import * as UserController from "../controllers/user.controller";
import { requireAdminAuth } from "../middleware/requireAdminAuth";
import * as AdminController from "../controllers/admin.controller";
import * as CourseController from "../controllers/course.controller";

const router = express.Router();
// router.use(requireUserAuth);

router.get("/", requireAdminAuth, AdminController.getAllAdmin);
router.get(
  "/count/:numberOfUsers",
  requireAdminAuth,
  UserController.getNumberOfUsers
);
router.get("/:userId", requireAdminAuth, UserController.getUser);
router.patch("/:userId", requireAdminAuth, UserController.updateuser);
router.post(
  "/remove/:userId",
  requireAdminAuth,
  CourseController.removeUserFromCourse
);

export default router;
