import { RequestHandler } from "express";
import createHttpError from "http-errors";
import UserModel from "../models/user.model";
import CourseModel from "../models/course.model";
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
  const { userName } = req.params;
  try {
    const note = await UserModel.findOne({ user_name: userName });
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
    const query = req.query;
    const users = await UserService.getAllUserService(query);
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
  try {
    const { courseId } = req.params;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const userDecode = jwtDecode(token) as User;
    const userId = userDecode._id;
    const course = await CourseModel.findById(courseId);
    const user = (await UserModel.findById(userId)) as User;

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    if (course.required_subscription != user.subscription_tier) {
      console.log(course.required_subscription, user.subscription_tier);

      return res
        .status(400)
        .json({ error: "Upgrade your subscription poor shit" });
    }

    const addCoursetoUser = await UserModel.updateOne(
      { _id: userId },
      { $addToSet: { courses_enrolled: courseId } }
    );

    const addUsertoCourse = await CourseModel.updateOne(
      { _id: courseId },
      { $addToSet: { subscribers: userId } }
    );

    if (
      addCoursetoUser.modifiedCount === 0 ||
      addUsertoCourse.modifiedCount === 0
    ) {
      return res.status(400).json({ error: "User already enrolled" });
    }

    return res.status(200).json({
      message: "Enrollment successful",
      user: addCoursetoUser,
      course: addUsertoCourse,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const unenrollUser: RequestHandler = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const token = String(req.headers.authorization?.split(" ")[1]);
    const { userId } = req.body;
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
      return res.status(400).json({
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
    return res.status(200).json({ message: "User unenrolled successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteUser: RequestHandler = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const deletedUser = await UserService.deleteUserService(userId);
    return res.status(200).json({ deletedUser });
  } catch (error) {
    console.error("Error in deleteUser handler:", error);
    next(error);
  }
};

export const viewEnrolledCourses: RequestHandler = async (req, res, next) => {
  const { userName } = req.params;
  try {
    console.log(userName);

    const courses_enrolled = await UserService.getEnrolledCoursesService(
      userName
    );

    return res.status(200).json({ courses_enrolled: courses_enrolled });
  } catch (error) {}
};
