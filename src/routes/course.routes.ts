import express from "express";
import { requireAdminAuth } from "../middleware/requireAdminAuth";
import * as CourseController from "../controllers/course.controller";

const router = express.Router();

router.get("/", requireAdminAuth, CourseController.getAllCourses); //done
router.post("/", requireAdminAuth, CourseController.createCourse); //done
router.get("/:courseId", CourseController.getCourse); //done
router.patch("/:courseId", requireAdminAuth, CourseController.updateCourse); //done
router.delete("/:courseId", requireAdminAuth, CourseController.deleteCourse);

export default router;
