import * as UserRepository from "../repositories/user.repository";
import createHttpError from "http-errors";
import { jwtDecode } from "jwt-decode";
import mongoose from "mongoose";
import User from "../interfaces/User";
import { use } from "passport";

export const createUserService = async (userData: User) => {
  const {
    given_name,
    family_name,
    user_name,
    email,
    subscription_tier,
    password,
    isFromGoogle,
  } = userData;
};
