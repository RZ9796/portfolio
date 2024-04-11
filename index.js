const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const app = express();
require("dotenv").config({ path: "./.env" });

app.use(express.json());
app.use(
  cors({
    // origin: "http://localhost:5173",
    origin: "https://dev-portfolio-rm9u.onrender.com",
    credentials: true,
  })
);
app.use(express.static("projectImages"));
app.use(express.static("projectMultiImages"));
app.use(express.static(path.join(__dirname, "dist")));
app.use("/user", require("./routes/userRoutes"));

app.use("*", (req, res) => {
  console.log("404");
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.use((err, req, res, next) => {
  console.log("errrrro handler");
  res.status(500).json({ message: err.message || "something went wrong " });
});
mongoose.connect(process.env.MONGO_URL);
mongoose.connection.once("open", () => {
  console.log("Mongo connected");
  app.listen(process.env.PORT, console.log("server running"));
});
