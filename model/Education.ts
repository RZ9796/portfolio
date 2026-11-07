import mongoose, { Document, Schema } from "mongoose";

export interface IEducation extends Document {
  year: string;
  degree: string;
  institution: string;
  description?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const educationSchema = new Schema<IEducation>(
  {
    year: { type: String, required: true },
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    description: { type: String },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IEducation>("education", educationSchema);

