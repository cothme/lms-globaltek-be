import { InferSchemaType, Model, model, Schema } from "mongoose";

const topicSchema = new Schema({
  parent_course: { type: Schema.Types.ObjectId, ref: "Course" },
  topic_title: { type: String, required: true },
  topic_description: { type: String, required: true },
  videos: { type: Schema.Types.ObjectId, ref: "Video" },
  quizzes: { type: Schema.Types.ObjectId, ref: "Quiz" },
});

type Topic = InferSchemaType<typeof topicSchema>;

export default model<Topic>("Topic", topicSchema);
