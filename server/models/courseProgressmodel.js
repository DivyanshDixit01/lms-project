// models/courseProgressModel.js
import mongoose from "mongoose";

const lectureProgressSchema = new mongoose.Schema(
  {
    lectureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture",
      required: true,
    },
    viewed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    watchTime: {
      type: Number, // Time spent watching in seconds
      default: 0,
    },
    lastPosition: {
      type: Number, // Last watched position in seconds
      default: 0,
    },
  },
  {
    _id: true,
  }
);

const courseProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lectureProgress: [lectureProgressSchema],
    lastAccessed: {
      type: Date,
      default: Date.now,
    },
    totalWatchTime: {
      type: Number,
      default: 0,
    },
    lastWatchedLecture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to ensure one progress per user per course
courseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

// Method to calculate progress percentage
courseProgressSchema.methods.calculateProgress = function (totalLectures) {
  if (!totalLectures || totalLectures === 0) return 0;

  const completedLectures = this.lectureProgress.filter(
    (lecture) => lecture.viewed === true
  ).length;

  const percentage = (completedLectures / totalLectures) * 100;
  this.progressPercentage = Math.round(percentage);

  // Mark course as completed if progress is 100%
  if (this.progressPercentage === 100 && !this.completed) {
    this.completed = true;
    this.completedAt = new Date();
  }

  return this.progressPercentage;
};

// Method to mark a lecture as completed
courseProgressSchema.methods.markLectureComplete = async function (lectureId) {
  const lectureProgress = this.lectureProgress.find(
    (lp) => lp.lectureId.toString() === lectureId.toString()
  );

  if (lectureProgress) {
    lectureProgress.viewed = true;
    lectureProgress.completedAt = new Date();
  } else {
    this.lectureProgress.push({
      lectureId,
      viewed: true,
      completedAt: new Date(),
    });
  }

  return this;
};

// Method to mark a lecture as incomplete
courseProgressSchema.methods.markLectureIncomplete = async function (lectureId) {
  const lectureProgress = this.lectureProgress.find(
    (lp) => lp.lectureId.toString() === lectureId.toString()
  );

  if (lectureProgress) {
    lectureProgress.viewed = false;
    lectureProgress.completedAt = null;
    this.completed = false;
    this.completedAt = null;
  }

  return this;
};

// Method to update watch time for a lecture
courseProgressSchema.methods.updateWatchTime = async function (lectureId, additionalTime) {
  const lectureProgress = this.lectureProgress.find(
    (lp) => lp.lectureId.toString() === lectureId.toString()
  );

  if (lectureProgress) {
    lectureProgress.watchTime += additionalTime;
    this.totalWatchTime += additionalTime;
  }

  return this;
};

// Method to update last watched position
courseProgressSchema.methods.updateLastPosition = async function (lectureId, position) {
  const lectureProgress = this.lectureProgress.find(
    (lp) => lp.lectureId.toString() === lectureId.toString()
  );

  if (lectureProgress) {
    lectureProgress.lastPosition = position;
  }

  this.lastWatchedLecture = lectureId;
  this.lastAccessed = new Date();

  return this;
};

// Method to get completed lectures count
courseProgressSchema.methods.getCompletedCount = function () {
  return this.lectureProgress.filter((lecture) => lecture.viewed === true).length;
};

// Static method to initialize progress for a new enrollment
courseProgressSchema.statics.initializeProgress = async function (userId, courseId, lectures) {
  const lectureProgress = lectures.map((lecture) => ({
    lectureId: lecture._id,
    viewed: false,
    watchTime: 0,
    lastPosition: 0,
    completedAt: null,
  }));

  const progress = await this.create({
    userId,
    courseId,
    completed: false,
    lectureProgress,
    progressPercentage: 0,
    totalWatchTime: 0,
  });

  return progress;
};

// Static method to get user's overall progress across all courses
courseProgressSchema.statics.getUserOverallProgress = async function (userId) {
  const progresses = await this.find({ userId }).populate("courseId", "courseTitle");
  
  const totalCourses = progresses.length;
  const completedCourses = progresses.filter((p) => p.completed).length;
  const averageProgress = progresses.reduce((sum, p) => sum + p.progressPercentage, 0) / totalCourses || 0;

  return {
    totalCourses,
    completedCourses,
    averageProgress: Math.round(averageProgress),
    courses: progresses,
  };
};

// Virtual for formatted total watch time
courseProgressSchema.virtual("formattedTotalWatchTime").get(function () {
  const hours = Math.floor(this.totalWatchTime / 3600);
  const minutes = Math.floor((this.totalWatchTime % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
});

const CourseProgress = mongoose.model("CourseProgress", courseProgressSchema);

export default CourseProgress;