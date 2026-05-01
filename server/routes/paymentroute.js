import express from "express";
import {
  getAllPayments,
  getPaymentById,
  processRefund,
  getRevenueAnalytics,
  getPaymentStats,
} from "../controllers/paymentcontroller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();

// Get all payments with filters
router.get("/", isAuthenticated, getAllPayments);

// ✅ IMPORTANT: /stats must come BEFORE /:id to avoid route conflicts
router.get("/stats", isAuthenticated, getPaymentStats);

// Get revenue analytics
router.get("/analytics/revenue", isAuthenticated, getRevenueAnalytics);

// Get single payment (must be last)
router.get("/:id", isAuthenticated, getPaymentById);

// Process refund
router.post("/:id/refund", isAuthenticated, processRefund);

export default router;
