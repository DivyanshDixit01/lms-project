// routes/courseroute.js
import express from "express";
import {
  createCourse,
  getAllAdminCourses,
  getCourseById,
  editCourse,
  deleteCourse,
  createLecture,
  getLecturesByCourse,
  getLectureById,
  updateLecture,
  getPublicCourseById,
  getAllPublishedCourses,
  deleteLecture,
  reorderLectures,
  getPreviewLectures,
} from "../controllers/coursecontroller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import multer from "multer";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// ==================== PUBLIC ROUTES (NO AUTHENTICATION) ====================
// These MUST come BEFORE parameterized routes

// Get all published courses (public access)
router.get("/published", getAllPublishedCourses);

// Get public course details by ID (public access) - IMPORTANT: This must be BEFORE /:id
router.get("/public/:id", getPublicCourseById);

// Get preview lectures for a course (public access)
router.get("/:courseId/lectures/preview", getPreviewLectures);

// ==================== AUTHENTICATED ROUTES ====================

// Course creation
router.post(
  "/create",
  isAuthenticated,
  upload.single("courseThumbnail"),
  createCourse,
);

// Get all admin courses (authenticated)
router.get("/", isAuthenticated, getAllAdminCourses);

// Get a single course by ID (authenticated) - This comes AFTER all static routes
router.get("/:id", isAuthenticated, getCourseById);

// Update course
router.put(
  "/:id",
  isAuthenticated,
  upload.single("courseThumbnail"),
  editCourse,
);

// Delete course
router.delete("/:id", isAuthenticated, deleteCourse);

// ==================== LECTURE ROUTES ====================

// Get all lectures for a course
router.get("/:courseId/lectures", isAuthenticated, getLecturesByCourse);

// Create a new lecture
router.post("/:courseId/lectures", isAuthenticated, createLecture);

// Get a single lecture by ID
router.get("/:courseId/lectures/:lectureId", isAuthenticated, getLectureById);

// Update a lecture
router.put("/:courseId/lectures/:lectureId", isAuthenticated, updateLecture);

// Delete a lecture
router.delete("/:courseId/lectures/:lectureId", isAuthenticated, deleteLecture);

// Reorder lectures
router.put("/:courseId/lectures/reorder", isAuthenticated, reorderLectures);

export default router;
