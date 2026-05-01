import React, { useState } from "react";
import { Star, ThumbsUp, Flag, User, Loader } from "lucide-react";
import toast from "react-hot-toast";
import {
  useGetReviewsByCourseQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useMarkReviewHelpfulMutation,
  useMarkReviewUnhelpfulMutation,
} from "../features/api/courseApi";

const CourseReviews = ({ courseId, isEnrolled, onReportClick }) => {
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: "",
    comment: "",
  });

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);

  // Get user from localStorage to check if authenticated
  const userToken = localStorage.getItem("token");
  const isAuthenticated = !!userToken;

  // Queries and mutations
  const { data: reviewsData, isLoading: isLoadingReviews, refetch } = useGetReviewsByCourseQuery(courseId);
  const [createReview, { isLoading: isCreating }] = useCreateReviewMutation();
  const [updateReview, { isLoading: isUpdating }] = useUpdateReviewMutation();
  const [deleteReview] = useDeleteReviewMutation();
  const [markHelpful] = useMarkReviewHelpfulMutation();
  const [markUnhelpful] = useMarkReviewUnhelpfulMutation();

  const reviews = reviewsData?.reviews || [];
  const averageRating = reviewsData?.averageRating || 0;

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!newReview.title.trim() || !newReview.comment.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      if (editingReviewId) {
        await updateReview({
          courseId,
          reviewId: editingReviewId,
          ...newReview,
        }).unwrap();
        toast.success("Review updated successfully!");
        setEditingReviewId(null);
      } else {
        await createReview({
          courseId,
          ...newReview,
        }).unwrap();
        toast.success("Review posted successfully!");
      }

      setNewReview({ rating: 5, title: "", comment: "" });
      setShowReviewForm(false);
      refetch();
    } catch (error) {
      toast.error(error.data?.message || "Failed to post review");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await deleteReview({ courseId, reviewId }).unwrap();
        toast.success("Review deleted successfully!");
        refetch();
      } catch (error) {
        toast.error("Failed to delete review");
      }
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    try {
      await markHelpful(reviewId).unwrap();
      refetch();
    } catch (error) {
      toast.error("Failed to mark review");
    }
  };

  const handleMarkUnhelpful = async (reviewId) => {
    try {
      await markUnhelpful(reviewId).unwrap();
      refetch();
    } catch (error) {
      toast.error("Failed to mark review");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (isLoadingReviews) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-center min-h-96">
        <Loader className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Student Reviews ({reviews.length})
        </h2>

        {/* Rating Summary */}
        <div className="flex items-center gap-4 mb-4">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">
                {averageRating}
              </span>
              <span className="text-gray-500">/5</span>
            </div>
            <div className="flex gap-0.5 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(averageRating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = reviews.filter((r) => r.rating === rating).length;
              const percentage =
                reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-8">{rating}★</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-8 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Write Review Button */}
        {isEnrolled && isAuthenticated && (
          <button
            onClick={() => {
              setShowReviewForm(!showReviewForm);
              setEditingReviewId(null);
              setNewReview({ rating: 5, title: "", comment: "" });
            }}
            className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium text-sm"
          >
            {showReviewForm ? "Cancel" : "Write a Review"}
          </button>
        )}
        {!isEnrolled && (
          <div className="w-full px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm text-center">
            Enroll in this course to write a review
          </div>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && isEnrolled && isAuthenticated && (
        <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setNewReview({ ...newReview, rating })}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-6 h-6 cursor-pointer transition ${
                      rating <= newReview.rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300 hover:text-amber-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={newReview.title}
              onChange={(e) =>
                setNewReview({ ...newReview, title: e.target.value })
              }
              placeholder="Summarize your experience..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review
            </label>
            <textarea
              value={newReview.comment}
              onChange={(e) =>
                setNewReview({ ...newReview, comment: e.target.value })
              }
              placeholder="Share your experience with this course..."
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setShowReviewForm(false);
                setEditingReviewId(null);
                setNewReview({ rating: 5, title: "", comment: "" });
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-sm"
            >
              {isCreating || isUpdating ? "Posting..." : editingReviewId ? "Update Review" : "Post Review"}
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="border-t border-gray-100 pt-4 first:border-t-0 first:pt-0">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">
                      {review.user?.name || "Anonymous"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      onReportClick(review._id, "review", review.title)
                    }
                    className="text-gray-400 hover:text-red-600 transition"
                    title="Report this review"
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Rating */}
              <div className="flex gap-0.5 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < review.rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              {/* Title and Comment */}
              <h4 className="font-medium text-gray-800 text-sm mb-1">
                {review.title}
              </h4>
              <p className="text-gray-600 text-sm mb-3">{review.comment}</p>

              {/* Helpful Buttons */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleMarkHelpful(review._id)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition"
                >
                  <ThumbsUp className="w-3 h-3" />
                  Helpful ({review.helpful})
                </button>
                <button
                  onClick={() => handleMarkUnhelpful(review._id)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 transition"
                >
                  <ThumbsUp className="w-3 h-3 rotate-180" />
                  Not helpful ({review.unhelpful})
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CourseReviews;
