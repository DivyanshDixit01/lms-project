// controllers/courseProgressController.js
import CourseProgress from "../models/courseProgressmodel.js";
import Course from "../models/coursemodel.js";
import Lecture from "../models/lecturemodel.js";

// Get or create course progress for a user
export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Check if user is enrolled in the course
    const course = await Course.findOne({
      _id: courseId,
      enrolledStudents: userId,
    });
    if (!course) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course",
      });
    }

    // Get or create progress
    let progress = await CourseProgress.findOne({ userId, courseId });

    if (!progress) {
      const lectures = await Lecture.find({ course: courseId }).sort({
        order: 1,
      });
      progress = await CourseProgress.initializeProgress(
        userId,
        courseId,
        lectures,
      );
    }

    // Get total lectures count
    const totalLectures = await Lecture.countDocuments({ course: courseId });

    // Calculate progress percentage
    progress.calculateProgress(totalLectures);
    await progress.save();

    // Populate lecture progress with lecture details
    const populatedProgress = await CourseProgress.findById(progress._id)
      .populate({
        path: "lectureProgress.lectureId",
        select: "lectureTitle description duration order videoUrl",
      })
      .populate("lastWatchedLecture", "lectureTitle");

    return res.status(200).json({
      success: true,
      message: "Course progress retrieved",
      data: populatedProgress,
      totalLectures,
    });
  } catch (error) {
    console.error("Error getting course progress:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get course progress",
      error: error.message,
    });
  }
};

// Mark a lecture as completed
export const markLectureComplete = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const userId = req.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    let progress = await CourseProgress.findOne({ userId, courseId });

    if (!progress) {
      const lectures = await Lecture.find({ course: courseId });
      progress = await CourseProgress.initializeProgress(
        userId,
        courseId,
        lectures,
      );
    }

    await progress.markLectureComplete(lectureId);

    const totalLectures = await Lecture.countDocuments({ course: courseId });
    progress.calculateProgress(totalLectures);
    await progress.save();

    return res.status(200).json({
      success: true,
      message: "Lecture marked as completed",
      data: {
        completed: progress.completed,
        progressPercentage: progress.progressPercentage,
      },
    });
  } catch (error) {
    console.error("Error marking lecture complete:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to mark lecture as complete",
      error: error.message,
    });
  }
};

// Update lecture watch time and position
export const updateLectureProgress = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const { watchTime, position } = req.body;
    const userId = req.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    let progress = await CourseProgress.findOne({ userId, courseId });

    if (!progress) {
      const lectures = await Lecture.find({ course: courseId });
      progress = await CourseProgress.initializeProgress(
        userId,
        courseId,
        lectures,
      );
    }

    if (watchTime) {
      await progress.updateWatchTime(lectureId, watchTime);
    }

    if (position !== undefined) {
      await progress.updateLastPosition(lectureId, position);
    }

    await progress.save();

    return res.status(200).json({
      success: true,
      message: "Lecture progress updated",
      data: {
        lastPosition: position,
        totalWatchTime: progress.totalWatchTime,
      },
    });
  } catch (error) {
    console.error("Error updating lecture progress:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update lecture progress",
      error: error.message,
    });
  }
};

// Get user's overall progress across all courses
export const getUserOverallProgress = async (req, res) => {
  try {
    const userId = req.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const overallProgress = await CourseProgress.getUserOverallProgress(userId);

    return res.status(200).json({
      success: true,
      message: "Overall progress retrieved",
      data: overallProgress,
    });
  } catch (error) {
    console.error("Error getting overall progress:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get overall progress",
      error: error.message,
    });
  }
};

export default {
  getCourseProgress,
  markLectureComplete,
  updateLectureProgress,
  getUserOverallProgress,
};
