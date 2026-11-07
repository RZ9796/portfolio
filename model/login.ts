import mongoose, { Document, Schema } from "mongoose";

export interface ILogin extends Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const loginSchema = new Schema<ILogin>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ILogin>("login", loginSchema);

