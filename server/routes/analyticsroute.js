import express from "express";
import {
  getDashboardMetrics,
  getEngagementMetrics,
  getCoursePerformance,
  getConversionMetrics,
  getAnalyticsSummary,
  getCohortAnalysis,
} from "../controllers/analyticscontroller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();

// Get dashboard metrics
router.get("/dashboard", isAuthenticated, getDashboardMetrics);

// Get analytics summary
router.get("/summary", isAuthenticated, getAnalyticsSummary);

// Get engagement metrics
router.get("/engagement", isAuthenticated, getEngagementMetrics);

// Get course performance
router.get("/courses/performance", isAuthenticated, getCoursePerformance);

// Get conversion metrics
router.get("/conversion", isAuthenticated, getConversionMetrics);

// Get cohort analysis
router.get("/cohorts", isAuthenticated, getCohortAnalysis);

export default router;
