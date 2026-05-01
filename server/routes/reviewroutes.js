import express from "express";
import {
  createReview,
  getReviewsByCourse,
  updateReview,
  deleteReview,
  markHelpful,
  markUnhelpful,
} from "../controllers/reviewcontroller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();

// Get all reviews for a course (public)
router.get("/:courseId", getReviewsByCourse);

// Create a new review (authenticated)
router.post("/:courseId", isAuthenticated, createReview);

// Update a review (authenticated)
router.put("/:courseId/:reviewId", isAuthenticated, updateReview);

// Delete a review (authenticated)
router.delete("/:courseId/:reviewId", isAuthenticated, deleteReview);

// Mark review as helpful (authenticated)
router.post("/:reviewId/helpful", isAuthenticated, markHelpful);

// Mark review as unhelpful (authenticated)
router.post("/:reviewId/unhelpful", isAuthenticated, markUnhelpful);

export default router;
