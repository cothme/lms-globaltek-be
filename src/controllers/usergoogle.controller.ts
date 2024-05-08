import { RequestHandler } from "express";
import createHttpError from "http-errors";
import UserGoogleModel from "../models/usergoogle.model";
import UserModel from "../models/user.model";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

interface SignUpBody {
  family_name: String;
  given_name: String;
  email: String;
  name: String;
  isFromGoogle: Boolean;
}

export const addUserGoogle: RequestHandler<
  unknown,
  unknown,
  SignUpBody,
  unknown
> = async (req, res, next) => {
  const family_name = req.body.family_name;
  const given_name = req.body.given_name;
  const email = req.body.email;
  const name = req.body.name;
  const isFromGoogle = req.body.isFromGoogle;

  try {
    if (!email || !name || !isFromGoogle || !family_name || !given_name) {
      throw createHttpError(400, "Parameters dasfaf");
    }
    const existingUser = await UserModel.findOne({ email: email }).exec();
    if (existingUser) {
      return res.status(200).json({ message: "User already registered" });
    }

    const userGoogle = await UserModel.create({
      family_name: family_name,
      given_name: given_name,
      email: email,
      name: name,
      isFromGoogle: true,
    }).then(() => {
      console.log("New User Added");
    });
    return res.status(200).json({ message: "User successfully registered" });
  } catch (error) {
    next(error);
  }
};
