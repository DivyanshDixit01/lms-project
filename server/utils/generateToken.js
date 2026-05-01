// server/utils/generateToken.js
import jwt from "jsonwebtoken";

const generateToken = (res, user) => {
  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  // Make sure cookie is set with proper options
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // false for development
    sameSite: "lax", // Changed from "strict" to "lax" for better compatibility
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/", // Make sure cookie is available for all paths
  });

  return token;
};

export { generateToken };
export default generateToken;
