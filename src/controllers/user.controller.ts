import { RequestHandler } from "express";
import createHttpError from "http-errors";
import UserModel from "../models/user.model";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import multer from "multer";
import { upload } from "../helpers/fileUpload";

interface SignUpBody {
  family_name?: string;
  given_name?: string;
  user_name?: string;
  email?: string;
  password?: string;
  c_password?: string;
  isFromGoogle?: Boolean;
  picture?: String;
}
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
export const signup: RequestHandler<
  unknown,
  unknown,
  SignUpBody,
  unknown
> = async (req, res, next) => {
  const given_name = req.body.given_name;
  const family_name = req.body.family_name;
  const user_name = req.body.user_name;
  const email = req.body.email;
  const passwordRaw = req.body.password;
  const c_password = req.body.c_password;
  const picture = req.body.picture;

  try {
    if (passwordRaw !== c_password) {
      throw createHttpError(422, "Password does not match!");
    }
    if (!given_name || !family_name || !email || !user_name || !passwordRaw) {
      throw createHttpError(400, "Parameters missing");
    }

    const existingEmail = await UserModel.findOne({ email: email }).exec();

    if (existingEmail) {
      throw createHttpError(409, "Email already taken");
    }

    const existingUsername = await UserModel.findOne({
      user_name: user_name,
    }).exec();

    if (existingUsername) {
      throw createHttpError(409, "Username already taken");
    }

    const passwordHashed = await bcrypt.hash(passwordRaw, 10);

    const newUser = await UserModel.create({
      given_name: given_name,
      family_name: family_name,
      user_name: user_name,
      email: email,
      password: passwordHashed,
      isFromGoogle: false,
      picture: picture,
    });

    res.status(201).json({
      family_name: newUser.family_name,
      given_name: newUser.given_name,
      user_name: newUser.user_name,
      email: newUser.email,
    });
  } catch (error) {
    next(error);
  }
};

interface UpdateUserParams {
  userId: string;
}
interface UpdateUserBody {
  given_name?: string;
  family_name?: string;
  email?: string;
  password?: string;
}

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
    const users = await UserModel.find().sort({ createdAt: -1 });
    if (!users) {
      throw createHttpError(404, "User not found");
    }
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
    const { given_name, family_name, email, password, picture } = req.body;

    if (!mongoose.isValidObjectId(userId)) {
      throw createHttpError(500, "Invalid User ID");
    }
    if (!given_name || !family_name || !email) {
      throw createHttpError(400, "Parameters missing");
    }
    const user = await UserModel.findOne({ _id: userId }).exec();
    if (!user) {
      throw createHttpError(404, "User not found");
    }

    await UserModel.updateOne(
      { _id: userId },
      { given_name, family_name, email, password, picture }
    );

    const userUpdated = await UserModel.findById({ _id: userId });
    return res.status(200).json({ userUpdated });
  } catch (error) {
    next(error);
  }
};
export const deleteNote: RequestHandler = async (req, res, next) => {
  const { userId } = req.params;

  try {
    if (!mongoose.isValidObjectId(userId)) {
      throw createHttpError(500, "Invalid note ID");
    }
    const user = await UserModel.findById({ _id: userId }).exec();
    if (!user) {
      throw createHttpError(404, "User not found");
    }
    await UserModel.deleteOne({ _id: userId });

    return res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};
