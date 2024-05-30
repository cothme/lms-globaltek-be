import { InferSchemaType, Model, model, Schema } from "mongoose";
import course from "../interfaces/Course";
import UserModel from "../models/user.model";

const courseSchema = new Schema({
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
    required: false,
    default: false,
  },
  publisher: {
    type: String,
    ref: "Admin",
    required: true,
    unique: false,
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
  topics: {
    type: [],
    required: false,
  },
  announcement: {
    type: [],
    required: false,
  },
});
courseSchema.pre<course>("deleteOne", async function (next: any) {
  const user = this.courseId;
  try {
    await UserModel.updateMany(
      { users: this.courseId },
      { $pull: { users: this.courseId } }
    );
    next();
  } catch (err) {
    next(err);
  }
});
type Course = InferSchemaType<typeof courseSchema>;

export default model<Course>("Course", courseSchema);
