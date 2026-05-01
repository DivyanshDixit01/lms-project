// config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Log configuration status
console.log("=== Cloudinary Configuration ===");
console.log("Cloud Name:", process.env.CLOUD_NAME ? "✓ Present" : "✗ Missing");
console.log("API Key:", process.env.API_KEY ? "✓ Present" : "✗ Missing");
console.log("API Secret:", process.env.API_SECRET ? "✓ Present" : "✗ Missing");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export const uploadImage = async (filePath) => {
  try {
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });
    return uploadResult;
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw error;
  }
};

export const uploadVideo = async (filePath) => {
  try {
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: "video",
      eager: [{ format: "mp4", transformation: [{ quality: "auto" }] }],
      eager_async: true,
    });
    return uploadResult;
  } catch (error) {
    console.error("Error uploading video to Cloudinary:", error);
    throw error;
  }
};

export const deleteMediaFromCloudinary = async (publicId) => {
  try {
    const deleteResult = await cloudinary.uploader.destroy(publicId);
    return deleteResult;
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    throw error;
  }
};

export const deleteVideoFromCloudinary = async (publicId) => {
  try {
    const deleteResult = await cloudinary.uploader.destroy(publicId, {
      resource_type: "video",
    });
    return deleteResult;
  } catch (error) {
    console.error("Error deleting video from Cloudinary:", error);
    throw error;
  }
};

export default cloudinary;
