import { InferSchemaType, Model, model, Schema } from "mongoose";

const topicSchema = new Schema({
  topic_title: { type: String, required: true },
  topic_description: { type: String, required: true },
});

type Topic = InferSchemaType<typeof topicSchema>;

export default model<Topic>("Topic", topicSchema);
