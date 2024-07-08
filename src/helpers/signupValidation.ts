import { body } from "express-validator";
export const signupValidation = [
  body("given_name").trim().notEmpty().withMessage("Given name is required"),
  body("family_name").trim().notEmpty().withMessage("Family name is required"),
  body("user_name")
    .trim()
    .notEmpty()
    .withMessage("User name is required")
    .matches(/^\S*$/)
    .withMessage("User name must not contain whitespace"),
  body("email").trim().isEmail().withMessage("Invalid email address"),
];
