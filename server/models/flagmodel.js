import mongoose from "mongoose";

const flagSchema = new mongoose.Schema(
  {
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    contentType: {
      type: String,
      enum: ["course_description", "review", "comment", "title"],
      required: true,
    },
    contentPreview: {
      type: String,
      required: true,
    },
    flagReason: {
      type: String,
      enum: ["inappropriate", "spam", "harassment", "copyright", "other"],
      required: true,
    },
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reporterEmail: {
      type: String,
      required: true,
    },
    reportedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reportedUserEmail: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "approved", "removed"],
      default: "pending",
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    moderationReason: {
      type: String,
      default: null,
    },
    appealStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },
    metadata: {
      courseId: mongoose.Schema.Types.ObjectId,
      courseTitle: String,
      category: String,
    },
  },
  {
    timestamps: true,
  },
);

// Create indexes for efficient querying
flagSchema.index({ status: 1 });
flagSchema.index({ createdAt: -1 });
flagSchema.index({ reportedUserId: 1 });
flagSchema.index({ contentId: 1 });
flagSchema.index({ flagReason: 1 });

const Flag = mongoose.model("Flag", flagSchema);
export default Flag;
