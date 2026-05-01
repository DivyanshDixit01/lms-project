import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["instructor", "student", "admin"],
      default: "student",
    },
    status: {
      type: String,
      enum: ["active", "suspended", "inactive"],
      default: "active",
    },
    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    profilePicture: {
      type: String,
      default: "",
    },
    // KEEP these fields
    location: {
      type: String,
      default: "",
    },
    education: {
      type: String,
      default: "",
    },
    // REMOVED: bio, website, occupation, interests, socialLinks, preferences
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);
export default User;