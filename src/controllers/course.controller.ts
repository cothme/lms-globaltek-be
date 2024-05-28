import express, { RequestHandler } from "express";
import CourseModel from "../models/course.model";
import createHttpError from "http-errors";
import mongoose, { isValidObjectId } from "mongoose";
import { jwtDecode } from "jwt-decode";

interface Course {
  course_title: string;
  course_description: string;
  course_code: string;
  publisher: string;
  difficulty: string;
  required_subscription: string;
  published: boolean;
}
interface User {
  given_name?: string;
  family_name?: string;
  user_name?: string;
  email?: string;
  password?: string;
  isFromGoogle?: Boolean;
}
//CREATE
export const createCourse: RequestHandler = async (req, res, next) => {
  const {
    course_title,
    course_description,
    course_code,
    publisher,
    difficulty,
    required_subscription,
    published,
  }: Course = req.body;
  try {
    if (
      ![
        course_title,
        course_code,
        course_description,
        required_subscription,
        publisher,
      ].every(Boolean)
    ) {
      throw createHttpError(400, "Missing fields!");
    }
    if (!course_title) {
      throw createHttpError(400, "Course must have a title");
    }

    const existingCourse = await CourseModel.findOne({
      $or: [{ course_code: course_code }, { course_title: course_title }],
    });
    if (existingCourse) {
      throw createHttpError(409, "Course already exists");
    }

    const newCourse = await CourseModel.create({
      course_title: course_title,
      course_description: course_description,
      course_code: course_code,
      publisher: publisher,
      difficulty: difficulty,
      required_subscription: required_subscription,
      published: published,
    });
    res.status(201).json(newCourse);
  } catch (error) {
    next(error);
  }
};

//GET ALL
export const getAllCourses: RequestHandler = async (req, res, next) => {
  try {
    const courses = await CourseModel.find().sort({ createdAt: -1 });
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
export const getCourse: RequestHandler = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const course = await CourseModel.findOne({ _id: courseId });
    if (!course) {
      throw createHttpError(404, "Course not found");
    }
    return res.status(200).json(course);
  } catch (error) {
    next(error);
  }
};

export const togglePublish: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = String(req.headers.authorization);
    const admin = jwtDecode<User>(authHeader);
    const { courseId } = req.params;
    const course: any = await CourseModel.findOne({ _id: courseId });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    if (course.publisher != admin?.user_name) {
      throw createHttpError(403, "Unauthorized");
    }
    if (course.published) {
      await CourseModel.updateOne(
        { _id: courseId },
        { $set: { published: false } }
      );
    } else {
      await CourseModel.updateOne(
        { _id: courseId },
        { $set: { published: true } }
      );
    }

    res
      .status(200)
      .json({ message: "Succesfully Published!", published: true });
  } catch (error) {
    next(error);
  }
};

export const updateCourse: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = String(req.headers.authorization);
    const { courseId } = req.params;
    const {
      course_title,
      course_description,
      course_code,
      difficulty,
      required_subscription,
      published,
    } = req.body;
    const admin = jwtDecode<User>(authHeader);
    if (!mongoose.isValidObjectId(courseId)) {
      throw createHttpError(500, "Invalid Course ID");
    }
    if (
      ![
        course_title,
        course_description,
        course_code,
        required_subscription,
      ].every(Boolean)
    ) {
      throw createHttpError(400, "Parameters missing");
    }
    const course = await CourseModel.findById(courseId).exec();
    if (!course) {
      throw createHttpError(404, "Course not found");
    }

    if (course.publisher != admin?.user_name) {
      throw createHttpError(403, "Unauthorized");
    }
    console.log(course.publisher + admin?.user_name);

    await CourseModel.updateOne(
      { _id: courseId },
      {
        course_title,
        course_description,
        course_code,
        difficulty,
        required_subscription,
        published,
      }
    );

    const userUpdated = await CourseModel.findById({ _id: courseId });
    return res.status(200).json({ userUpdated });
  } catch (error) {
    next(error);
  }
};

//DELETE
export const deleteCourse: RequestHandler = async (req, res, next) => {
  const { courseId } = req.params;
  const authHeader = req.headers.authorization;

  try {
    console.log(authHeader);

    if (!authHeader) {
      throw createHttpError(401, "Authorization header is missing");
    }

    const admin = jwtDecode<User>(authHeader);

    if (!mongoose.isValidObjectId(courseId)) {
      throw createHttpError(400, "Invalid course ID");
    }

    const course = await CourseModel.findById(courseId).exec();
    if (!course) {
      throw createHttpError(404, "Course not found");
    }

    if (course.publisher != admin?.user_name) {
      throw createHttpError(403, "Unauthorized");
    }

    await CourseModel.deleteOne({ _id: courseId });

    return res.sendStatus(200);
  } catch (error) {
    if (!createHttpError.isHttpError(error)) {
      next(createHttpError(500, "Internal Server Error"));
    } else {
      next(error);
    }
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
