import UserModel from "../models/user.model";
import User from "../interfaces/User";

export const createUser = async (userData: User) => {
  return await UserModel.create(userData);
};
