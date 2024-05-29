import { RequestHandler } from "express";
import createHttpError from "http-errors";
import UserModel from "../models/user.model";
import CourseModel from "../models/course.model";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import multer from "multer";
import { upload } from "../helpers/fileUpload";
import { jwtDecode } from "jwt-decode";
import User from "../interfaces/User";
import * as UserService from "../services/user.service";

export const uploadFile: RequestHandler = (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return next(err);
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    return res.status(200).json({ file: req.file });
  });
};
export const signup: RequestHandler = async (req, res, next) => {
  const {
    given_name,
    family_name,
    user_name,
    email,
    password,
    c_password,
    picture,
  } = req.body;

  try {
    const newUser = await UserService.createUserService(
      {
        given_name,
        family_name,
        user_name,
        email,
        password,
        picture,
      },
      c_password
    );
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

export const getUser: RequestHandler = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const note = await UserModel.findOne({ _id: userId });
    if (!note) {
      throw createHttpError(404, "User not found");
    }
    return res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};

export const getNumberOfUsers: RequestHandler = async (req, res, next) => {
  try {
    const { numberOfUsers } = req.params;
    const limit = parseInt(numberOfUsers);
    const users = await UserModel.find().sort({ createdAt: -1 }).limit(limit);
    if (!users) {
      throw createHttpError(404, "User not found");
    }
    return res.status(200).json({
      user: users,
      userCount: users.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUser: RequestHandler = async (req, res, next) => {
  try {
    const users = await UserService.getAllUserService();
    return res.status(200).json({
      users: users,
      userCount: users.length,
    });
  } catch (error) {
    next(error);
  }
};

export const updateuser: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { given_name, family_name, email, user_name, password, picture } =
      req.body;

    const userUpdated = await UserService.updateUserService(
      { given_name, family_name, email, user_name, password, picture },
      userId
    );
    return res.status(200).json(userUpdated);
  } catch (error) {
    next(error);
  }
};

export const enrollUser: RequestHandler = async (req, res, next) => {
  const { courseId } = req.params;
  const token = String(req.headers.authorization);
  const user = jwtDecode(token) as User;
  const userId = user._id;

  const addCoursetoUser = await UserModel.updateOne(
    { _id: userId },
    { $addToSet: { courses_enrolled: courseId } }
  );
  const addUsertoCourse = await CourseModel.updateOne(
    { _id: courseId },
    { $addToSet: { subscribers: userId } }
  );

  return res
    .status(200)
    .json({ user: addCoursetoUser, course: addUsertoCourse });
};

export const deleteUser: RequestHandler = (req, res, next) => {
  const { userId } = req.params;
  try {
    const deletedUser = UserService.deleteUserService(userId);
    return res.status(200).json({ deleteUser });
  } catch (error) {
    next(error);
  }
};
