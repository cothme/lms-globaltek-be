import createHttpError from "http-errors";
import mongoose, { InferSchemaType, Model, model, Schema } from "mongoose";
import CourseModel from "../models/course.model";
import bcrypt from "bcrypt";
import user from "../interfaces/User";

const userSchema = new Schema(
  {
    given_name: {
      type: String,
      required: true,
    },
    family_name: {
      type: String,
      required: false,
    },
    user_name: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    subscription_tier: {
      type: String,
      required: false,
      default: "Free",
    },
    password: {
      type: String,
      required: false,
    },
    isFromGoogle: {
      type: Boolean,
      required: false,
    },
    picture: {
      type: String,
      required: false,
    },
    courses_enrolled: [
      {
        type: Schema.Types.ObjectId,
        ref: "Courses",
      },
    ],
  },
  {
    timestamps: true,
  }
);
userSchema.pre<user>("deleteOne", async function (next: any) {
  const user = this._id;
  try {
    await CourseModel.updateMany(
      { users: this._id },
      { $pull: { users: this._id } }
    );
    next();
  } catch (err) {
    next(err);
  }
});
type User = InferSchemaType<typeof userSchema>;

export default model<User>("User", userSchema);
