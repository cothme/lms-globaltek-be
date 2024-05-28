import jwt from "jsonwebtoken";

interface SignUpBody {
  _id?: string;
  family_name?: string;
  given_name?: string;
  user_name?: string;
  email?: string;
  password?: string;
  c_password?: string;
  isFromGoogle?: Boolean;
}
export const createToken = (user: SignUpBody) => {
  return jwt.sign(
    {
      _id: user._id,
      given_name: user.given_name,
      user_name: user.user_name,
      family_name: user.family_name,
      email: user.email,
    },
    String(process.env.SECRET),
    {
      expiresIn: "2h",
    }
  );
};
