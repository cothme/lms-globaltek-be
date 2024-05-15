import jwt from "jsonwebtoken";

interface SignUpBody {
  _id?: string;
  family_name?: string;
  given_name?: string;
  email?: string;
  password?: string;
  c_password?: string;
  isFromGoogle?: Boolean;
}
export const createToken = (user: SignUpBody) => {
  return jwt.sign(
    {
      // id: id,
      given_name: user.given_name,
      family_name: user.family_name,
      email: user.email,
    },
    String(process.env.SECRET),
    {
      expiresIn: "2h",
    }
  );
};
