import { InferSchemaType, Model, model, Schema } from "mongoose";

const topicSchema = new Schema({
  parent_course: { type: String, ref: "Course" },
  topic_title: { type: String, required: true },
  topic_description: { type: String, required: true },
  pdf: { type: String },
  video: { type: String },
  quizzes: { type: Schema.Types.ObjectId, ref: "Quiz" },
});

type Topic = InferSchemaType<typeof topicSchema>;

export default model<Topic>("Topic", topicSchema);
