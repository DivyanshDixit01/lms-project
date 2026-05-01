import express from "express";
import {
  // User Management
  getAllUsers,
  getUserDetails,
  createUser,
  updateUser,
  suspendUser,
  deleteUser,
  // Course Management
  getAllCourses,
  getCourseDetails,
  approveCourse,
  rejectCourse,
  archiveCourse,
  // Payment Management
  getAllPayments,
  getPaymentDetails,
  processRefund,
  // Analytics
  getDashboardAnalytics,
  getUserAnalytics,
  getCourseAnalytics,
  getRevenueAnalytics,
  // Content Moderation
  getFlaggedContent,
  approveFlaggedContent,
  rejectFlaggedContent,
  getModerationStats,
  // Audit Logs
  getAuditLogs,
} from "../controllers/admincontroller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  console.log("Admin check - User:", req.user);
  console.log("Admin check - User role:", req.user?.role);
  
  if (req.user && req.user.role === "admin") {
    console.log("Admin access granted");
    next();
  } else {
    console.log("Admin access denied");
    res.status(403).json({ success: false, message: "Access denied. Admin only." });
  }
};

// Test endpoint
router.get("/test", isAuthenticated, (req, res) => {
  console.log("Test endpoint hit");
  res.json({ success: true, message: "Admin routes working", user: req.user });
});

// Apply authentication and admin check to all routes
router.use(isAuthenticated);
router.use(isAdmin);

// ============ USER MANAGEMENT ROUTES ============
router.get("/users", getAllUsers);
router.get("/users/:userId", getUserDetails);
router.post("/users", createUser);
router.put("/users/:userId", updateUser);
router.put("/users/:userId/suspend", suspendUser);
router.delete("/users/:userId", deleteUser);

// ============ COURSE MANAGEMENT ROUTES ============
router.get("/courses", getAllCourses);
router.get("/courses/:courseId", getCourseDetails);
router.put("/courses/:courseId/approve", approveCourse);
router.put("/courses/:courseId/reject", rejectCourse);
router.put("/courses/:courseId/archive", archiveCourse);

// ============ PAYMENT MANAGEMENT ROUTES ============
router.get("/payments", getAllPayments);
router.get("/payments/:paymentId", getPaymentDetails);
router.post("/payments/:paymentId/refund", processRefund);

// ============ ANALYTICS ROUTES ============
router.get("/analytics/dashboard", getDashboardAnalytics);
router.get("/analytics/users", getUserAnalytics);
router.get("/analytics/courses", getCourseAnalytics);
router.get("/analytics/revenue", getRevenueAnalytics);

// ============ CONTENT MODERATION ROUTES ============
router.get("/moderation/flagged-content", getFlaggedContent);
router.put("/moderation/flagged-content/:contentId/approve", approveFlaggedContent);
router.put("/moderation/flagged-content/:contentId/reject", rejectFlaggedContent);
router.get("/moderation/stats", getModerationStats);

// ============ AUDIT LOGS ROUTES ============
router.get("/audit-logs", getAuditLogs);

export default router;
