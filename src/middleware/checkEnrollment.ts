import { RequestHandler } from "express";
import { jwtDecode } from "jwt-decode";
import mongoose from "mongoose";
import CourseModel from "../models/course.model";
import Course from "../interfaces/Course";

export const checkEnrollment: RequestHandler = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const decoded = jwtDecode<Course>(token);
    const userId = decoded.courseId;
    const { courseId } = req.params;

    const course = await CourseModel.findById(courseId)
      .select("subscribers")
      .lean();

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const isEnrolled = course.subscribers.some(
      (subscriberId: mongoose.Types.ObjectId) =>
        subscriberId.equals(userObjectId)
    );
    (req as any).isEnrolled = isEnrolled;

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
