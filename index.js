const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const app = express();
require("dotenv").config({ path: "./.env" });

app.use(express.json());
app.use(cors());
app.use("/user", require("./routes/userRoutes"));

app.use(express.static(path.join(__dirname, "dist"))); //

app.use("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

mongoose.connect(process.env.MONGO_URL);
mongoose.connection.once("open", () => {
  console.log("Mongo connected");
  app.listen(process.env.PORT, console.log("server running"));
});
