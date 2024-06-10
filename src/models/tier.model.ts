import { InferSchemaType, Model, model, Schema } from "mongoose";

const tierSchema = new Schema({
  tier_title: { type: String, required: true },
  tier_description: { type: String, required: true },
  tier_price: { type: Number, required: true },
});

type Tier = InferSchemaType<typeof tierSchema>;

export default model<Tier>("Tier", tierSchema);
