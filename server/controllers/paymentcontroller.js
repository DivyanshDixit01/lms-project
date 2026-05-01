import PurchaseCourse from "../models/purchaseCoursemodel.js";

// Get all payments with filters and pagination
export const getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, courseId, userId, search } = req.query;

    // Build filter object
    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (courseId) {
      filter.courseId = courseId;
    }

    if (userId) {
      filter.userId = userId;
    }

    if (search) {
      filter.$or = [
        { paymentId: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const purchases = await PurchaseCourse.find(filter)
      .populate("userId", "name email")
      .populate("courseId", "courseTitle category coursePrice")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await PurchaseCourse.countDocuments(filter);

    // Transform purchases to match payment format
    const payments = purchases.map((purchase) => ({
      _id: purchase._id,
      transactionId: purchase.paymentId,
      amount: purchase.amount,
      status: purchase.status,
      createdAt: purchase.createdAt,
      metadata: {
        userName: purchase.userId?.name || "N/A",
        userEmail: purchase.userId?.email || "N/A",
        courseTitle: purchase.courseId?.courseTitle || "N/A",
        courseCategory: purchase.courseId?.category || "N/A",
      },
    }));

    res.status(200).json({
      success: true,
      payments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
      error: error.message,
    });
  }
};

// Get single payment details
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const purchase = await PurchaseCourse.findById(id)
      .populate("userId", "name email")
      .populate("courseId", "courseTitle coursePrice");

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.status(200).json({
      success: true,
      payment: {
        _id: purchase._id,
        transactionId: purchase.paymentId,
        amount: purchase.amount,
        status: purchase.status,
        createdAt: purchase.createdAt,
        metadata: {
          userName: purchase.userId?.name || "N/A",
          userEmail: purchase.userId?.email || "N/A",
          courseTitle: purchase.courseId?.courseTitle || "N/A",
        },
      },
    });
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment",
      error: error.message,
    });
  }
};

// Process refund
export const processRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { refundAmount, refundReason } = req.body;

    const purchase = await PurchaseCourse.findById(id);

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (purchase.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Only completed transactions can be refunded",
      });
    }

    if (refundAmount > purchase.amount) {
      return res.status(400).json({
        success: false,
        message: "Refund amount cannot exceed original transaction amount",
      });
    }

    // Update purchase with refund info
    purchase.status = "refunded";
    await purchase.save();

    res.status(200).json({
      success: true,
      message: "Refund processed successfully",
      payment: {
        _id: purchase._id,
        transactionId: purchase.paymentId,
        amount: purchase.amount,
        status: purchase.status,
        createdAt: purchase.createdAt,
      },
    });
  } catch (error) {
    console.error("Error processing refund:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process refund",
      error: error.message,
    });
  }
};

// Get revenue analytics
export const getRevenueAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, courseId } = req.query;

    const filter = { status: "completed" };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    if (courseId) {
      filter.courseId = courseId;
    }

    const purchases = await PurchaseCourse.find(filter).populate("courseId", "courseTitle");

    const totalRevenue = purchases.reduce((sum, p) => sum + p.amount, 0);
    const totalTransactions = purchases.length;
    const averageValue =
      totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // Group by course
    const byCourse = {};
    purchases.forEach((purchase) => {
      const courseId = purchase.courseId._id.toString();
      if (!byCourse[courseId]) {
        byCourse[courseId] = {
          courseId: purchase.courseId._id,
          courseTitle: purchase.courseId?.courseTitle || "N/A",
          revenue: 0,
          transactionCount: 0,
        };
      }
      byCourse[courseId].revenue += purchase.amount;
      byCourse[courseId].transactionCount += 1;
    });

    res.status(200).json({
      success: true,
      analytics: {
        totalRevenue,
        totalTransactions,
        averageValue: averageValue.toFixed(2),
        byCourse: Object.values(byCourse),
      },
    });
  } catch (error) {
    console.error("Error fetching revenue analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch revenue analytics",
      error: error.message,
    });
  }
};

// Get payment statistics
export const getPaymentStats = async (req, res) => {
  try {
    const totalPayments = await PurchaseCourse.countDocuments();
    const completedPayments = await PurchaseCourse.countDocuments({
      status: "completed",
    });
    const pendingPayments = await PurchaseCourse.countDocuments({
      status: "pending",
    });
    const failedPayments = await PurchaseCourse.countDocuments({ status: "failed" });

    // Get all purchases to calculate revenue
    const allPurchases = await PurchaseCourse.find();
    const completedTransactions = allPurchases.filter(p => p.status === "completed");
    
    const totalRevenue = allPurchases.reduce((sum, p) => sum + p.amount, 0);
    const completedRevenue = completedTransactions.reduce((sum, p) => sum + p.amount, 0);

    res.status(200).json({
      success: true,
      stats: {
        totalPayments,
        completedPayments,
        pendingPayments,
        failedPayments,
        totalRevenue: completedRevenue,
        averageValue:
          completedTransactions.length > 0
            ? (completedRevenue / completedTransactions.length).toFixed(2)
            : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching payment stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment statistics",
      error: error.message,
    });
  }
};
