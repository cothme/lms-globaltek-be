import * as UserRepository from "../repositories/user.repository";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import User from "../interfaces/User";
import bcrypt from "bcrypt";

export const createUserService = async (userData: User, c_password: string) => {
  const { given_name, family_name, user_name, email, picture, password } =
    userData;

  if (password !== c_password) {
    throw createHttpError(422, "Password does not match!");
  }
  const existingEmail = await UserRepository.findByEmail(String(email));
  if (existingEmail) {
    throw createHttpError(409, "Email already taken");
  }
  if (!given_name || !family_name || !email || !user_name || !password) {
    throw createHttpError(400, "Parameters missing");
  }
  const existingUsername = await UserRepository.findByUsername(
    String(user_name)
  );
  if (existingUsername) {
    throw createHttpError(409, "Username already taken");
  }
  const passwordHashed = await bcrypt.hash(password, 10);

  const newUser = await UserRepository.createUser({
    given_name,
    family_name,
    user_name,
    email,
    password: passwordHashed,
    isFromGoogle: false,
    picture,
  });

  return { newUser };
};

export const getAllUserService = async (query: User) => {
  const users = UserRepository.getAllUser(query);
  if (!users) {
    throw createHttpError(409, "No Users!");
  }
  return users;
};

export const updateUserService = async (userData: User, userId: string) => {
  const { given_name, family_name, user_name, email, picture } = userData;

  if (!mongoose.isValidObjectId(userId)) {
    throw createHttpError(500, "Invalid User ID");
  }

  const existingUser = await UserRepository.findById(userId);
  if (!existingUser) {
    throw createHttpError(404, "User not found");
  }

  if (!given_name || !family_name || !email) {
    throw createHttpError(400, "Parameters missing");
  }

  if (email !== existingUser.email) {
    const existingEmail = await UserRepository.findByEmail(email);
    if (existingEmail) {
      throw createHttpError(409, "Email already taken");
    }
  }

  if (user_name && user_name !== existingUser.user_name) {
    const existingUsername = await UserRepository.findByUsername(user_name);
    if (existingUsername) {
      throw createHttpError(409, "Username already taken");
    }
  }

  const userUpdated = await UserRepository.updateUser(userId, {
    given_name,
    family_name,
    user_name,
    email,
    picture,
  });

  return userUpdated;
};

export const deleteUserService = async (userId: string) => {
  const existingUser = await UserRepository.findById(userId);
  if (!existingUser) {
    throw createHttpError(409, "User not found");
  }
  const deletedUser = await UserRepository.deleteUser(userId);
  return deletedUser;
};

export const getEnrolledCoursesService = async (userId: string) => {
  const existingUser = UserRepository.findById(userId);
  if (!existingUser) {
    throw createHttpError(409, "User not found");
  }
  const enrolledCourses = await UserRepository.getEnrolledCourses(userId);
  return enrolledCourses;
};
