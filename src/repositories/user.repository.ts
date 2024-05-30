import UserModel from "../models/user.model";
import CourseModel from "../models/course.model";
import User from "../interfaces/User";

export const findByEmail = async (email: string) => {
  return await UserModel.findOne({ email });
};
export const findByUsername = async (user_name: string) => {
  return await UserModel.findOne({ user_name });
};

export const findById = async (_id: string) => {
  return await UserModel.findOne({ _id });
};

export const getAllUser = async () => {
  return await UserModel.find().sort({ createdAt: -1 });
};

export const createUser = async (userData: User) => {
  return await UserModel.create(userData);
};

export const updateUser = async (userId: string, userData: User) => {
  return await UserModel.updateOne({ _id: userId }, userData);
};

export const deleteUser = async (userId: string) => {
  return await UserModel.deleteOne({ _id: userId });
};

export const getEnrolledCourses = async (userId: string) => {
  const user = await UserModel.findOne({ _id: userId }).select(
    "courses_enrolled"
  );

  const courseIds = user?.courses_enrolled;

  const courses = await CourseModel.find({ _id: { $in: courseIds } });

  return courses;
};
