import { InferSchemaType, Model, model, Schema } from "mongoose";

const courseSchema = new Schema({
  course_name: {
    type: String,
    required: true,
    unique: true,
  },
  course_description: {
    type: String,
    required: false,
  },
  instructor: {
    type: String,
    required: false,
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
    required: true,
  },
});

type Course = InferSchemaType<typeof courseSchema>;

export default model<Course>("Course", courseSchema);
