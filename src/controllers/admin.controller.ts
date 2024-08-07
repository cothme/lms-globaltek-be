import { RequestHandler } from "express";
import createHttpError from "http-errors";
import UserModel from "../models/user.model";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import AdminModel from "../models/admin.model";

interface SignUpBody {
  family_name?: string;
  given_name?: string;
  user_name?: string;
  email?: string;
  password?: string;
  c_password?: string;
  isFromGoogle?: Boolean;
}
export const getAllAdmin: RequestHandler = async (req, res, next) => {
  try {
    const admins = await AdminModel.find().sort({ createdAt: -1 });
    if (!admins) {
      throw createHttpError(404, "User not found");
    }
    return res.status(200).json({
      users: admins,
      adminCount: admins.length,
    });
  } catch (error) {
    next(error);
  }
};
export const createAdmin: RequestHandler<
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

  try {
    if (passwordRaw !== c_password) {
      throw createHttpError(422, "Password does not match!");
    }
    if (!given_name || !family_name || !email || !passwordRaw) {
      throw createHttpError(400, "Parameters missing");
    }

    const existingEmail = await AdminModel.findOne({ email: email }).exec();
    const existingUsername = await AdminModel.findOne({
      user_name: user_name,
    }).exec();

    if (existingEmail) {
      throw createHttpError(409, "Email already taken");
    }
    if (existingUsername) {
      throw createHttpError(409, "Username already taken");
    }

    const passwordHashed = await bcrypt.hash(passwordRaw, 10);

    const newUser = await AdminModel.create({
      given_name: given_name,
      family_name: family_name,
      user_name: user_name,
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
