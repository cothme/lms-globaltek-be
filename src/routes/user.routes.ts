import express from "express";
import * as UserController from "../controllers/user.controller";
import { getPublishedCourse } from "../controllers/course.controller";
import multer from "multer";
import { requireAuth } from "../middleware/requireAuth";
import { checkSubscription } from "../middleware/checkSubscription";
import { checkEnrollment } from "../middleware/checkEnrollment";
import * as CourseController from "../controllers/course.controller";

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
router.get(
  "/content/:courseId",
  [checkSubscription, requireAuth, checkEnrollment],
  CourseController.getCourseContent
);

export default router;
