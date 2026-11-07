import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const getCookies = (req: Request): Record<string, string> => {
  if (req.cookies && typeof req.cookies === "object") {
    return req.cookies;
  }
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return {};

  return Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [key, ...val] = c.trim().split("=");
      return [key, decodeURIComponent(val.join("="))];
    })
  );
};

export const adminProtected = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const cookies = getCookies(req);
    const authHeader = req.headers.authorization;
    const token = cookies.auth || (authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader);

    if (!token) {
      res.status(401).json({ message: "No authentication token or cookie found" });
      return;
    }

    const secret = process.env.JWT_KEY || "secretkey";
    jwt.verify(token, secret, (err, decoded) => {
      if (err || !decoded) {
        res.status(401).json({ message: "Token expired or mismatched" });
        return;
      }
      req.admin = decoded;
      next();
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Authentication verification error" });
  }
};

