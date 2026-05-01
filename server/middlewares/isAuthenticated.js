// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/usermodel.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    // Find the user from database
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    // Set both req.id and req.user for compatibility
    req.id = decoded.userId;
    req.user = user; // This is what your controller expects

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export default isAuthenticated;
