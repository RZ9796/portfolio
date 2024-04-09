const multer = require("multer");
const path = require("path");
const { v4: uuid } = require("uuid");

const ProfileStroage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, uuid() + path.extname(file.originalname));
    console.log(cb);
  },
  destination: (req, file, cb) => {
    cb(null, "projectImages");
  },
});

const galleryStroage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, uuid() + path.extname(file.originalname));
    console.log(cb);
  },
  destination: (req, file, cb) => {
    cb(null, "projectMultiImages");
  },
});

const uploadGallery = multer({ storage: galleryStroage }).array("mulImage", 5);

const uploadProjectImage = multer({ storage: ProfileStroage }).single("image");

module.exports = { uploadProjectImage, uploadGallery };
