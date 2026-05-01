import jwt from "jsonwebtoken";

const generateToken = (res, user) => {
  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,        // 🔥 ALWAYS true on Render (HTTPS)
    sameSite: "none",    // 🔥 REQUIRED for cross-origin
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  return token;
};

export default generateToken;