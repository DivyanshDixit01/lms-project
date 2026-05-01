import mongoose from "mongoose";

const userWarningSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    warningCount: {
      type: Number,
      default: 0,
    },
    warnings: [
      {
        flagId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Flag",
        },
        reason: String,
        issuedAt: {
          type: Date,
          default: Date.now,
        },
        issuedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    lastWarningAt: {
      type: Date,
      default: null,
    },
    suspensionStatus: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

// Create indexes for efficient querying
userWarningSchema.index({ userId: 1 });
userWarningSchema.index({ userEmail: 1 });
userWarningSchema.index({ suspensionStatus: 1 });

const UserWarning = mongoose.model("UserWarning", userWarningSchema);
export default UserWarning;
