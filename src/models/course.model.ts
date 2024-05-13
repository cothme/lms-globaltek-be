import { InferSchemaType, Model, model, Schema } from "mongoose";

const courseSchema = new Schema({
  course_name: {
    type: String,
    required: true,
    unique: true,
  },
  course_type: {
    type: String,
    required: true,
  },
  topics: {
    type: [],
    required: false,
  },
  announcement: {
    type: [],
    required: false,
  },
});

type Course = InferSchemaType<typeof courseSchema>;

export default model<Course>("Course", courseSchema);
