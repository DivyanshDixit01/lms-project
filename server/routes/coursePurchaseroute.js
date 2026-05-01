// routes/paymentRoutes.js
import express from "express";
import {
  createOrder,
  verifyPayment,
  getUserPurchases,
  checkPurchaseStatus,
  getAllPurchases,
  getCoursePurchaseStats,
} from "../controllers/coursePurchasecontroller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

// Payment routes
router.post("/create-order", isAuthenticated, createOrder);
router.post("/verify-payment", isAuthenticated, verifyPayment);
router.get("/my-purchases", isAuthenticated, getUserPurchases);
router.get("/check/:courseId", isAuthenticated, checkPurchaseStatus);

// Admin routes
router.get("/admin/all", isAuthenticated, getAllPurchases);
router.get("/admin/stats", isAuthenticated, getCoursePurchaseStats);

export default router;
