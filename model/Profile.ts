import mongoose, { Document, Schema } from "mongoose";

export interface IProfile extends Document {
  name?: string;
  tagline?: string;
  bio?: string;
  subTitle?: string;
  availableStatus?: string;
  isAvailable?: boolean;
  resumeUrl?: string;
  leetcodeUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const profileSchema = new Schema<IProfile>(
  {
    name: { type: String },
    tagline: { type: String },
    bio: { type: String },
    subTitle: { type: String },
    availableStatus: { type: String },
    isAvailable: { type: Boolean, default: true },
    resumeUrl: { type: String },
    leetcodeUrl: { type: String },
    linkedinUrl: { type: String },
    githubUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IProfile>("profile", profileSchema);

