import express from "express";
import { requireAdminAuth } from "../middleware/requireAdminAuth";
import * as CourseController from "../controllers/course.controller";

const router = express.Router();

router.get("/", requireAdminAuth, CourseController.getAllCourses); //done
router.post("/", requireAdminAuth, CourseController.createCourse); //done
router.get("/published/", CourseController.getPublishedCourses); //no middleware
router.get("/checkEnroll/:courseId", CourseController.checkEnrollment);
router.get("/subscribers/:courseId", CourseController.getSubscribers);
router.get("/:courseId", CourseController.getCourse); //no middleware
router.patch("/:courseId", requireAdminAuth, CourseController.updateCourse); //done
router.delete("/:courseId", requireAdminAuth, CourseController.deleteCourse);
router.patch(
  "/publish/:courseId",
  requireAdminAuth,
  CourseController.togglePublish
);
router.get(
  "/mycourses/:courseId",
  requireAdminAuth,
  CourseController.getAllOwnedCourses
);

export default router;
