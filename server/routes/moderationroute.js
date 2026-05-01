import express from "express";
import {
  createFlag,
  getAllFlags,
  getFlagById,
  approveFlag,
  removeFlag,
  warnUser,
  getModerationHistory,
  getModerationStats,
  createAppeal,
  getAppeals,
} from "../controllers/moderationcontroller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();

// Create flag (user reports content)
router.post("/flags", isAuthenticated, createFlag);

// Get all flagged content
router.get("/flags", isAuthenticated, getAllFlags);

// Get moderation statistics
router.get("/stats", isAuthenticated, getModerationStats);

// Get moderation history
router.get("/history", isAuthenticated, getModerationHistory);

// Get single flag
router.get("/flags/:id", isAuthenticated, getFlagById);

// Approve flagged content
router.post("/flags/:id/approve", isAuthenticated, approveFlag);

// Remove flagged content
router.post("/flags/:id/remove", isAuthenticated, removeFlag);

// Warn user
router.post("/warn-user", isAuthenticated, warnUser);

// Get appeals
router.get("/appeals", isAuthenticated, getAppeals);

// Create appeal
router.post("/appeals", isAuthenticated, createAppeal);

export default router;
