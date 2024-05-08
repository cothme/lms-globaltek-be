import createHttpError from "http-errors";
import mongoose from "mongoose";
import { RequestHandler } from "express";
import UserModel from "../models/user.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

interface userDetails {
  given_name?: string;
  family_name?: string;
  email?: string;
  password?: string;
  isFromGoogle?: Boolean;
}
interface SignUpGoogle {
  family_name?: string;
  given_name?: string;
  email?: string;
  isFromGoogle?: Boolean;
}

const maxAge = 3 * 24 * 60 * 60;
const createToken = (user: userDetails) => {
  return jwt.sign(
    {
      // id: id,
      given_name: user.given_name,
      family_name: user.family_name,
      email: user.email,
    },
    String(process.env.SECRET),
    {
      expiresIn: "2d",
    }
  );
};

export const login: RequestHandler = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      throw createHttpError(422, "Missing fields!");
    }
    const user = await UserModel.findOne({ email: email });
    if (user) {
      const auth = await bcrypt.compare(password, String(user.password));
      if (auth) {
        const token = createToken(user as userDetails);
        return res.status(200).json({
          family_name: user.family_name,
          given_name: user.given_name,
          email: user.email,
          jwt: token,
        });
      }
      throw createHttpError(500, "Invalid credentials");
    }
    throw createHttpError(500, "No account");
  } catch (error) {
    next(error);
  }
};

export const loginGoogle: RequestHandler<
  unknown,
  unknown,
  SignUpGoogle,
  unknown
> = async (req, res, next) => {
  const given_name = req.body.given_name;
  const family_name = req.body.family_name;
  const email = req.body.email;

  try {
    const user = await UserModel.findOne({ email: email });
    if (!user) {
      const userCreated = await UserModel.create({
        given_name: given_name,
        family_name: family_name,
        email: email,
        isFromGoogle: true,
      });
    }
    try {
      const user = await UserModel.findOne({ email: email });
      if (user) {
        const token = createToken(user as userDetails);
        return res.status(200).json({
          family_name: user.family_name,
          given_name: user.given_name,
          email: user.email,
          jwt: token,
        });
      }
      throw createHttpError(500, "Invalid account!");
    } catch (error) {
      next(error);
    }
  } catch (error) {
    next(error);
  }
};

export const logout: RequestHandler = (req, res, next) => {
  return "logout";
};
export const loginWithGoogle: RequestHandler = (req, res, next) => {
  return "google";
};
