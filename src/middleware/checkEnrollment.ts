import createHttpError from "http-errors";
import mongoose from "mongoose";
import { RequestHandler, response } from "express";
import UserModel from "../models/user.model";
import AdminModel from "../models/admin.model";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import express, { Express, NextFunction, Request, Response } from "express";
import User from "../interfaces/User";

const SECRET = String(process.env.SECRET);

const isUserValid = (token: string, res: express.Response) => {
  try {
    const decoded = jwt.verify(token, SECRET) as JwtPayload;
    if (decoded) {
      const manage = decoded;
      console.log("User: ", manage.email);
      return decoded;
    }
  } catch (e: any) {
    console.log(e.message);
    return res.status(401).send({
      error: "Invalid Token. Sign In again",
      errorCode: "INVALID_TOKEN",
    });
  }
};

const isCourseEnrolled = async (user: User, res: express.Response) => {
  const matchedUser = await UserModel.findOne({ email: user.email });
  if (!matchedUser) {
    return res.status(401).send({
      message: "Access Denied!",
    });
  }
};

const checkEnrollment: RequestHandler = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ error: "You are not authorized!" });
  }
};
