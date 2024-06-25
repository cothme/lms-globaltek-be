import jwt from "jsonwebtoken";
import User from "../interfaces/User";

export const createToken = (user: User) => {
  return jwt.sign(
    {
      _id: user._id,
      given_name: user.given_name,
      user_name: user.user_name,
      family_name: user.family_name,
      email: user.email,
      subscription_tier: user.subscription_tier,
    },
    String(process.env.SECRET),
    {
      expiresIn: "2h",
    }
  );
};
