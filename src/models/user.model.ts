import createHttpError from "http-errors";
import { InferSchemaType, Model, model, Schema } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema(
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
    isFromGoogle: {
      type: Boolean,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.statics.aaa = async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw createHttpError(500, "Incorrect credentials");
  }
  throw createHttpError(500, "Incorrect credentials");
};
// userSchema.method("login", async (email, password) => {
//   const user = await this.findOne({ email });
//   if (user) {
//     const auth = await bcrypt.compare(password, user.password);
//     if (auth) {
//       return user;
//     }
//     throw createHttpError(500, "Incorrect credentials");
//   }
//   throw createHttpError(500, "Incorrect credentials");
// });
type User = InferSchemaType<typeof userSchema>;

export default model<User>("User", userSchema);
