import mongoose, { Schema, models, model } from "mongoose";

export type UserRole = "user" | "admin";

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default models.User || model<IUser>("User", UserSchema);
