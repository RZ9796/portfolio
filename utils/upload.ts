import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuid } from "uuid";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary if credentials exist in environment
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const isCloudinaryActive = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

// Fallback local directories for offline development
const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};
ensureDir("projectImages");
ensureDir("projectMultiImages");
ensureDir("uploads");

// Use memory storage when Cloudinary is available; fallback to disk storage
const storage = isCloudinaryActive
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (_req, file, cb) => {
        if (file.fieldname === "resume") {
          cb(null, "uploads");
        } else if (file.fieldname === "mulImage") {
          cb(null, "projectMultiImages");
        } else {
          cb(null, "projectImages");
        }
      },
      filename: (_req, file, cb) => {
        cb(null, `${uuid()}${path.extname(file.originalname)}`);
      },
    });

export const uploadProjectImage = multer({ storage }).single("image");
export const uploadGallery = multer({ storage }).array("mulImage", 10);
export const uploadResume = multer({ storage }).single("resume");

/**
 * Uploads a Multer file to Cloudinary CDN or saves to disk.
 * Returns the permanent HTTPS Cloudinary URL or local file path.
 */
export const uploadFileToStorage = async (
  file: Express.Multer.File,
  targetFolder = "portfolio/projects"
): Promise<string> => {
  if (isCloudinaryActive && file.buffer) {
    return new Promise((resolve, reject) => {
      const isPdf = file.mimetype === "application/pdf" || file.originalname.endsWith(".pdf");
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: targetFolder,
          resource_type: isPdf ? "raw" : "image",
        },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error("Cloudinary upload failed"));
          }
          resolve(result.secure_url);
        }
      );
      uploadStream.end(file.buffer);
    });
  }

  // Local fallback: return filename saved on disk
  return file.filename || file.originalname;
};

/**
 * Processes an array of uploaded files
 */
export const uploadMultipleFiles = async (
  files: Express.Multer.File[],
  targetFolder = "portfolio/projects"
): Promise<string[]> => {
  return Promise.all(files.map((file) => uploadFileToStorage(file, targetFolder)));
};

