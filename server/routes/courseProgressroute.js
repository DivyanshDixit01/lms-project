// routes/courseProgressRoutes.js
import express from "express";
import {
  getCourseProgress,
  markLectureComplete,
  updateLectureProgress,
  getUserOverallProgress,
} from "../controllers/courseProgresscontroller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.get("/:courseId", isAuthenticated, getCourseProgress);
router.post(
  "/:courseId/lectures/:lectureId/complete",
  isAuthenticated,
  markLectureComplete,
);
router.put(
  "/:courseId/lectures/:lectureId/progress",
  isAuthenticated,
  updateLectureProgress,
);
router.get("/user/overall", isAuthenticated, getUserOverallProgress);

export default router;
