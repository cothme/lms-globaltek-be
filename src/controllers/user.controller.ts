import { RequestHandler } from "express";
import createHttpError from "http-errors";
import UserModel from "../models/user.model";
import CourseModel from "../models/course.model";
import { upload, uploadToCloudinary } from "../helpers/fileUpload";
import { uploadUserImageToCloudinary } from "../helpers/userPictureUpload";
import { jwtDecode } from "jwt-decode";
import User from "../interfaces/User";
import * as UserService from "../services/user.service";
import { v2 as cloudinary } from "cloudinary";
import getImagePublicUrl from "../helpers/getImagePublicUrl";

export const uploadFile: RequestHandler = (req, res, next) => {
  upload.single("file")(req, res, async (err) => {
    if (err) {
      return next(createHttpError(400, err));
    }

    uploadToCloudinary(req, res, async (err) => {
      if (err) {
        console.log(req.file);

        return next(createHttpError(400, err));
      }

      try {
        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        // Optionally, you can access Cloudinary URLs if needed
        const cloudinaryUrl: string = req.body.cloudinaryUrl;

        return res.status(200).json({ file: req.file, cloudinaryUrl });
      } catch (error) {
        next(error);
      }
    });
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

export const updateuser: RequestHandler = (req, res, next) => {
  upload.single("picture")(req, res, async (err) => {
    if (err) {
      return next(createHttpError(400, err));
    }

    uploadUserImageToCloudinary(req, res, async (err) => {
      if (err) {
        return next(createHttpError(400, err));
      }
      const cloudinaryUrl: string = req.body.cloudinaryUrl;
      try {
        const { userId } = req.params;
        const { given_name, family_name, email, user_name, password } =
          req.body;
        const picture = cloudinaryUrl;

        const existingUser = await UserModel.findById(userId);
        if (!existingUser) {
          throw createHttpError(404, "User not found");
        }
        const public_id = getImagePublicUrl(String(existingUser.picture));
        console.log(public_id);

        await cloudinary.uploader.destroy("uploads/" + String(public_id));

        const userUpdated = await UserService.updateUserService(
          {
            given_name,
            family_name,
            email,
            user_name,
            password,
            picture,
          },
          userId
        );

        return res.status(200).json(userUpdated);
      } catch (error) {
        next(error);
      }
    });
  });
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
    if (
      course.required_subscription != user.subscription_tier &&
      course.required_subscription != "Free"
    ) {
      console.log(course.required_subscription, user.subscription_tier);

      return res.status(400).json({ error: "Upgrade your subscription" });
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
