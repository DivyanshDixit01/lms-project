import mongoose from "mongoose";

const appealSchema = new mongoose.Schema(
  {
    flagId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flag",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    appealReason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
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
    reviewerDecision: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Create indexes for efficient querying
appealSchema.index({ flagId: 1 });
appealSchema.index({ userId: 1 });
appealSchema.index({ status: 1 });
appealSchema.index({ createdAt: -1 });

const Appeal = mongoose.model("Appeal", appealSchema);
export default Appeal;
