import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/portfolio";

// Body parser & CORS with credentials support
app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  })
);

// Serve local fallback static directories
app.use(express.static(path.join(process.cwd(), "projectImages")));
app.use(express.static(path.join(process.cwd(), "projectMultiImages")));
app.use(express.static(path.join(process.cwd(), "uploads")));

// Main API routes
app.use("/user", userRoutes);

// Static frontend bundle serving & SPA fallback
const distPath = path.join(process.cwd(), "dist");
app.use(express.static(distPath));
app.get("*", (_req: Request, res: Response) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// Centralized error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

// Database connection & Server initialization
mongoose.connect(MONGO_URL)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
  });

export default app;

