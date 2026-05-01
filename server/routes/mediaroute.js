// routes/mediaRoutes.js
import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { deleteVideoFromCloudinary } from "../utils/cloudinary.js";

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for videos
const videoFilter = (req, file, cb) => {
  const allowedTypes = [
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    "video/x-msvideo",
    "video/webm",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Only video files are allowed (MP4, MPEG, MOV, AVI, WEBM)"),
      false,
    );
  }
};

const uploadVideo = multer({
  storage: storage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: videoFilter,
});

// Upload video with proper chunking for large files
router.post(
  "/upload/video",
  isAuthenticated,
  uploadVideo.single("video"),
  async (req, res) => {
    try {
      console.log("=== Video Upload Request ===");

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No video file uploaded",
        });
      }

      console.log(
        "File size:",
        (req.file.size / (1024 * 1024)).toFixed(2),
        "MB",
      );

      const { courseId, lectureId } = req.body;

      // Use upload_stream for large files
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "video",
            folder:
              courseId && lectureId
                ? `courses/${courseId}/lectures/${lectureId}`
                : courseId
                  ? `courses/${courseId}/lectures`
                  : "lectures",
            chunk_size: 20 * 1024 * 1024, // 20MB chunks for better handling
            timeout: 600000, // 10 minutes timeout
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );

        uploadStream.end(req.file.buffer);
      });

      console.log("Upload successful! Public ID:", uploadResult.public_id);

      return res.status(200).json({
        success: true,
        message: "Video uploaded successfully",
        data: {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          duration: Math.floor(uploadResult.duration || 0),
          format: uploadResult.format,
          size: uploadResult.bytes,
        },
      });
    } catch (error) {
      console.error("Error uploading video:", error);

      let errorMessage = "Failed to upload video";
      if (error.http_code === 413) {
        errorMessage =
          "Video file is too large. Please compress to under 100MB or use a smaller file.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      return res.status(500).json({
        success: false,
        message: errorMessage,
        error: error.message,
      });
    }
  },
);

// Delete video from Cloudinary
router.delete("/delete/video/:publicId", isAuthenticated, async (req, res) => {
  try {
    const { publicId } = req.params;
    const result = await deleteVideoFromCloudinary(publicId);

    if (result.result === "ok") {
      return res.status(200).json({
        success: true,
        message: "Video deleted successfully",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }
  } catch (error) {
    console.error("Error deleting video:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete video",
      error: error.message,
    });
  }
});

// Get video details
router.get("/video/:publicId", isAuthenticated, async (req, res) => {
  try {
    const { publicId } = req.params;
    const result = await cloudinary.api.resource(publicId, {
      resource_type: "video",
    });

    return res.status(200).json({
      success: true,
      data: {
        url: result.secure_url,
        duration: result.duration,
        format: result.format,
        size: result.bytes,
        created_at: result.created_at,
      },
    });
  } catch (error) {
    console.error("Error getting video details:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get video details",
      error: error.message,
    });
  }
});

// Generate thumbnail from video
router.post("/video/:publicId/thumbnail", isAuthenticated, async (req, res) => {
  try {
    const { publicId } = req.params;
    const { timestamp = 0 } = req.body;

    const thumbnailUrl = cloudinary.url(publicId, {
      resource_type: "video",
      transformation: [
        { start_offset: timestamp },
        { width: 1280, height: 720, crop: "limit" },
        { quality: "auto" },
      ],
      format: "jpg",
    });

    return res.status(200).json({
      success: true,
      data: {
        url: thumbnailUrl,
        publicId: `${publicId}_thumbnail`,
        timestamp: timestamp,
      },
    });
  } catch (error) {
    console.error("Error generating thumbnail:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate thumbnail",
      error: error.message,
    });
  }
});

// Get optimized video URL
router.get("/video/:publicId/optimize", isAuthenticated, async (req, res) => {
  try {
    const { publicId } = req.params;
    const { quality = "auto", width, height } = req.query;

    const transformations = [];

    if (width || height) {
      transformations.push({
        width: width ? parseInt(width) : undefined,
        height: height ? parseInt(height) : undefined,
        crop: "limit",
      });
    }

    transformations.push({ quality: quality });

    const optimizedUrl = cloudinary.url(publicId, {
      resource_type: "video",
      transformation: transformations,
    });

    return res.status(200).json({
      success: true,
      data: {
        url: optimizedUrl,
        publicId: publicId,
      },
    });
  } catch (error) {
    console.error("Error generating optimized URL:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate optimized URL",
      error: error.message,
    });
  }
});

export default router;
