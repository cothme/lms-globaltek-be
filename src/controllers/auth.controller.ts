import createHttpError from "http-errors";
import { RequestHandler } from "express";
import UserModel from "../models/user.model";
import AdminModel from "../models/admin.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { createToken } from "../helpers/createToken";
import Stripe from "stripe";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET as string, {});
interface userDetails {
  given_name?: string;
  family_name?: string;
  user_name?: string;
  email?: string;
  password?: string;
  isFromGoogle?: Boolean;
}
interface adminDetails {
  given_name?: string;
  family_name?: string;
  user_name?: string;
  email?: string;
  password?: string;
}

interface SignUpGoogle {
  family_name?: string;
  given_name?: string;
  name?: string;
  email?: string;
  isFromGoogle?: Boolean;
}

export const login: RequestHandler = async (req, res, next) => {
  const { email, password } = req.body;
  const missingFields = [];
  if (!email) missingFields.push("email");
  if (!password) missingFields.push("password");

  try {
    if (missingFields.length > 0) {
      throw createHttpError(
        400,
        `Parameters missing: ${missingFields.join(", ")}`
      );
    }
    const user = await UserModel.findOne({ email: email });
    if (user) {
      const auth = await bcrypt.compare(password, String(user.password));
      if (auth) {
        const token = createToken(user as userDetails);
        return res.status(200).json({
          id: user.id,
          family_name: user.family_name,
          user_name: user.user_name,
          given_name: user.given_name,
          email: user.email,
          subscription_tier: user.subscription_tier,
          jwt: token,
        });
      }
      throw createHttpError(500, "Invalid credentials");
    }
    throw createHttpError(500, "Invalid credentials");
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
  const user_name = req.body.name;
  const email = req.body.email;
  const subscription_tier = "free";

  try {
    const user = await UserModel.findOne({ email: email });
    if (!user) {
      const customer = await stripe.customers.create({
        email: email,
        name: `${given_name} ${family_name}`,
      });
      const userCreated = await UserModel.create({
        given_name: given_name,
        family_name: family_name,
        user_name: user_name,
        stripe_customer_id: customer.id,
        subscription_tier: subscription_tier,
        email: email,
        isFromGoogle: true,
      });
    }
    try {
      const user = await UserModel.findOne({ email: email });
      if (user) {
        const token = createToken(user as userDetails);
        return res.status(200).json({
          id: user.id,
          family_name: user.family_name,
          user_name: user.user_name,
          given_name: user.given_name,
          email: user.email,
          subscription_tier: user.subscription_tier,
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

export const loginAdmin: RequestHandler = async (req, res, next) => {
  const { user_name, password } = req.body;

  try {
    if (!user_name || !password || !user_name.trim() || !password.trim()) {
      throw createHttpError(422, "Missing fields!");
    }
    const user = await AdminModel.findOne({ user_name: user_name });
    if (user) {
      const auth = await bcrypt.compare(password, String(user.password));
      if (auth) {
        const token = createToken(user as adminDetails);
        return res.status(200).json({
          id: user.id,
          family_name: user.family_name,
          given_name: user.given_name,
          user_name: user.user_name,
          email: user.email,
          jwt: token,
        });
      }
      throw createHttpError(500, "Invaliddd credentials");
    }
    throw createHttpError(500, "Invalidd credentials");
  } catch (error) {
    next(error);
  }
};

export const loginAdminGoogle: RequestHandler<
  unknown,
  unknown,
  SignUpGoogle,
  unknown
> = async (req, res, next) => {
  const email = req.body.email;

  try {
    const user = await AdminModel.findOne({ email: email });
    if (user) {
      const token = createToken(user as userDetails);
      return res.status(200).json({
        id: user.id,
        family_name: user.family_name,
        user_name: user.user_name,
        given_name: user.given_name,
        email: user.email,
        jwt: token,
      });
    }
    throw createHttpError(500, "No account found!");
  } catch (error) {
    next(error);
  }
};
export const loginWithGoogle: RequestHandler = (req, res, next) => {
  return "google";
};
