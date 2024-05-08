import express from "express";
import { requireAuth } from "../middleware/requireAuth";
import * as CourseController from "../controllers/course.controller";

const router = express.Router();
router.use(requireAuth);

router.get("/", CourseController.getCourses);
router.post("/", CourseController.createCourse);
router.get("/:courseId", CourseController.getCourse);
router.patch("/:courseId", CourseController.updateCourse);
router.delete("/:courseId", CourseController.deleteCourse);

export default router;
