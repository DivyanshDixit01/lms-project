import mongoose from "mongoose";
import dotenv from "dotenv";
import PurchaseCourse from "./models/purchaseCoursemodel.js";
import Flag from "./models/flagmodel.js";
import User from "./models/usermodel.js";
import Course from "./models/coursemodel.js";
import CourseProgress from "./models/courseProgressmodel.js";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/lms");
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

const seedPayments = async () => {
  try {
    // Clear existing purchases
    await PurchaseCourse.deleteMany({});

    // Get some existing users and courses to create realistic purchases
    const users = await User.find().limit(5);
    const courses = await Course.find().limit(5);

    if (users.length === 0 || courses.length === 0) {
      console.log("⚠ No users or courses found. Skipping purchase seeding.");
      return;
    }

    // Create sample purchases with real references
    const purchases = [];
    
    for (let i = 0; i < Math.min(users.length, courses.length); i++) {
      purchases.push({
        userId: users[i]._id,
        courseId: courses[i]._id,
        amount: 99.99 + i * 50,
        status: i === 0 ? "pending" : "completed",
        paymentId: `pay_${Date.now()}_${i}`,
        purchaseDate: new Date(Date.now() - i * 86400000), // Different dates
      });
    }

    await PurchaseCourse.insertMany(purchases);
    console.log(`✓ ${purchases.length} purchases seeded successfully`);
  } catch (error) {
    console.error("Error seeding purchases:", error);
  }
};

const seedFlags = async () => {
  try {
    // Clear existing flags
    await Flag.deleteMany({});

    // Create sample flags
    const flags = [
      {
        contentId: new mongoose.Types.ObjectId(),
        contentType: "course_description",
        contentPreview: "This course contains inappropriate content...",
        flagReason: "inappropriate",
        reporterId: new mongoose.Types.ObjectId(),
        reporterEmail: "reporter1@example.com",
        reportedUserId: new mongoose.Types.ObjectId(),
        reportedUserEmail: "instructor1@example.com",
        status: "pending",
        metadata: {
          courseId: new mongoose.Types.ObjectId(),
          courseTitle: "Advanced Programming",
          category: "Programming",
        },
      },
      {
        contentId: new mongoose.Types.ObjectId(),
        contentType: "review",
        contentPreview: "BUY CHEAP PRODUCTS HERE!!!",
        flagReason: "spam",
        reporterId: new mongoose.Types.ObjectId(),
        reporterEmail: "reporter2@example.com",
        reportedUserId: new mongoose.Types.ObjectId(),
        reportedUserEmail: "spammer@example.com",
        status: "pending",
        metadata: {
          courseId: new mongoose.Types.ObjectId(),
          courseTitle: "Web Development",
          category: "Web Development",
        },
      },
      {
        contentId: new mongoose.Types.ObjectId(),
        contentType: "comment",
        contentPreview: "Harassing comment towards other users...",
        flagReason: "harassment",
        reporterId: new mongoose.Types.ObjectId(),
        reporterEmail: "reporter3@example.com",
        reportedUserId: new mongoose.Types.ObjectId(),
        reportedUserEmail: "harasser@example.com",
        status: "reviewed",
        reviewedAt: new Date(),
        reviewedBy: new mongoose.Types.ObjectId(),
        moderationReason: "Confirmed harassment",
        metadata: {
          courseId: new mongoose.Types.ObjectId(),
          courseTitle: "Python Basics",
          category: "Programming",
        },
      },
    ];

    await Flag.insertMany(flags);
    console.log("✓ Flags seeded successfully");
  } catch (error) {
    console.error("Error seeding flags:", error);
  }
};

const seedAnalytics = async () => {
  try {
    // Analytics are now calculated from existing data
    // No need to seed AnalyticsMetric model
    console.log("✓ Analytics will be calculated from existing data");
  } catch (error) {
    console.error("Error with analytics:", error);
  }
};

const runSeed = async () => {
  try {
    await connectDB();
    console.log("Starting data seeding...\n");

    await seedPayments();
    await seedFlags();
    await seedAnalytics();

    console.log("\n✓ All data seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

runSeed();
