"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMultipleFiles = exports.uploadFileToStorage = exports.uploadResume = exports.uploadGallery = exports.uploadProjectImage = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
const cloudinary_1 = require("cloudinary");
// Configure Cloudinary if credentials exist in environment
if (process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET) {
    cloudinary_1.v2.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
}
const isCloudinaryActive = Boolean(process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET);
// Fallback local directories for offline development
const ensureDir = (dir) => {
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
};
ensureDir("projectImages");
ensureDir("projectMultiImages");
ensureDir("uploads");
// Use memory storage when Cloudinary is available; fallback to disk storage
const storage = isCloudinaryActive
    ? multer_1.default.memoryStorage()
    : multer_1.default.diskStorage({
        destination: (_req, file, cb) => {
            if (file.fieldname === "resume") {
                cb(null, "uploads");
            }
            else if (file.fieldname === "mulImage") {
                cb(null, "projectMultiImages");
            }
            else {
                cb(null, "projectImages");
            }
        },
        filename: (_req, file, cb) => {
            cb(null, `${(0, uuid_1.v4)()}${path_1.default.extname(file.originalname)}`);
        },
    });
exports.uploadProjectImage = (0, multer_1.default)({ storage }).single("image");
exports.uploadGallery = (0, multer_1.default)({ storage }).array("mulImage", 10);
exports.uploadResume = (0, multer_1.default)({ storage }).single("resume");
/**
 * Uploads a Multer file to Cloudinary CDN or saves to disk.
 * Returns the permanent HTTPS Cloudinary URL or local file path.
 */
const uploadFileToStorage = async (file, targetFolder = "portfolio/projects") => {
    if (isCloudinaryActive && file.buffer) {
        return new Promise((resolve, reject) => {
            const isPdf = file.mimetype === "application/pdf" || file.originalname.endsWith(".pdf");
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                folder: targetFolder,
                resource_type: isPdf ? "raw" : "image",
            }, (error, result) => {
                if (error || !result) {
                    return reject(error || new Error("Cloudinary upload failed"));
                }
                resolve(result.secure_url);
            });
            uploadStream.end(file.buffer);
        });
    }
    // Local fallback: return filename saved on disk
    return file.filename || file.originalname;
};
exports.uploadFileToStorage = uploadFileToStorage;
/**
 * Processes an array of uploaded files
 */
const uploadMultipleFiles = async (files, targetFolder = "portfolio/projects") => {
    return Promise.all(files.map((file) => (0, exports.uploadFileToStorage)(file, targetFolder)));
};
exports.uploadMultipleFiles = uploadMultipleFiles;
