const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Middleware: Protect routes (requires valid JWT)
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user (without password) to request
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Also carry admin flag from token (optional but handy)
      req.isAdmin = decoded.isAdmin || req.user.isAdmin;

      next();
    } catch (err) {
      console.error("❌ JWT verification failed:", err.message);
      return res.status(401).json({ message: "Not authorized, invalid or expired token" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

/**
 * Middleware: Restrict to Admins only
 */
const admin = (req, res, next) => {
  if (req.user && (req.user.isAdmin || req.isAdmin)) {
    next();
  } else {
    return res.status(403).json({ message: "Admin access required" });
  }
};

module.exports = { protect, admin };
