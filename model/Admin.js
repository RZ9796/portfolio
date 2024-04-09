const mongoose = require("mongoose");
const adminSchema = new mongoose.Schema(
  {
    name: { type: String },
    desc: { type: String },
    link: { type: String },
    image: { type: String },
    mulImage: { type: [String] },
  },
  { timestamps: true }
);
module.exports = mongoose.model("admin", adminSchema);
