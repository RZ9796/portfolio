const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    lastname: { type: String },
    email: { type: String, unique: true, required: true },
    subject: { type: String },
    message: { type: String },
  },
  { timestamps: true }
);
module.exports = mongoose.model("user", userSchema);
