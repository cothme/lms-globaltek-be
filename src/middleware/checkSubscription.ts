import { RequestHandler } from "express";
import { jwtDecode } from "jwt-decode";
import User from "../interfaces/User";
import UserModel from "../models/user.model";
import * as CourseService from "../services/course.service";

export const checkSubscription: RequestHandler = async (req, res, next) => {
  const { courseId } = req.params;
  const authHeader = req.headers.authorization;
  const user_decode = jwtDecode<User>(String(authHeader));
  const user = (await UserModel.findById(user_decode._id)) as User;
  try {
    const course = await CourseService.fetchCourseByIdService(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    if (user.subscription_tier !== course.required_subscription) {
      return res.status(403).json({ error: "Upgrade your subscription" });
    }
    return res.status(200).json({
      course,
    });
  } catch (error) {
    next(error);
  }
};
