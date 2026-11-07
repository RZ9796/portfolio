import mongoose, { Document, Schema } from "mongoose";

export interface IProject extends Document {
  name: string;
  desc?: string;
  link?: string;
  github?: string;
  tags: string[];
  featured: boolean;
  order: number;
  image?: string;
  mulImage: string[];
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    desc: { type: String },
    link: { type: String },
    github: { type: String },
    tags: [{ type: String }],
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    image: { type: String },
    mulImage: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model<IProject>("project", projectSchema);

