import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      unique: true,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "USD",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentGateway: {
      type: String,
      enum: ["stripe", "paypal"],
      required: true,
    },
    gatewayTransactionId: {
      type: String,
      required: true,
    },
    refundedAt: {
      type: Date,
      default: null,
    },
    refundReason: {
      type: String,
      default: null,
    },
    refundAmount: {
      type: Number,
      default: null,
    },
    metadata: {
      userEmail: String,
      userName: String,
      courseTitle: String,
      courseCategory: String,
    },
  },
  {
    timestamps: true,
  },
);

// Create indexes for efficient querying
paymentSchema.index({ userId: 1 });
paymentSchema.index({ courseId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ transactionId: 1 });

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
