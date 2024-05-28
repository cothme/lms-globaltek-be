import createHttpError from "http-errors";
import { InferSchemaType, Model, model, Schema } from "mongoose";
import bcrypt from "bcrypt";

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
      select: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      select: true,
    },
    subscription_tier: {
      type: String,
      required: false,
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

type User = InferSchemaType<typeof userSchema>;

export default model<User>("User", userSchema);
