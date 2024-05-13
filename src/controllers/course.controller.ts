import express, { RequestHandler } from "express";
import CourseModel from "../models/course.model";
import createHttpError from "http-errors";
import mongoose from "mongoose";

interface Course {
  course_name: string;
  course_type: string;
}

export const createCourse: RequestHandler = async (req, res, next) => {
  const { course_name, course_type } = req.body;
};
export const getCourses: RequestHandler = async (req, res, next) => {};
export const getCourse: RequestHandler = async (req, res, next) => {};
export const updateCourse: RequestHandler = async (req, res, next) => {};
export const deleteCourse: RequestHandler = async (req, res, next) => {};
