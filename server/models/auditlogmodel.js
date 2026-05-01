import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: [
        "CREATE_USER",
        "UPDATE_USER",
        "DELETE_USER",
        "SUSPEND_USER",
        "APPROVE_COURSE",
        "REJECT_COURSE",
        "ARCHIVE_COURSE",
        "PROCESS_REFUND",
        "APPROVE_CONTENT",
        "REJECT_CONTENT",
      ],
      required: true,
    },
    resourceType: {
      type: String,
      enum: ["User", "Course", "Payment", "FlaggedContent"],
      required: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;
