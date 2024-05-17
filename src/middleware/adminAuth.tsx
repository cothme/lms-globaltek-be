import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import express from "express";
import { JwtPayload, jwtDecode } from "jwt-decode";
import { Admin } from "../../client/src/models/admin";
import { Admin as AdminModel } from "../models/adminModels";
dotenv.config();

const JWT_SECRET = String(process.env.JWT_SECRET);

const isTokenValid = (token: string, res: express.Response) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    if (decoded) {
      const manage = decoded as Admin;
      console.log("Admin: ", manage.email);
      return decoded as Admin;
    }
  } catch (error: any) {
    console.log(error.message);
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

export const auth = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).send({
      error: "Unauthorized access",
    });
  }

  //validate
  const token = authorization.replace("Bearer ", "");

  //from token, get user id, check if it exists from db
  const activeAdmin = isTokenValid(token, res);
  console.log("has header activeAdmin: ", res.headersSent);
  if (res.headersSent) {
  } else {
    const query = isValid(activeAdmin, res);
    if (!res.headersSent) {
      next();
    }
  }
};
