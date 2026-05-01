import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./database/db.js";
import userRoutes from "./routes/userroute.js";
import cookieParser from "cookie-parser";
import courseRoutes from "./routes/courseroute.js";
import mediaRoute from "./routes/mediaroute.js";
import paymentRoute from "./routes/coursePurchaseroute.js"; // Import payment routes
import progressRoute from "./routes/courseProgressroute.js";
import adminRoute from "./routes/adminroute.js"; // Import admin routes
import paymentManagementRoute from "./routes/paymentroute.js";
import moderationRoute from "./routes/moderationroute.js";
import analyticsRoute from "./routes/analyticsroute.js";
import reviewRoute from "./routes/reviewroutes.js";

dotenv.config();
db();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://your-frontend-url.onrender.com", // 🔥 ADD THIS
    "https://your-frontend-url.vercel.app"    // if using Vercel
  ],
   // Add your frontend URL
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Apply CORS middleware - this automatically handles OPTIONS preflight requests
app.use(cors(corsOptions));

// ❌ Remove this line - it's causing the error in Express 5.x
// app.options('*', cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ extended: true, limit: "500mb" }));
app.use(cookieParser());

// Routes
app.use("/api/media", mediaRoute);
app.use("/api/users", userRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/payment", paymentRoute);
app.use("/api/progress", progressRoute);
app.use("/api/admin", adminRoute); // Add admin routes
app.use("/api/payments", paymentManagementRoute);
app.use("/api/moderation", moderationRoute);
app.use("/api/analytics", analyticsRoute);
app.use("/api/reviews", reviewRoute);
// Optional: Handle 404 errors
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
