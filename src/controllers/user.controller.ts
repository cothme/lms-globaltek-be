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
  email?: string;
  password?: string;
  c_password?: string;
  isFromGoogle?: Boolean;
}

const createToken = (user: SignUpBody) => {
  return jwt.sign(
    {
      // id: id,
      given_name: user.given_name,
      family_name: user.family_name,
      email: user.email,
    },
    String(process.env.SECRET),
    {
      expiresIn: "10h",
    }
  );
};

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
    const token = createToken(newUser as SignUpBody);
    res.status(201).json({
      family_name: newUser.family_name,
      given_name: newUser.given_name,
      email: newUser.email,
      jwt: token,
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

    if (existingEmail) {
      throw createHttpError(409, "Email already taken");
    }

    const passwordHashed = await bcrypt.hash(passwordRaw, 10);

    const newUser = await AdminModel.create({
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
    if (!given_name || !family_name || !email || !password) {
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
    return res.status(200).json({ data: userUpdated });
  } catch (error) {
    next(error);
  }
};
