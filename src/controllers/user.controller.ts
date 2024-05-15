import { RequestHandler } from "express";
import createHttpError from "http-errors";
import UserModel from "../models/user.model";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import AdminModel from "../models/admin.model";
import { createToken } from "../helpers/createToken";

interface SignUpBody {
  family_name?: string;
  given_name?: string;
  email?: string;
  password?: string;
  c_password?: string;
  isFromGoogle?: Boolean;
}

export const signup: RequestHandler<
  unknown,
  unknown,
  SignUpBody,
  unknown
> = async (req, res, next) => {
  const given_name = req.body.given_name;
  const family_name = req.body.family_name;
  const email = req.body.email;
  const passwordRaw = req.body.password;
  const c_password = req.body.c_password;

  try {
    if (passwordRaw !== c_password) {
      throw createHttpError(422, "Password does not match!");
    }
    if (!given_name || !family_name || !email || !passwordRaw) {
      throw createHttpError(400, "Parameters missing");
    }

    const existingEmail = await UserModel.findOne({ email: email }).exec();

    if (existingEmail) {
      throw createHttpError(409, "Email already taken");
    }

    const passwordHashed = await bcrypt.hash(passwordRaw, 10);

    const newUser = await UserModel.create({
      given_name: given_name,
      family_name: family_name,
      email: email,
      password: passwordHashed,
      isFromGoogle: false,
    });

    res.status(201).json({
      family_name: newUser.family_name,
      given_name: newUser.given_name,
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

export const getAllUser: RequestHandler = async (req, res, next) => {
  try {
    const user = await UserModel.find().sort({ createdAt: -1 });
    if (!user) {
      throw createHttpError(404, "User not found");
    }
    return res.status(200).json({
      user: user,
      userCount: user.length,
    });
  } catch (error) {
    next(error);
  }
};

export const updateuser: RequestHandler<
  UpdateUserParams,
  unknown,
  UpdateUserBody,
  unknown
> = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { given_name, family_name, email, password } = req.body;

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
      { given_name, family_name, email, password }
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
