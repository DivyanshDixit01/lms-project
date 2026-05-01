import Flag from "../models/flagmodel.js";
import Appeal from "../models/appealmodel.js";
import UserWarning from "../models/userwarningmodel.js";
import User from "../models/usermodel.js";
import Course from "../models/coursemodel.js";

// Create flag (user reports content)
export const createFlag = async (req, res) => {
  try {
    const { contentId, contentType, flagReason, description, contentTitle } = req.body;
    const reporterId = req.user?._id;
    const reporterEmail = req.user?.email;

    console.log("Creating flag with:", { contentId, contentType, flagReason, reporterId, reporterEmail });

    if (!contentId || !contentType || !flagReason || !description) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Check if user already reported this content
    const existingFlag = await Flag.findOne({
      contentId,
      reporterId,
    });

    if (existingFlag) {
      return res.status(409).json({
        success: false,
        message: "You have already reported this content",
      });
    }

    // Get the content owner based on content type
    let reportedUserId = null;
    let reportedUserEmail = null;

    if (contentType === "course_description" || contentType === "title") {
      // For course content, get the course creator
      const course = await Course.findById(contentId).populate("creator");
      console.log("Found course:", course);
      
      if (course && course.creator) {
        reportedUserId = course.creator._id;
        reportedUserEmail = course.creator.email;
      } else {
        console.log("Course not found or no creator:", { course, contentId });
      }
    } else if (contentType === "review" || contentType === "comment") {
      // For reviews/comments, use the current user as a fallback
      // This is a temporary solution - ideally you'd have Review/Comment models
      reportedUserId = reporterId;
      reportedUserEmail = reporterEmail;
    }

    if (!reportedUserId || !reportedUserEmail) {
      console.log("Could not identify content owner:", { reportedUserId, reportedUserEmail });
      return res.status(400).json({
        success: false,
        message: "Could not identify content owner. Please ensure the content exists.",
      });
    }

    const flag = new Flag({
      contentId,
      contentType,
      flagReason,
      contentPreview: description,
      reporterId,
      reporterEmail,
      reportedUserId,
      reportedUserEmail,
      status: "pending",
      metadata: {
        courseId: contentType === "course_description" || contentType === "title" ? contentId : null,
        courseTitle: contentTitle,
      },
    });

    await flag.save();

    res.status(201).json({
      success: true,
      message: "Content reported successfully",
      flag,
    });
  } catch (error) {
    console.error("Error creating flag:", error);
    res.status(500).json({
      success: false,
      message: "Failed to report content",
      error: error.message,
    });
  }
};

// Get all flagged content with filters
export const getAllFlags = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      reason,
      contentType,
      search,
    } = req.query;

    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (reason && reason !== "all") {
      filter.flagReason = reason;
    }

    if (contentType && contentType !== "all") {
      filter.contentType = contentType;
    }

    if (search) {
      filter.$or = [
        { contentPreview: { $regex: search, $options: "i" } },
        { reportedUserEmail: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const flags = await Flag.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Flag.countDocuments(filter);

    res.status(200).json({
      success: true,
      flags,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching flags:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch flagged content",
      error: error.message,
    });
  }
};

// Get flag details
export const getFlagById = async (req, res) => {
  try {
    const { id } = req.params;

    const flag = await Flag.findById(id);

    if (!flag) {
      return res.status(404).json({
        success: false,
        message: "Flag not found",
      });
    }

    res.status(200).json({
      success: true,
      flag,
    });
  } catch (error) {
    console.error("Error fetching flag:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch flag",
      error: error.message,
    });
  }
};

// Approve flagged content
export const approveFlag = async (req, res) => {
  try {
    const { id } = req.params;
    const { moderationReason } = req.body;
    const adminId = req.user?._id;

    const flag = await Flag.findById(id);

    if (!flag) {
      return res.status(404).json({
        success: false,
        message: "Flag not found",
      });
    }

    flag.status = "approved";
    flag.reviewedAt = new Date();
    flag.reviewedBy = adminId;
    flag.moderationReason = moderationReason;

    await flag.save();

    res.status(200).json({
      success: true,
      message: "Content approved successfully",
      flag,
    });
  } catch (error) {
    console.error("Error approving flag:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve content",
      error: error.message,
    });
  }
};

// Remove flagged content
export const removeFlag = async (req, res) => {
  try {
    const { id } = req.params;
    const { moderationReason } = req.body;
    const adminId = req.user?._id;

    const flag = await Flag.findById(id);

    if (!flag) {
      return res.status(404).json({
        success: false,
        message: "Flag not found",
      });
    }

    flag.status = "removed";
    flag.reviewedAt = new Date();
    flag.reviewedBy = adminId;
    flag.moderationReason = moderationReason;

    await flag.save();

    res.status(200).json({
      success: true,
      message: "Content removed successfully",
      flag,
    });
  } catch (error) {
    console.error("Error removing flag:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove content",
      error: error.message,
    });
  }
};

// Warn user
export const warnUser = async (req, res) => {
  try {
    const { flagId } = req.body;
    const adminId = req.user?._id;

    const flag = await Flag.findById(flagId);

    if (!flag) {
      return res.status(404).json({
        success: false,
        message: "Flag not found",
      });
    }

    let userWarning = await UserWarning.findOne({
      userId: flag.reportedUserId,
    });

    if (!userWarning) {
      userWarning = new UserWarning({
        userId: flag.reportedUserId,
        userEmail: flag.reportedUserEmail,
        warningCount: 0,
        warnings: [],
      });
    }

    userWarning.warnings.push({
      flagId: flag._id,
      reason: flag.flagReason,
      issuedAt: new Date(),
      issuedBy: adminId,
    });

    userWarning.warningCount = userWarning.warnings.length;
    userWarning.lastWarningAt = new Date();

    if (userWarning.warningCount >= 3) {
      userWarning.suspensionStatus = "suspended";
    }

    await userWarning.save();

    res.status(200).json({
      success: true,
      message: "User warned successfully",
      userWarning,
    });
  } catch (error) {
    console.error("Error warning user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to warn user",
      error: error.message,
    });
  }
};

// Get moderation history
export const getModerationHistory = async (req, res) => {
  try {
    const { userId, contentId, page = 1, limit = 10 } = req.query;

    const filter = {};

    if (userId) {
      filter.reportedUserId = userId;
    }

    if (contentId) {
      filter.contentId = contentId;
    }

    const skip = (page - 1) * limit;

    const history = await Flag.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Flag.countDocuments(filter);

    res.status(200).json({
      success: true,
      history,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching moderation history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch moderation history",
      error: error.message,
    });
  }
};

// Get moderation stats
export const getModerationStats = async (req, res) => {
  try {
    const pending = await Flag.countDocuments({ status: "pending" });
    const reviewed = await Flag.countDocuments({ status: "reviewed" });
    const approved = await Flag.countDocuments({ status: "approved" });
    const removed = await Flag.countDocuments({ status: "removed" });

    res.status(200).json({
      success: true,
      stats: {
        pending,
        reviewed,
        approved,
        removed,
        total: pending + reviewed + approved + removed,
      },
    });
  } catch (error) {
    console.error("Error fetching moderation stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch moderation statistics",
      error: error.message,
    });
  }
};

// Create appeal
export const createAppeal = async (req, res) => {
  try {
    const { flagId, appealReason } = req.body;
    const userId = req.user?._id;

    const flag = await Flag.findById(flagId);

    if (!flag) {
      return res.status(404).json({
        success: false,
        message: "Flag not found",
      });
    }

    if (flag.status !== "removed") {
      return res.status(400).json({
        success: false,
        message: "Appeals only available for removed content",
      });
    }

    const appeal = new Appeal({
      flagId,
      userId,
      userEmail: flag.reportedUserEmail,
      appealReason,
    });

    await appeal.save();

    flag.appealStatus = "pending";
    await flag.save();

    res.status(201).json({
      success: true,
      message: "Appeal submitted successfully",
      appeal,
    });
  } catch (error) {
    console.error("Error creating appeal:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create appeal",
      error: error.message,
    });
  }
};

// Get appeals
export const getAppeals = async (req, res) => {
  try {
    const { status = "pending", page = 1, limit = 10 } = req.query;

    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const appeals = await Appeal.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Appeal.countDocuments(filter);

    res.status(200).json({
      success: true,
      appeals,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching appeals:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch appeals",
      error: error.message,
    });
  }
};
