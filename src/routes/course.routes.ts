import express from "express";
import { requireAdminAuth } from "../middleware/requireAdminAuth";
import * as CourseController from "../controllers/course.controller";

const router = express.Router();

router.get("/", requireAdminAuth, CourseController.getCourses);
router.post("/", requireAdminAuth, CourseController.createCourse);
router.get("/:courseId", requireAdminAuth, CourseController.getCourse);
router.patch("/:courseId", requireAdminAuth, CourseController.updateCourse);
router.delete("/:courseId", requireAdminAuth, CourseController.deleteCourse);

export default router;
