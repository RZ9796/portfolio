import mongoose, { Document, Schema } from "mongoose";

export interface ISkill extends Document {
  name: string;
  category: "frontend" | "backend" | "fullstack" | "tools";
  image: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const skillSchema = new Schema<ISkill>(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["frontend", "backend", "fullstack", "tools"],
      default: "frontend",
    },
    image: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<ISkill>("skill", skillSchema);

