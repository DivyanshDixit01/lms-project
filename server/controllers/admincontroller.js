import User from "../models/usermodel.js";
import Course from "../models/coursemodel.js";
import PurchaseCourse from "../models/purchaseCoursemodel.js";
import AuditLog from "../models/auditlogmodel.js";
import Flag from "../models/flagmodel.js";

// ============ USER MANAGEMENT ============

// Get all users with pagination and search
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", role = "", status = "" } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by role
    if (role) {
      query.role = role;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    console.log("Getting users with query:", query);

    const users = await User.find(query)
      .select("-password")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    console.log("Found users:", users.length);

    res.status(200).json({
      success: true,
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single user details
export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId)
      .select("-password")
      .populate("enrolledCourses", "title");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Get user's purchased courses
    const purchasedCourses = await PurchaseCourse.find({ userId }).populate(
      "courseId",
      "title price"
    );

    // Get user's activity logs
    const activityLogs = await AuditLog.find({ userId }).sort({ createdAt: -1 }).limit(20);

    res.status(200).json({
      success: true,
      user,
      purchasedCourses,
      activityLogs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new user
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      password,
      role,
      status: "active",
    });

    await newUser.save();

    // Log admin action
    await AuditLog.create({
      adminId: req.user._id,
      action: "CREATE_USER",
      resourceType: "User",
      resourceId: newUser._id,
      details: { name, email, role },
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, role, status } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if new email is unique
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: "Email already exists" });
      }
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (status) user.status = status;

    await user.save();

    // Log admin action
    await AuditLog.create({
      adminId: req.user._id,
      action: "UPDATE_USER",
      resourceType: "User",
      resourceId: userId,
      details: { name, email, role, status },
    });

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Suspend user
export const suspendUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { status: "suspended" },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Log admin action
    await AuditLog.create({
      adminId: req.user._id,
      action: "SUSPEND_USER",
      resourceType: "User",
      resourceId: userId,
      details: { reason: req.body.reason || "No reason provided" },
    });

    res.status(200).json({
      success: true,
      message: "User suspended successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete user (soft delete)
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { status: "inactive" },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Log admin action
    await AuditLog.create({
      adminId: req.user._id,
      action: "DELETE_USER",
      resourceType: "User",
      resourceId: userId,
      details: { reason: req.body.reason || "No reason provided" },
    });

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ COURSE MANAGEMENT ============

// Get all courses with pagination and search
export const getAllCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status = "", category = "" } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (search) {
      query.courseTitle = { $regex: search, $options: "i" };
    }

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    console.log("Getting courses with query:", query);

    const courses = await Course.find(query)
      .populate("creator", "name email")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Course.countDocuments(query);

    console.log("Found courses:", courses.length);

    // Get enrollment count for each course
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        const enrollmentCount = await PurchaseCourse.countDocuments({
          courseId: course._id,
        });
        return {
          ...course.toObject(),
          enrollmentCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      courses: coursesWithStats,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error getting courses:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get course details
export const getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId).populate("creator", "name email");

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Get enrolled students
    const enrolledStudents = await PurchaseCourse.find({ courseId }).populate(
      "userId",
      "name email"
    );

    res.status(200).json({
      success: true,
      course,
      enrolledStudents,
      enrollmentCount: enrolledStudents.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve course
export const approveCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findByIdAndUpdate(
      courseId,
      { status: "published" },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Log admin action
    await AuditLog.create({
      adminId: req.user._id,
      action: "APPROVE_COURSE",
      resourceType: "Course",
      resourceId: courseId,
      details: { courseTitle: course.courseTitle },
    });

    res.status(200).json({
      success: true,
      message: "Course approved successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reject course
export const rejectCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { reason } = req.body;

    const course = await Course.findByIdAndUpdate(
      courseId,
      { status: "draft", rejectionReason: reason },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Log admin action
    await AuditLog.create({
      adminId: req.user._id,
      action: "REJECT_COURSE",
      resourceType: "Course",
      resourceId: courseId,
      details: { courseTitle: course.courseTitle, reason },
    });

    res.status(200).json({
      success: true,
      message: "Course rejected successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Archive course
export const archiveCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findByIdAndUpdate(
      courseId,
      { status: "archived" },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Log admin action
    await AuditLog.create({
      adminId: req.user._id,
      action: "ARCHIVE_COURSE",
      resourceType: "Course",
      resourceId: courseId,
      details: { courseTitle: course.courseTitle },
    });

    res.status(200).json({
      success: true,
      message: "Course archived successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ PAYMENT MANAGEMENT ============

// Get all payments with pagination and search
export const getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status = "", startDate = "", endDate = "" } =
      req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: "i" } },
        { "userId.email": { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    console.log("Getting payments with query:", query);

    const payments = await PurchaseCourse.find(query)
      .populate("userId", "name email")
      .populate("courseId", "courseTitle price")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await PurchaseCourse.countDocuments(query);

    console.log("Found payments:", payments.length);

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
    console.error("Error getting payments:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get payment details
export const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await PurchaseCourse.findById(paymentId)
      .populate("userId", "name email")
      .populate("courseId", "courseTitle price");

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Process refund
export const processRefund = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;

    const payment = await PurchaseCourse.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    if (payment.status === "refunded") {
      return res.status(400).json({ success: false, message: "Payment already refunded" });
    }

    // Update payment status
    payment.status = "refunded";
    payment.refundReason = reason;
    payment.refundDate = new Date();
    await payment.save();

    // Remove course access from user
    await User.findByIdAndUpdate(payment.userId, {
      $pull: { enrolledCourses: payment.courseId },
    });

    // Log admin action
    await AuditLog.create({
      adminId: req.user._id,
      action: "PROCESS_REFUND",
      resourceType: "Payment",
      resourceId: paymentId,
      details: { reason, amount: payment.amount },
    });

    res.status(200).json({
      success: true,
      message: "Refund processed successfully",
      payment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ ANALYTICS ============

// Get dashboard analytics
export const getDashboardAnalytics = async (req, res) => {
  try {
    console.log("Getting dashboard analytics...");
    
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: "active" });
    const totalCourses = await Course.countDocuments();
    const totalRevenue = await PurchaseCourse.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const completionRate = await PurchaseCourse.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, count: { $sum: 1 } } },
    ]);

    console.log("Analytics data:", {
      totalUsers,
      activeUsers,
      totalCourses,
      totalRevenue: totalRevenue[0]?.total || 0,
      completionRate: completionRate[0]?.count || 0,
    });

    res.status(200).json({
      success: true,
      analytics: {
        totalUsers,
        activeUsers,
        totalCourses,
        totalRevenue: totalRevenue[0]?.total || 0,
        completionRate: completionRate[0]?.count || 0,
      },
    });
  } catch (error) {
    console.error("Error getting analytics:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user analytics
export const getUserAnalytics = async (req, res) => {
  try {
    const usersByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 30 },
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        usersByRole,
        userGrowth,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get course analytics
export const getCourseAnalytics = async (req, res) => {
  try {
    const courseStats = await Course.aggregate([
      {
        $lookup: {
          from: "purchasecourses",
          localField: "_id",
          foreignField: "courseId",
          as: "enrollments",
        },
      },
      {
        $project: {
          courseTitle: 1,
          enrollmentCount: { $size: "$enrollments" },
          price: 1,
          rating: 1,
        },
      },
      { $sort: { enrollmentCount: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        courseStats,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get revenue analytics
export const getRevenueAnalytics = async (req, res) => {
  try {
    const revenueByDate = await PurchaseCourse.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 30 },
    ]);

    const revenueByPaymentMethod = await PurchaseCourse.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: "$paymentMethod",
          revenue: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        revenueByDate,
        revenueByPaymentMethod,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ CONTENT MODERATION ============

// Get flagged content
export const getFlaggedContent = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = "", contentType = "" } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (contentType) {
      query.contentType = contentType;
    }

    const flaggedContent = await Flag.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Flag.countDocuments(query);

    res.status(200).json({
      success: true,
      flaggedContent,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve flagged content
export const approveFlaggedContent = async (req, res) => {
  try {
    const { contentId } = req.params;

    const flaggedContent = await Flag.findByIdAndUpdate(
      contentId,
      { status: "approved" },
      { new: true }
    );

    if (!flaggedContent) {
      return res.status(404).json({ success: false, message: "Content not found" });
    }

    // Log admin action
    await AuditLog.create({
      adminId: req.user._id,
      action: "APPROVE_CONTENT",
      resourceType: "Flag",
      resourceId: contentId,
      details: { contentType: flaggedContent.contentType },
    });

    res.status(200).json({
      success: true,
      message: "Content approved successfully",
      flaggedContent,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reject flagged content
export const rejectFlaggedContent = async (req, res) => {
  try {
    const { contentId } = req.params;
    const { reason } = req.body;

    const flaggedContent = await Flag.findByIdAndUpdate(
      contentId,
      { status: "removed", moderationReason: reason },
      { new: true }
    );

    if (!flaggedContent) {
      return res.status(404).json({ success: false, message: "Content not found" });
    }

    // Log admin action
    await AuditLog.create({
      adminId: req.user._id,
      action: "REJECT_CONTENT",
      resourceType: "Flag",
      resourceId: contentId,
      details: { contentType: flaggedContent.contentType, reason },
    });

    res.status(200).json({
      success: true,
      message: "Content rejected successfully",
      flaggedContent,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get moderation statistics
export const getModerationStats = async (req, res) => {
  try {
    const totalFlagged = await Flag.countDocuments();
    const pendingFlagged = await Flag.countDocuments({ status: "pending" });
    const approvedFlagged = await Flag.countDocuments({ status: "approved" });
    const removedFlagged = await Flag.countDocuments({ status: "removed" });

    const flagsByType = await Flag.aggregate([
      { $group: { _id: "$contentType", count: { $sum: 1 } } },
    ]);

    const flagsByReason = await Flag.aggregate([
      { $group: { _id: "$flagReason", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalFlagged,
        pendingFlagged,
        approvedFlagged,
        removedFlagged,
        flagsByType,
        flagsByReason,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get audit logs
export const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, adminId = "", action = "" } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (adminId) {
      query.adminId = adminId;
    }

    if (action) {
      query.action = action;
    }

    const logs = await AuditLog.find(query)
      .populate("adminId", "name email")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await AuditLog.countDocuments(query);

    res.status(200).json({
      success: true,
      logs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
