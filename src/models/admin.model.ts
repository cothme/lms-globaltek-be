import { InferSchemaType, model, Schema } from "mongoose";

const adminSchema = new Schema(
  {
    given_name: {
      type: String,
      required: true,
    },
    family_name: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      select: true,
    },
    password: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

type Admin = InferSchemaType<typeof adminSchema>;

export default model<Admin>("Admin", adminSchema);
