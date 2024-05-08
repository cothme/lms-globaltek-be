import createHttpError from "http-errors";
import mongoose from "mongoose";
import { RequestHandler, response } from "express";
import UserModel from "../models/user.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const requireAuth: RequestHandler = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "You are not authorized!" });
  }

  const token = authorization.split(" ")[1];
  try {
    const _id = jwt.verify(token, String(process.env.SECRET));
    req.user = UserModel.findOne({ _id: _id }).select("_id");
    next();
  } catch (error) {
    res.status(401).json({ error: error });
  }
};
