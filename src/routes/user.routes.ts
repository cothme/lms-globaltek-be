import express from "express";
import * as UserController from "../controllers/user.controller";
import { getPublishedCourse } from "../controllers/course.controller";
import { requireUserAuth } from "../middleware/requireUserAuth";
import { requireAdminAuth } from "../middleware/requireAdminAuth";
import multer from "multer";
import { requireAuth } from "../middleware/requireAuth";
import { checkEnrollment } from "../controllers/course.controller";

const upload = multer({ dest: "uploads/" });
const router = express.Router();
// router.use(requireUserAuth);
router.post("/upload", UserController.uploadFile);
router.get("/", UserController.getAllUser);
router.get("/count/:numberOfUsers", UserController.getNumberOfUsers);
router.get("/courses/:userName", UserController.viewEnrolledCourses);
router.post("/enroll/:courseId", UserController.enrollUser);
router.get("/:userName", UserController.getUser);
router.patch("/:userId", requireAuth, UserController.updateuser);
router.delete("/:userId", requireAuth, UserController.deleteUser);
router.post("/unenroll/:courseId", UserController.unenrollUser);
router.get("/published/:courseId", getPublishedCourse);

export default router;
