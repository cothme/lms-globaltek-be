import { InferSchemaType, Model, model, Schema } from "mongoose";

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
  difficulty: {
    type: Number,
    required: false,
  },
});

type Course = InferSchemaType<typeof courseSchema>;

export default model<Course>("Course", courseSchema);
