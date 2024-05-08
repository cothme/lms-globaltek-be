import { InferSchemaType, model, Schema } from "mongoose";

const userGoogleSchema = new Schema(
  {
    family_name: {
      type: String,
      required: true,
    },
    given_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

type UserGoogle = InferSchemaType<typeof userGoogleSchema>;

export default model<UserGoogle>("UserGoogle", userGoogleSchema);
