import { InferSchemaType, Model, model, Schema } from "mongoose";
import course from "../interfaces/Course";
import UserModel from "../models/user.model";

const courseSchema = new Schema(
  {
    course_title: {
      type: String,
      required: true,
      unique: true,
    },
    course_code: {
      type: String,
      required: true,
      unique: true,
    },
    course_description: {
      type: String,
      required: true,
    },
    published: {
      type: Boolean,
      default: false,
    },
    publisher: {
      type: String,
      ref: "Admin",
      required: true,
    },
    required_subscription: {
      type: String,
      required: true,
      default: "Free",
    },
    subscribers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    topics: [
      {
        type: String,
      },
    ],
    announcement: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

type Course = InferSchemaType<typeof courseSchema>;

export default model<Course>("Course", courseSchema);
