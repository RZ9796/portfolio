"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/portfolio";
// Body parser & CORS with credentials support
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
}));
// Serve local fallback static directories
app.use(express_1.default.static(path_1.default.join(process.cwd(), "projectImages")));
app.use(express_1.default.static(path_1.default.join(process.cwd(), "projectMultiImages")));
app.use(express_1.default.static(path_1.default.join(process.cwd(), "uploads")));
// Main API routes
app.use("/user", userRoutes_1.default);
// Static frontend bundle serving & SPA fallback
const distPath = path_1.default.join(process.cwd(), "dist");
app.use(express_1.default.static(distPath));
app.get("*", (_req, res) => {
    res.sendFile(path_1.default.join(distPath, "index.html"));
});
// Centralized error handler
app.use((err, _req, res, _next) => {
    res.status(err.status || 500).json({
        message: err.message || "Internal server error",
    });
});
// Database connection & Server initialization
mongoose_1.default.connect(MONGO_URL)
    .then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
})
    .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
});
exports.default = app;
