"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminProtected = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getCookies = (req) => {
    if (req.cookies && typeof req.cookies === "object") {
        return req.cookies;
    }
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader)
        return {};
    return Object.fromEntries(cookieHeader.split(";").map((c) => {
        const [key, ...val] = c.trim().split("=");
        return [key, decodeURIComponent(val.join("="))];
    }));
};
const adminProtected = (req, res, next) => {
    try {
        const cookies = getCookies(req);
        const authHeader = req.headers.authorization;
        const token = cookies.auth || (authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader);
        if (!token) {
            res.status(401).json({ message: "No authentication token or cookie found" });
            return;
        }
        const secret = process.env.JWT_KEY || "secretkey";
        jsonwebtoken_1.default.verify(token, secret, (err, decoded) => {
            if (err || !decoded) {
                res.status(401).json({ message: "Token expired or mismatched" });
                return;
            }
            req.admin = decoded;
            next();
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || "Authentication verification error" });
    }
};
exports.adminProtected = adminProtected;
