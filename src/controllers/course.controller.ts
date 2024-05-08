import express, { RequestHandler } from "express";
import CourseModel from "../models/course.model";
import createHttpError from "http-errors";
import mongoose from "mongoose";

export const createCourse: RequestHandler = async (req, res, next) => {};
export const getCourses: RequestHandler = async (req, res, next) => {};
export const getCourse: RequestHandler = async (req, res, next) => {};
export const updateCourse: RequestHandler = async (req, res, next) => {};
export const deleteCourse: RequestHandler = async (req, res, next) => {};
