import createHttpError from "http-errors";
import mongoose from "mongoose";
import { RequestHandler, response } from "express";
import UserModel from "../models/user.model";
import AdminModel from "../models/admin.model";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import express, { Express, NextFunction, Request, Response } from "express";

dotenv.config();

const SECRET = String(process.env.SECRET);

const isAdminValid = (token: string, res: express.Response) => {
  try {
    const decoded = jwt.verify(token, SECRET) as JwtPayload;
    if (decoded) {
      const manage = decoded;
      console.log("Admin: ", manage.email);
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

const isValid = async (admin: any, res: express.Response) => {
  const matchedAdmin = await AdminModel.findOne({ email: admin.email });
  if (!matchedAdmin) {
    return res.status(401).send({
      message: "Access Denied!",
    });
  }
};

export const requireAuth: RequestHandler = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ error: "You are not authorized!" });
  }

  const token = authorization.replace("Bearer ", "");
  console.log("has header activeAdmin: ", res.headersSent);
};
