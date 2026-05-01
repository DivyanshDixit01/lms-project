// controllers/paymentController.js
import Razorpay from "razorpay";
import crypto from "crypto";
import PurchaseCourse from "../models/purchaseCoursemodel.js";
import Course from "../models/coursemodel.js";
import User from "../models/usermodel.js";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

// Create Razorpay Order
export const createOrder = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.id; // From auth middleware

    // Check if user is authenticated
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if course is published
    if (!course.isPublished) {
      return res.status(400).json({
        success: false,
        message: "Course is not available for purchase",
      });
    }

    // Check if user already purchased this course
    const existingPurchase = await PurchaseCourse.findOne({
      courseId,
      userId,
      status: "completed",
    });

    if (existingPurchase) {
      return res.status(400).json({
        success: false,
        message: "You have already purchased this course",
      });
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(course.coursePrice * 100), // Amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        courseId: courseId.toString(),
        userId: userId.toString(),
        courseTitle: course.courseTitle,
      },
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      message: "Order created successfully",
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_API_KEY,
        course: {
          id: course._id,
          title: course.courseTitle,
          price: course.coursePrice,
          thumbnail: course.courseThumbnail,
        },
      },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};

// Verify Payment and Complete Purchase
export const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature, courseId, amount } = req.body;
    const userId = req.id;

    // Check if user is authenticated
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Verify payment signature
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === signature;

    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    // Check if purchase already exists
    const existingPurchase = await PurchaseCourse.findOne({
      courseId,
      userId,
      status: "completed",
    });

    if (existingPurchase) {
      return res.status(400).json({
        success: false,
        message: "Course already purchased",
      });
    }

    // Create purchase record
    const purchase = await PurchaseCourse.create({
      courseId,
      userId,
      amount: amount / 100, // Convert back from paise to rupees
      status: "completed",
      paymentId,
      orderId,
    });

    // Add course to user's enrolled courses
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { enrolledCourses: courseId } },
      { new: true },
    );

    // Add user to course's enrolled students
    await Course.findByIdAndUpdate(
      courseId,
      { $addToSet: { enrolledStudents: userId } },
      { new: true },
    );

    return res.status(200).json({
      success: true,
      message: "Payment verified and course enrolled successfully",
      data: {
        purchase,
        courseId,
      },
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify payment",
      error: error.message,
    });
  }
};

// Get user's purchased courses
export const getUserPurchases = async (req, res) => {
  try {
    const userId = req.id;

    const purchases = await PurchaseCourse.find({
      userId,
      status: "completed",
    })
      .populate(
        "courseId",
        "courseTitle courseThumbnail coursePrice courseLevel category",
      )
      .sort({ purchaseDate: -1 });

    return res.status(200).json({
      success: true,
      message: "Purchases retrieved successfully",
      data: purchases,
    });
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch purchases",
      error: error.message,
    });
  }
};

// Get purchase details by course
export const checkPurchaseStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const purchase = await PurchaseCourse.findOne({
      courseId,
      userId,
      status: "completed",
    });

    return res.status(200).json({
      success: true,
      isPurchased: !!purchase,
      data: purchase,
    });
  } catch (error) {
    console.error("Error checking purchase status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to check purchase status",
      error: error.message,
    });
  }
};

// Get all purchases (admin only)
export const getAllPurchases = async (req, res) => {
  try {
    const purchases = await PurchaseCourse.find()
      .populate("courseId", "courseTitle coursePrice")
      .populate("userId", "name email")
      .sort({ purchaseDate: -1 });

    return res.status(200).json({
      success: true,
      message: "All purchases retrieved successfully",
      data: purchases,
      total: purchases.length,
      totalRevenue: purchases.reduce((sum, p) => sum + p.amount, 0),
    });
  } catch (error) {
    console.error("Error fetching all purchases:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch purchases",
      error: error.message,
    });
  }
};

// Get course purchase statistics (admin only)
export const getCoursePurchaseStats = async (req, res) => {
  try {
    const stats = await PurchaseCourse.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: "$courseId",
          totalPurchases: { $sum: 1 },
          totalRevenue: { $sum: "$amount" },
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "course",
        },
      },
      { $unwind: "$course" },
      {
        $project: {
          courseTitle: "$course.courseTitle",
          totalPurchases: 1,
          totalRevenue: 1,
        },
      },
      { $sort: { totalPurchases: -1 } },
    ]);

    return res.status(200).json({
      success: true,
      message: "Purchase statistics retrieved",
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching purchase stats:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
      error: error.message,
    });
  }
};

export default {
  createOrder,
  verifyPayment,
  getUserPurchases,
  checkPurchaseStatus,
  getAllPurchases,
  getCoursePurchaseStats,
};
