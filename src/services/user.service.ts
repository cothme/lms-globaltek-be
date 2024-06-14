import * as UserRepository from "../repositories/user.repository";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import User from "../interfaces/User";
import bcrypt from "bcrypt";
import { stripe } from "../stripe";
export const createUserService = async (userData: User, c_password: string) => {
  const {
    given_name,
    family_name,
    user_name,
    email,
    password,
    picture,
    stripe_customer_id,
  } = userData;

  const missingFields = [];
  if (!given_name) missingFields.push("given_name");
  if (!family_name) missingFields.push("family_name");
  if (!email) missingFields.push("email");
  if (!user_name) missingFields.push("user_name");
  if (!password) missingFields.push("password");

  if (missingFields.length > 0) {
    throw createHttpError(
      400,
      `Parameters missing: ${missingFields.join(", ")}`
    );
  }

  if (password !== c_password) {
    throw createHttpError(422, "Password does not match!");
  }

  const [existingEmail, existingUsername] = await Promise.all([
    UserRepository.findByEmail(String(email)),
    UserRepository.findByUsername(String(user_name)),
  ]);

  if (existingEmail) {
    throw createHttpError(409, "Email already taken");
  }
  if (existingUsername) {
    throw createHttpError(409, "Username already taken");
  }

  const passwordHashed = await bcrypt.hash(password, 10);
  const customer = await stripe.customers.create({
    email: email,
    name: `${given_name} ${family_name}`,
  });
  console.log(`Stripe customer created with ID: ${customer.id}`);
  const newUser = await UserRepository.createUser({
    given_name,
    family_name,
    user_name,
    email,
    password: passwordHashed,
    isFromGoogle: false,
    picture,
    stripe_customer_id: customer.id,
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
  try {
    const existingUser = await UserRepository.findById(userId);
    if (!existingUser) {
      throw createHttpError(409, "User not found");
    }

    const deletedUser = await UserRepository.deleteUser(userId);
    const deleteUserInCourses = await UserRepository.deleteUserFromCourse(
      userId
    );

    return {
      success: true,
      message: "User successfully deleted from system and courses.",
      data: {
        deletedUser,
        deleteUserInCourses,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: "An error occurred while deleting the user.",
      error: error.message,
    };
  }
};

export const getEnrolledCoursesService = async (userName: string) => {
  const existingUser = UserRepository.findByUsername(userName);
  if (!existingUser) {
    throw createHttpError(409, "User not found");
  }
  const enrolledCourses = await UserRepository.getEnrolledCourses(userName);
  return enrolledCourses;
};
