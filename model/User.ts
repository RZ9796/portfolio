import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name?: string;
  lastname?: string;
  email: string;
  subject?: string;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String },
    lastname: { type: String },
    email: { type: String, required: true },
    subject: { type: String },
    message: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("user", userSchema);

