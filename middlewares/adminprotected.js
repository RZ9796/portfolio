const jwt = require("jsonwebtoken");
exports.adminProtected = (req, res, next) => {
  try {
    if (!req.cookies.auth) {
      return res.status(401).json({ message: "No cookie found " });
    }
    jwt.verify(req.cookies.auth, process.env.JWT_KEY, (err, decode) => {
      if (err) {
        return res.status(401).json({ message: "Token mismatched" });
      }
      next();
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "user Protected Error" });
  }
};
