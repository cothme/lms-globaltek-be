import express, { RequestHandler } from "express";
import CourseModel from "../models/course.model";
import createHttpError from "http-errors";
import mongoose, { isValidObjectId } from "mongoose";
import { jwtDecode } from "jwt-decode";
import Course from "../interfaces/Course";
import User from "../interfaces/User";
import * as CourseService from "../services/course.service";
import { publishCourse } from "../repositories/course.repository";
import UserModel from "../models/user.model";

//CREATE
export const createCourse: RequestHandler = async (req, res, next) => {
  const courseData: Course = req.body;
  try {
    const newCourse = await CourseService.createNewCourseService(courseData);
    res.status(201).json(newCourse);
  } catch (error) {
    next(error);
  }
};

//GET ALL
export const getAllCourses: RequestHandler = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, ...query } = req.query;
    const parsedPage = parseInt(page as string, 10);
    const parsedLimit = parseInt(limit as string, 10);

    const courses = await CourseService.getAllCourseService(
      query,
      parsedPage,
      parsedLimit
    );

    return res.status(200).json(courses);
  } catch (error) {
    next(error);
  }
};

//GET ONE
export const getCourse: RequestHandler = async (req, res, next) => {
  try {
    const { courseName } = req.params;
    const course = await CourseService.fetchCourseByCourseNameService(
      courseName
    );
    return res
      .status(200)
      .json({ course, subscriber: course.subscribers.length });
  } catch (error) {
    next(error);
  }
};

export const checkEnrollment: RequestHandler = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const decoded = jwtDecode<{ _id: string }>(token);
    const userId = decoded._id;
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

    return res.status(200).json({ enrolled: isEnrolled });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

//PUBLISH
export const togglePublish: RequestHandler = async (req, res, next) => {
  const token = String(req.headers.authorization);
  const { courseId } = req.params;
  try {
    const publishedCourse = await CourseService.publishCourseService(
      courseId,
      token
    );
    return res.status(200).json({ publishedCourse });
  } catch (error) {
    next(error);
  }
};

//UPDATE
export const updateCourse: RequestHandler = async (req, res, next) => {
  const token = String(req.headers.authorization);
  const courseData: Course = req.body;
  const { courseName } = req.params;
  try {
    const updatedCourse = await CourseService.updateCourseService(
      courseData,
      token,
      courseName
    );
    return res.status(200).json({ updatedCourse });
  } catch (error) {
    next(error);
  }
};

//DELETE
export const deleteCourse: RequestHandler = async (req, res, next) => {
  const { courseId } = req.params;
  const authHeader = String(req.headers.authorization);
  try {
    const deletedCourse = await CourseService.deleteCourseService(
      courseId,
      authHeader
    );
    return res.status(200).json({ deletedCourse });
  } catch (error) {
    next(error);
  }
};

export const getAllOwnedCourses: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const admin = jwtDecode<User>(String(authHeader));
    const courses = await CourseModel.find({ publisher: admin.user_name }).sort(
      {
        createdAt: -1,
      }
    );
    if (!courses) {
      throw createHttpError(404, "Course not found");
    }

    return res.status(200).json({
      courses: courses,
      courseCount: courses.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubscribers: RequestHandler = async (req, res, next) => {
  try {
    const token = String(req.headers.authorization?.split(" ")[1]);
    const { courseName } = req.params;

    const subscribers = await CourseService.getSubscribersService(
      token,
      courseName
    );
    return res.status(200).json({ subscribers });
  } catch (error) {
    next(error);
  }
};

export const removeUserFromCourse: RequestHandler = async (req, res, next) => {
  const { userId } = req.params;
  const { courseId } = req.body;

  if (!courseId) {
    return res
      .status(400)
      .json({ success: false, message: "Course ID is required" });
  }

  try {
    const courseToRemove = await CourseModel.findById(courseId);
    if (!courseToRemove) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const userUpdateResult = await UserModel.updateOne(
      { _id: userId },
      { $pull: { courses_enrolled: courseId } }
    );

    if (userUpdateResult.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found or not enrolled in course",
      });
    }

    const courseUpdateResult = await CourseModel.updateOne(
      { _id: courseId },
      { $pull: { subscribers: userId } }
    );

    if (courseUpdateResult.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Course not found or user not subscribed",
      });
    }

    res.status(200).json({
      success: true,
      message: "User removed from course successfully",
    });
  } catch (error) {
    console.error("Error removing user from course:", error);
    next(error);
  }
};

export const getPublishedCourse: RequestHandler = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const course = await CourseService.fetchCourseByIdService(courseId);

    if (!course.published) {
      return res.status(403).json({ error: "Course not published" });
    }

    return res.status(200).json({ course });
  } catch (error) {
    next(error);
  }
};
