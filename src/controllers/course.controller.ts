import express, { RequestHandler } from "express";
import CourseModel from "../models/course.model";
import createHttpError from "http-errors";
import mongoose from "mongoose";

interface Course {
  course_name: string;
  course_description: string;
  instructor: String;
  difficulty: string;
}

export const createCourse: RequestHandler = async (req, res, next) => {
  const { course_name, course_description, instructor, difficulty } = req.body;
  try {
    if (!course_name) {
      throw createHttpError(400, "Course must have a title");
    }

    const newCourse = await CourseModel.create({
      course_name: course_name,
      course_description: course_description,
      instructor: instructor,
      difficulty: difficulty,
    });

    res.status(201).json(newCourse);
  } catch (error) {
    next(error);
  }
};
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
  const { courseId } = req.params;
  try {
    const course = await CourseModel.findOne({ _id: courseId });
    if (!course) {
      throw createHttpError(404, "Course not found");
    }
    return res.status(200).json(course);
  } catch (error) {
    next(error);
  }
};
export const updateCourse: RequestHandler = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { course_name, course_description, instructor, difficulty } =
      req.body;

    if (!mongoose.isValidObjectId(courseId)) {
      throw createHttpError(500, "Invalid Course ID");
    }
    if (![course_name, course_description, difficulty].every(Boolean)) {
      throw createHttpError(400, "Parameters missing");
    }
    const course = await CourseModel.findOne({ _id: courseId }).exec();
    if (!course) {
      throw createHttpError(404, "Course not found");
    }

    await CourseModel.updateOne(
      { _id: courseId },
      { course_name, course_description, instructor, difficulty }
    );

    const userUpdated = await CourseModel.findById({ _id: courseId });
    return res.status(200).json({ userUpdated });
  } catch (error) {
    next(error);
  }
};
export const deleteCourse: RequestHandler = async (req, res, next) => {
  const { courseId } = req.params;

  try {
    if (!mongoose.isValidObjectId(courseId)) {
      throw createHttpError(500, "Invalid course ID");
    }
    const course = await CourseModel.findById({ _id: courseId }).exec();
    if (!course) {
      throw createHttpError(404, "Course not found");
    }
    await CourseModel.deleteOne({ _id: courseId });

    return res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};
