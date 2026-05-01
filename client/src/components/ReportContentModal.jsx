import React, { useState } from "react";
import { X, AlertCircle, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const ReportContentModal = ({ isOpen, onClose, contentId, contentType, contentTitle }) => {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const reportReasons = [
    { value: "inappropriate", label: "Inappropriate Content" },
    { value: "spam", label: "Spam or Misleading" },
    { value: "harassment", label: "Harassment or Abuse" },
    { value: "copyright", label: "Copyright Violation" },
    { value: "other", label: "Other" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reason) {
      toast.error("Please select a reason");
      return;
    }

    if (!description.trim()) {
      toast.error("Please provide details about the issue");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/moderation/flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          contentId,
          contentType,
          flagReason: reason,
          description,
          contentTitle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          toast.error("You have already reported this content");
        } else if (response.status === 400) {
          toast.error(data.message || "Invalid report details. Please try again.");
        } else {
          toast.error(data.message || "Failed to submit report. Please try again.");
        }
        console.error("Report submission error:", data);
        return;
      }

      setSubmitted(true);
      toast.success("Report submitted successfully. Thank you!");

      setTimeout(() => {
        setSubmitted(false);
        setReason("");
        setDescription("");
        onClose();
      }, 2000);
    } catch (error) {
      toast.error("Failed to submit report. Please try again.");
      console.error("Report submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-800">Report Content</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                Report Submitted
              </h3>
              <p className="text-sm text-gray-600">
                Thank you for helping us maintain a safe community. Our team will review your report shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Content Info */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Reporting:</p>
                <p className="text-sm font-medium text-gray-800 truncate">
                  {contentTitle || "Content"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Type: {contentType}
                </p>
              </div>

              {/* Reason Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Report *
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                >
                  <option value="">Select a reason...</option>
                  {reportReasons.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Details *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide specific details about why you're reporting this content..."
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {description.length}/500 characters
                </p>
              </div>

              {/* Info Box */}
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> False reports may result in account restrictions. Please only report genuine violations.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium text-sm"
                >
                  {isSubmitting ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportContentModal;
