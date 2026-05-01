import mongoose from "mongoose";

const purchaseCourseSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    paymentId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const PurchaseCourse = mongoose.model("PurchaseCourse", purchaseCourseSchema);
export default PurchaseCourse;
