import Review from "../models/reviewmodel.js";
import Course from "../models/coursemodel.js";

// Create a new review
export const createReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.id;

    // Validate required fields
    if (!rating || !title || !comment) {
      return res.status(400).json({
        message: "Rating, title, and comment are required",
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // Check if user already reviewed this course
    const existingReview = await Review.findOne({
      course: courseId,
      user: userId,
    });

    if (existingReview) {
      return res.status(400).json({
        message: "You have already reviewed this course",
      });
    }

    // Create review
    const review = await Review.create({
      course: courseId,
      user: userId,
      rating,
      title,
      comment,
    });

    // Populate user details
    await review.populate("user", "name profilePicture");

    // Update course rating
    const allReviews = await Review.find({ course: courseId });
    const averageRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Course.findByIdAndUpdate(courseId, {
      rating: averageRating.toFixed(1),
      totalRatings: allReviews.length,
      $push: { reviews: review._id },
    });

    return res.status(201).json({
      message: "Review created successfully",
      review,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all reviews for a course
export const getReviewsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // Get all reviews sorted by newest first
    const reviews = await Review.find({ course: courseId })
      .populate("user", "name profilePicture")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Reviews retrieved successfully",
      reviews,
      totalReviews: reviews.length,
      averageRating: course.rating || 0,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update a review
export const updateReview = async (req, res) => {
  try {
    const { courseId, reviewId } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.id;

    // Find review
    const review = await Review.findOne({
      _id: reviewId,
      course: courseId,
      user: userId,
    });

    if (!review) {
      return res.status(404).json({
        message: "Review not found or you don't have permission to update it",
      });
    }

    // Update review
    if (rating) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          message: "Rating must be between 1 and 5",
        });
      }
      review.rating = rating;
    }
    if (title) review.title = title;
    if (comment) review.comment = comment;

    await review.save();
    await review.populate("user", "name profilePicture");

    // Recalculate course rating
    const allReviews = await Review.find({ course: courseId });
    const averageRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Course.findByIdAndUpdate(courseId, {
      rating: averageRating.toFixed(1),
      totalRatings: allReviews.length,
    });

    return res.status(200).json({
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    console.error("Error updating review:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const { courseId, reviewId } = req.params;
    const userId = req.id;

    // Find and delete review
    const review = await Review.findOneAndDelete({
      _id: reviewId,
      course: courseId,
      user: userId,
    });

    if (!review) {
      return res.status(404).json({
        message: "Review not found or you don't have permission to delete it",
      });
    }

    // Remove review from course
    await Course.findByIdAndUpdate(courseId, {
      $pull: { reviews: reviewId },
    });

    // Recalculate course rating
    const allReviews = await Review.find({ course: courseId });
    const averageRating =
      allReviews.length > 0
        ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
        : 0;

    await Course.findByIdAndUpdate(courseId, {
      rating: averageRating,
      totalRatings: allReviews.length,
    });

    return res.status(200).json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Mark review as helpful
export const markHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    // Check if user already marked as helpful
    if (review.helpfulUsers.includes(userId)) {
      review.helpfulUsers = review.helpfulUsers.filter(
        (id) => id.toString() !== userId
      );
      review.helpful = Math.max(0, review.helpful - 1);
    } else {
      // Remove from unhelpful if it was there
      if (review.unhelpfulUsers.includes(userId)) {
        review.unhelpfulUsers = review.unhelpfulUsers.filter(
          (id) => id.toString() !== userId
        );
        review.unhelpful = Math.max(0, review.unhelpful - 1);
      }
      review.helpfulUsers.push(userId);
      review.helpful += 1;
    }

    await review.save();

    return res.status(200).json({
      message: "Review marked as helpful",
      review,
    });
  } catch (error) {
    console.error("Error marking review as helpful:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Mark review as unhelpful
export const markUnhelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    // Check if user already marked as unhelpful
    if (review.unhelpfulUsers.includes(userId)) {
      review.unhelpfulUsers = review.unhelpfulUsers.filter(
        (id) => id.toString() !== userId
      );
      review.unhelpful = Math.max(0, review.unhelpful - 1);
    } else {
      // Remove from helpful if it was there
      if (review.helpfulUsers.includes(userId)) {
        review.helpfulUsers = review.helpfulUsers.filter(
          (id) => id.toString() !== userId
        );
        review.helpful = Math.max(0, review.helpful - 1);
      }
      review.unhelpfulUsers.push(userId);
      review.unhelpful += 1;
    }

    await review.save();

    return res.status(200).json({
      message: "Review marked as unhelpful",
      review,
    });
  } catch (error) {
    console.error("Error marking review as unhelpful:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export default {
  createReview,
  getReviewsByCourse,
  updateReview,
  deleteReview,
  markHelpful,
  markUnhelpful,
};
