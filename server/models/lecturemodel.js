import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema(
  {
    lectureTitle: {
      type: String,
      required: [true, "Lecture title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },

    videoUrl: {
      type: String,
      required: [true, "Video URL is required"],
    },

    publicId: {
      type: String, // for Cloudinary delete/update
    },

    duration: {
      type: Number, // in seconds or minutes
    },

    order: {
      type: Number, // lecture sequence inside course
    },

    isPreviewFree: {
      type: Boolean,
      default: false,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course", // relation with Course model
      required: true,
    },
  },
  { timestamps: true },
);

const Lecture = mongoose.model("Lecture", lectureSchema);

export default Lecture;
