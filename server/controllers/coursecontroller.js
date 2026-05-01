// controllers/courseController.js
import Course from "../models/coursemodel.js";
import Lecture from "../models/lecturemodel.js";

// Helper function to convert duration string to seconds
const convertDurationToSeconds = (duration) => {
  if (!duration) return 0;

  // If it's already a number, return it
  if (typeof duration === "number") return duration;

  // If it's a string like "0:02" or "10:30" or "1:25:45"
  if (typeof duration === "string") {
    // Remove any extra spaces
    duration = duration.trim();

    // Check if it's just a number (e.g., "120")
    if (/^\d+$/.test(duration)) {
      return parseInt(duration);
    }

    const parts = duration.split(":").map(Number);

    if (parts.length === 2) {
      // MM:SS format
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      // HH:MM:SS format
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
  }

  return 0;
};

export const createCourse = async (req, res) => {
  try {
    const {
      courseTitle,
      subTitle,
      description,
      category,
      courseLevel,
      coursePrice,
    } = req.body;

    // Validate required fields
    if (!courseTitle || !category || !courseLevel || !coursePrice) {
      return res.status(400).json({
        message:
          "Course title, category, course level, and price are required fields",
      });
    }

    // Handle file upload if there's a thumbnail
    let courseThumbnail = null;
    if (req.file) {
      courseThumbnail = `/uploads/${req.file.filename}`;
    }

    // Check if user is authenticated (req.id should be set by auth middleware)
    if (!req.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const course = await Course.create({
      courseTitle,
      subTitle: subTitle || "",
      description: description || "",
      category,
      courseLevel,
      coursePrice: Number(coursePrice),
      courseThumbnail,
      creator: req.id,
      isPublished: false,
      enrolledStudents: [],
      lectures: [],
    });

    return res.status(201).json({
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    console.error("Error creating course:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getAllAdminCourses = async (req, res) => {
  try {
    const userId = req.id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    const courses = await Course.find({ creator: userId });
    if (!courses) {
      return res
        .status(404)
        .json({ course: [], message: "No courses found for this admin" });
    }
    return res.status(200).json({
      message: "Admin courses retrieved successfully",
      courses,
    });
  } catch (error) {
    console.error("Error fetching admin courses:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get a single course by ID for admin
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is authenticated
    if (!req.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Find the course and check if it belongs to the authenticated user
    const course = await Course.findOne({ _id: id, creator: req.id }).populate({
      path: "lectures",
      model: "Lecture",
      select:
        "lectureTitle description videoUrl publicId duration order isPreviewFree createdAt",
      options: { sort: { order: 1, createdAt: 1 } },
    });

    if (!course) {
      return res.status(404).json({
        message: "Course not found or you don't have permission to view it",
      });
    }

    console.log(`Admin fetching course: ${course.courseTitle}`);
    console.log(`Lectures count: ${course.lectures?.length || 0}`);

    return res.status(200).json({
      message: "Course retrieved successfully",
      course,
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const editCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      courseTitle,
      subTitle,
      description,
      category,
      courseLevel,
      coursePrice,
      isPublished,
      sections,
    } = req.body;

    // Check if user is authenticated
    if (!req.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Find the course and check if it belongs to the authenticated user
    const existingCourse = await Course.findOne({ _id: id, creator: req.id });

    if (!existingCourse) {
      return res.status(404).json({
        message: "Course not found or you don't have permission to edit it",
      });
    }

    // Handle file upload if there's a new thumbnail
    let courseThumbnail = existingCourse.courseThumbnail;
    if (req.file) {
      courseThumbnail = `/uploads/${req.file.filename}`;
    }

    // Prepare update data
    const updateData = {
      courseTitle: courseTitle || existingCourse.courseTitle,
      subTitle: subTitle !== undefined ? subTitle : existingCourse.subTitle,
      description:
        description !== undefined ? description : existingCourse.description,
      category: category || existingCourse.category,
      courseLevel: courseLevel || existingCourse.courseLevel,
      coursePrice: coursePrice
        ? Number(coursePrice)
        : existingCourse.coursePrice,
      courseThumbnail,
      isPublished:
        isPublished !== undefined ? isPublished : existingCourse.isPublished,
    };

    // Handle sections if provided
    if (sections !== undefined) {
      let parsedSections = sections;
      if (typeof sections === "string") {
        try {
          parsedSections = JSON.parse(sections);
        } catch (err) {
          return res.status(400).json({ message: "Invalid sections format" });
        }
      }
      updateData.sections = parsedSections;
    }

    // Update the course
    const updatedCourse = await Course.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      message: "Course updated successfully",
      course: updatedCourse,
    });
  } catch (error) {
    console.error("Error editing course:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete course function
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is authenticated
    if (!req.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Find the course and check if it belongs to the authenticated user
    const course = await Course.findOne({ _id: id, creator: req.id });

    if (!course) {
      return res.status(404).json({
        message: "Course not found or you don't have permission to delete it",
      });
    }

    // Delete all lectures associated with this course
    await Lecture.deleteMany({ course: id });

    // Delete the course
    await Course.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Create a new lecture - UPDATED with duration conversion and adding to course
export const createLecture = async (req, res) => {
  try {
    const { courseId } = req.params;
    const {
      lectureTitle,
      description,
      videoUrl,
      publicId,
      duration,
      order,
      isPreviewFree,
      videoDuration,
    } = req.body;

    console.log("Creating lecture with data:", {
      lectureTitle,
      description,
      videoUrl,
      publicId,
      duration,
      videoDuration,
      order,
      isPreviewFree,
    });

    // Validate required fields
    if (!lectureTitle || !description || !videoUrl) {
      return res.status(400).json({
        message:
          "Lecture title, description, and video URL are required fields",
      });
    }

    // Check if user is authenticated
    if (!req.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Find the course and check if it belongs to the authenticated user
    const course = await Course.findOne({ _id: courseId, creator: req.id });

    if (!course) {
      return res.status(404).json({
        message:
          "Course not found or you don't have permission to add lectures to it",
      });
    }

    // Convert duration to seconds (handle both string and number)
    let durationInSeconds = 0;

    if (videoDuration !== undefined && videoDuration !== null) {
      durationInSeconds = convertDurationToSeconds(videoDuration);
    } else if (duration !== undefined && duration !== null) {
      durationInSeconds = convertDurationToSeconds(duration);
    }

    console.log("Duration converted to seconds:", durationInSeconds);

    // Get the highest order value for this course if order not specified
    let lectureOrder = order;
    if (!lectureOrder && lectureOrder !== 0) {
      const lastLecture = await Lecture.findOne({ course: courseId }).sort({
        order: -1,
      });
      lectureOrder = lastLecture ? lastLecture.order + 1 : 0;
    }

    // Create the lecture
    const lecture = await Lecture.create({
      lectureTitle,
      description,
      videoUrl,
      publicId: publicId || "",
      duration: durationInSeconds,
      order: lectureOrder,
      isPreviewFree: isPreviewFree || false,
      course: courseId,
    });

    // IMPORTANT: Add the lecture ID to the course's lectures array
    await Course.findByIdAndUpdate(
      courseId,
      { $push: { lectures: lecture._id } },
      { new: true },
    );

    console.log(
      `Lecture created and added to course. Lecture ID: ${lecture._id}`,
    );
    console.log(`Lecture title: ${lecture.lectureTitle}`);

    return res.status(201).json({
      message: "Lecture created successfully",
      lecture,
    });
  } catch (error) {
    console.error("Error creating lecture:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all lectures for a specific course
export const getLecturesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check if user is authenticated
    if (!req.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Find the course and check if it belongs to the authenticated user
    const course = await Course.findOne({ _id: courseId, creator: req.id });

    if (!course) {
      return res.status(404).json({
        message:
          "Course not found or you don't have permission to view its lectures",
      });
    }

    // Get all lectures for this course, sorted by order
    const lectures = await Lecture.find({ course: courseId }).sort({
      order: 1,
      createdAt: 1,
    });

    return res.status(200).json({
      message: "Lectures retrieved successfully",
      lectures,
      totalLectures: lectures.length,
    });
  } catch (error) {
    console.error("Error fetching lectures:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get a single lecture by ID
export const getLectureById = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;

    // Check if user is authenticated
    if (!req.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Find the course and check if it belongs to the authenticated user
    const course = await Course.findOne({ _id: courseId, creator: req.id });

    if (!course) {
      return res.status(404).json({
        message:
          "Course not found or you don't have permission to view its lectures",
      });
    }

    // Find the lecture
    const lecture = await Lecture.findOne({ _id: lectureId, course: courseId });

    if (!lecture) {
      return res.status(404).json({
        message: "Lecture not found",
      });
    }

    return res.status(200).json({
      message: "Lecture retrieved successfully",
      lecture,
    });
  } catch (error) {
    console.error("Error fetching lecture:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update a lecture
export const updateLecture = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const {
      lectureTitle,
      description,
      videoUrl,
      publicId,
      duration,
      order,
      isPreviewFree,
      videoDuration,
    } = req.body;

    // Check if user is authenticated
    if (!req.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Find the course and check if it belongs to the authenticated user
    const course = await Course.findOne({ _id: courseId, creator: req.id });

    if (!course) {
      return res.status(404).json({
        message:
          "Course not found or you don't have permission to update its lectures",
      });
    }

    // Find the lecture
    const existingLecture = await Lecture.findOne({
      _id: lectureId,
      course: courseId,
    });

    if (!existingLecture) {
      return res.status(404).json({
        message: "Lecture not found",
      });
    }

    // Convert duration to seconds
    let durationInSeconds = existingLecture.duration;
    if (videoDuration !== undefined && videoDuration !== null) {
      durationInSeconds = convertDurationToSeconds(videoDuration);
    } else if (duration !== undefined && duration !== null) {
      durationInSeconds = convertDurationToSeconds(duration);
    }

    // Prepare update data
    const updateData = {
      lectureTitle: lectureTitle || existingLecture.lectureTitle,
      description: description || existingLecture.description,
      videoUrl: videoUrl || existingLecture.videoUrl,
      publicId: publicId !== undefined ? publicId : existingLecture.publicId,
      duration: durationInSeconds,
      order: order !== undefined ? order : existingLecture.order,
      isPreviewFree:
        isPreviewFree !== undefined
          ? isPreviewFree
          : existingLecture.isPreviewFree,
    };

    // Update the lecture
    const updatedLecture = await Lecture.findByIdAndUpdate(
      lectureId,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    );

    return res.status(200).json({
      message: "Lecture updated successfully",
      lecture: updatedLecture,
    });
  } catch (error) {
    console.error("Error updating lecture:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete a lecture - UPDATED to remove from course's lectures array
export const deleteLecture = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;

    // Check if user is authenticated
    if (!req.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Find the course and check if it belongs to the authenticated user
    const course = await Course.findOne({ _id: courseId, creator: req.id });

    if (!course) {
      return res.status(404).json({
        message:
          "Course not found or you don't have permission to delete its lectures",
      });
    }

    // Find and delete the lecture
    const lecture = await Lecture.findOneAndDelete({
      _id: lectureId,
      course: courseId,
    });

    if (!lecture) {
      return res.status(404).json({
        message: "Lecture not found",
      });
    }

    // Remove the lecture ID from the course's lectures array
    await Course.findByIdAndUpdate(
      courseId,
      { $pull: { lectures: lectureId } },
      { new: true },
    );

    console.log(
      `Lecture deleted and removed from course. Lecture ID: ${lectureId}`,
    );

    return res.status(200).json({
      message: "Lecture deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting lecture:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Reorder lectures (bulk update order)
export const reorderLectures = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { lectureOrders } = req.body;

    // Check if user is authenticated
    if (!req.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Find the course and check if it belongs to the authenticated user
    const course = await Course.findOne({ _id: courseId, creator: req.id });

    if (!course) {
      return res.status(404).json({
        message:
          "Course not found or you don't have permission to reorder its lectures",
      });
    }

    // Update each lecture's order
    const updatePromises = lectureOrders.map(({ id, order }) => {
      return Lecture.findByIdAndUpdate(id, { order }, { new: true });
    });

    await Promise.all(updatePromises);

    return res.status(200).json({
      message: "Lectures reordered successfully",
    });
  } catch (error) {
    console.error("Error reordering lectures:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get preview free lectures for a course (for students who haven't purchased)
export const getPreviewLectures = async (req, res) => {
  try {
    const { courseId } = req.params;

    const lectures = await Lecture.find({
      course: courseId,
      isPreviewFree: true,
    }).sort({ order: 1 });

    return res.status(200).json({
      message: "Preview lectures retrieved successfully",
      lectures,
    });
  } catch (error) {
    console.error("Error fetching preview lectures:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get public course by ID (for students - no authentication)
export const getPublicCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Fetching public course with ID:", id);

    // Find the course (public access - no authentication needed)
    // Only return published courses
    const course = await Course.findOne({ _id: id, isPublished: true })
      .populate({
        path: "lectures",
        model: "Lecture",
        select:
          "lectureTitle description videoUrl duration order isPreviewFree createdAt",
        options: { sort: { order: 1, createdAt: 1 } },
      })
      .populate("creator", "name email");

    if (!course) {
      console.log("Course not found or not published");
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    console.log(`Found course: ${course.courseTitle}`);
    console.log(`Lectures count: ${course.lectures?.length || 0}`);

    if (course.lectures && course.lectures.length > 0) {
      console.log("Lectures:");
      course.lectures.forEach((lecture, index) => {
        console.log(
          `  ${index + 1}. ${lecture.lectureTitle} (Preview: ${lecture.isPreviewFree})`,
        );
      });
    }

    return res.status(200).json({
      success: true,
      message: "Course retrieved successfully",
      course,
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all published courses (for students)
export const getAllPublishedCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .populate("creator", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Published courses retrieved successfully",
      courses,
      totalCourses: courses.length,
    });
  } catch (error) {
    console.error("Error fetching published courses:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export default {
  createCourse,
  getAllAdminCourses,
  getCourseById,
  editCourse,
  deleteCourse,
  createLecture,
  getLecturesByCourse,
  getLectureById,
  updateLecture,
  deleteLecture,
  reorderLectures,
  getPreviewLectures,
  getPublicCourseById,
  getAllPublishedCourses,
};
