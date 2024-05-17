import express, { RequestHandler } from "express";
import CourseModel from "../models/course.model";
import createHttpError from "http-errors";
import mongoose from "mongoose";

interface Course {
  course_name: string;
  course_type: string;
  course_description: string;
  difficulty: string;
}

export const createCourse: RequestHandler = async (req, res, next) => {
  const { course_name, course_type, course_description, difficulty } = req.body;
  try {
    if (!course_name) {
      throw createHttpError(400, "Course must have a title");
    }

    const newCourse = await CourseModel.create({
      course_name: course_name,
      course_type: course_type,
      course_description: course_description,
      difficulty: difficulty,
    });

    res.status(201).json(newCourse);
  } catch (error) {
    next(error);
  }
};
export const getCourses: RequestHandler = async (req, res, next) => {};
export const getCourse: RequestHandler = async (req, res, next) => {};
export const updateCourse: RequestHandler = async (req, res, next) => {};
export const deleteCourse: RequestHandler = async (req, res, next) => {};
