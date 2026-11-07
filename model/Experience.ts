import mongoose, { Document, Schema } from "mongoose";

export interface IExperience extends Document {
  role: string;
  company: string;
  period: string;
  location: string;
  highlights: string[];
  tech: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const experienceSchema = new Schema<IExperience>(
  {
    role: { type: String, required: true },
    company: { type: String, required: true },
    period: { type: String, required: true },
    location: { type: String, default: "Remote / India" },
    highlights: [{ type: String }],
    tech: [{ type: String }],
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IExperience>("experience", experienceSchema);

