// pages/admin/course/CreateLecture.js
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Save,
  ArrowLeft,
  Loader,
  AlertCircle,
  Eye,
  Lock,
  ExternalLink,
  Upload,
  Video,
  X,
  CheckCircle,
  Play,
  Download,
} from "lucide-react";
import {
  useGetCourseByIdQuery,
  useCreateLectureMutation,
  useUploadTemporaryVideoMutation,
  useDeleteVideoMutation,
} from "../../../features/api/courseApi";

const CreateLecture = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadMethod, setUploadMethod] = useState("upload");
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [uploadedVideoData, setUploadedVideoData] = useState(null);
  const [externalUrlValid, setExternalUrlValid] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const { data: courseData, isLoading: isLoadingCourse } =
    useGetCourseByIdQuery(courseId);
  const [createLecture] = useCreateLectureMutation();
  const [uploadTemporaryVideo, { isLoading: isUploading }] =
    useUploadTemporaryVideoMutation();
  const [deleteVideo] = useDeleteVideoMutation();

  const [formData, setFormData] = useState({
    lectureTitle: "",
    description: "",
    videoUrl: "",
    duration: "",
    isPreviewFree: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Validate external URL when user types
    if (name === "videoUrl" && uploadMethod === "link") {
      validateExternalUrl(value);
    }
  };

  const validateExternalUrl = async (url) => {
    if (!url) {
      setExternalUrlValid(false);
      return;
    }

    // Check if it's a valid URL
    try {
      const urlObj = new URL(url);
      setExternalUrlValid(true);
      setErrors((prev) => ({ ...prev, videoUrl: "" }));

      // Test if the video can be loaded
      testVideoUrl(url);
    } catch {
      setExternalUrlValid(false);
      setErrors((prev) => ({ ...prev, videoUrl: "Please enter a valid URL" }));
    }
  };

  const testVideoUrl = (url) => {
    setVideoLoading(true);

    // Create a temporary video element to test if the URL is accessible
    const testVideo = document.createElement("video");
    testVideo.preload = "metadata";

    testVideo.onloadedmetadata = () => {
      setVideoLoading(false);
      setExternalUrlValid(true);
      setErrors((prev) => ({ ...prev, videoUrl: "" }));
      // Get duration if available
      if (testVideo.duration && !formData.duration) {
        const minutes = Math.floor(testVideo.duration / 60);
        const seconds = Math.floor(testVideo.duration % 60);
        setFormData((prev) => ({
          ...prev,
          duration: `${minutes}:${seconds.toString().padStart(2, "0")}`,
        }));
      }
      testVideo.src = "";
    };

    testVideo.onerror = () => {
      setVideoLoading(false);
      // Don't show error for CORS issues, just warn
      console.warn(
        "Cannot load video metadata due to CORS or access restrictions:",
        url,
      );
      setExternalUrlValid(true); // Still consider it valid, just can't preview
    };

    testVideo.src = url;
  };

  const handleVideoFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (500MB max)
    if (file.size > 500 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        videoUrl: "Video size exceeds 500MB limit",
      }));
      return;
    }

    // Validate file type
    if (!file.type.startsWith("video/")) {
      setErrors((prev) => ({
        ...prev,
        videoUrl: "Please upload a valid video file",
      }));
      return;
    }

    setVideoFile(file);

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setVideoPreview(previewUrl);

    // Upload video
    try {
      const response = await uploadTemporaryVideo({
        courseId,
        videoFile: file,
      }).unwrap();

      if (response.success) {
        setUploadedVideoData(response.data);
        setFormData((prev) => ({
          ...prev,
          videoUrl: response.data.url,
          duration: formatDuration(response.data.duration),
        }));
        setErrors((prev) => ({ ...prev, videoUrl: "" }));
      }
    } catch (error) {
      console.error("Error uploading video:", error);
      setErrors((prev) => ({
        ...prev,
        videoUrl: error.data?.message || "Failed to upload video",
      }));
      setVideoFile(null);
      setVideoPreview(null);
    }
  };

  const handleRemoveVideo = async () => {
    if (uploadedVideoData?.publicId) {
      try {
        await deleteVideo(uploadedVideoData.publicId).unwrap();
      } catch (error) {
        console.error("Error deleting video:", error);
      }
    }

    setVideoFile(null);
    setVideoPreview(null);
    setUploadedVideoData(null);
    setFormData((prev) => ({
      ...prev,
      videoUrl: "",
      duration: "",
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.lectureTitle.trim()) {
      newErrors.lectureTitle = "Lecture title is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.videoUrl.trim()) {
      newErrors.videoUrl = "Video is required";
    } else if (uploadMethod === "link" && !isValidUrl(formData.videoUrl)) {
      newErrors.videoUrl = "Please enter a valid URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const getEmbedUrl = (url) => {
    // Convert YouTube URL to embed format
    if (url.includes("youtube.com/watch")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("youtu.be")) {
      const videoId = url.split("/").pop();
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("vimeo.com")) {
      const videoId = url.split("/").pop();
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  const isEmbeddableUrl = (url) => {
    return (
      url.includes("youtube.com") ||
      url.includes("youtu.be") ||
      url.includes("vimeo.com")
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const lectureData = {
        lectureTitle: formData.lectureTitle,
        description: formData.description,
        videoUrl: formData.videoUrl,
        duration: formData.duration,
        isPreviewFree: formData.isPreviewFree,
        publicId: uploadedVideoData?.publicId,
        videoDuration: uploadedVideoData?.duration,
      };

      await createLecture({
        courseId,
        ...lectureData,
      }).unwrap();

      alert("Lecture created successfully!");
      navigate(`/dashboard/edit-course/${courseId}/lectures`);
    } catch (error) {
      console.error("Error creating lecture:", error);
      alert(
        error.data?.message || "Failed to create lecture. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingCourse) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading course data...</p>
        </div>
      </div>
    );
  }

  if (!courseData?.course) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-red-700 mb-2">
              Course Not Found
            </h2>
            <p className="text-red-600 mb-4">
              The course you're trying to add lectures to doesn't exist.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={`/dashboard/edit-course/${courseId}/lectures`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Lectures
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">
            Create New Lecture
          </h1>
          <p className="text-gray-500 mt-2">
            {courseData?.course?.courseTitle}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <div className="space-y-6">
            {/* Lecture Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lecture Title *
              </label>
              <input
                type="text"
                name="lectureTitle"
                value={formData.lectureTitle}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.lectureTitle ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., Introduction to React"
              />
              {errors.lectureTitle && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.lectureTitle}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="What will students learn in this lecture?"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Video Upload Method Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Source *
              </label>
              <div className="flex gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setUploadMethod("upload");
                    setErrors((prev) => ({ ...prev, videoUrl: "" }));
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                    uploadMethod === "upload"
                      ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Upload className="w-4 h-4 inline mr-2" />
                  Upload Video File
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUploadMethod("link");
                    setErrors((prev) => ({ ...prev, videoUrl: "" }));
                    if (formData.videoUrl) {
                      validateExternalUrl(formData.videoUrl);
                    }
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                    uploadMethod === "link"
                      ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <ExternalLink className="w-4 h-4 inline mr-2" />
                  External Link
                </button>
              </div>

              {uploadMethod === "upload" ? (
                <div className="space-y-4">
                  {/* Video Upload Area */}
                  {!videoPreview ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/mp4,video/mpeg,video/quicktime,video/x-msvideo,video/webm"
                        onChange={handleVideoFileSelect}
                        className="hidden"
                      />
                      <Video className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 mb-2">
                        Click to upload video
                      </p>
                      <p className="text-xs text-gray-500">
                        MP4, MOV, AVI, WEBM (max 500MB)
                      </p>
                    </div>
                  ) : (
                    <div className="relative">
                      <video
                        ref={videoRef}
                        src={videoPreview}
                        controls
                        className="w-full rounded-lg shadow-md"
                        style={{ maxHeight: "300px" }}
                      />
                      {uploadedVideoData?.duration && (
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                          Duration: {formatDuration(uploadedVideoData.duration)}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={handleRemoveVideo}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                        <CheckCircle className="w-3 h-3" />
                        Uploaded
                      </div>
                    </div>
                  )}
                  {isUploading && (
                    <div className="text-center text-sm text-gray-600">
                      <Loader className="w-4 h-4 animate-spin inline mr-2" />
                      Uploading video...
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <input
                    type="url"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errors.videoUrl ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="https://youtube.com/watch?v=... or https://vimeo.com/... or any video URL"
                  />

                  {formData.videoUrl && isValidUrl(formData.videoUrl) && (
                    <div className="mt-3">
                      {videoLoading && (
                        <div className="flex items-center justify-center gap-2 text-gray-500 py-4">
                          <Loader className="w-5 h-5 animate-spin" />
                          <span className="text-sm">
                            Loading video preview...
                          </span>
                        </div>
                      )}

                      {!videoLoading && isEmbeddableUrl(formData.videoUrl) ? (
                        <div
                          className="relative rounded-lg overflow-hidden bg-gray-900"
                          style={{ maxHeight: "200px" }}
                        >
                          <iframe
                            src={getEmbedUrl(formData.videoUrl)}
                            className="w-full h-48"
                            title="Video Preview"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        !videoLoading &&
                        formData.videoUrl && (
                          <div className="relative rounded-lg overflow-hidden bg-gray-100 p-4 text-center">
                            <Download className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 mb-2">
                              Direct Video URL
                            </p>
                            <p className="text-xs text-gray-500 break-all">
                              {formData.videoUrl}
                            </p>
                            <p className="text-xs text-blue-600 mt-2">
                              This video will play directly in your course
                            </p>
                          </div>
                        )
                      )}

                      {externalUrlValid && !videoLoading && (
                        <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Video URL is valid
                        </p>
                      )}
                    </div>
                  )}

                  <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    Supported: YouTube, Vimeo, or any direct video URL (MP4,
                    WebM, etc.)
                  </p>
                  <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Note: Some video URLs may not show preview due to CORS
                    restrictions, but will work when students access the course
                  </p>
                </div>
              )}
              {errors.videoUrl && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.videoUrl}
                </p>
              )}
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (optional)
              </label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
                placeholder="e.g., 10:30 or 1:25:45"
                disabled={uploadMethod === "upload" && uploadedVideoData}
              />
              {uploadMethod === "upload" && uploadedVideoData && (
                <p className="mt-1 text-xs text-green-600">
                  Duration automatically extracted from video
                </p>
              )}
            </div>

            {/* Preview Free Option */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                name="isPreviewFree"
                id="isPreviewFree"
                checked={formData.isPreviewFree}
                onChange={handleChange}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <label
                htmlFor="isPreviewFree"
                className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer"
              >
                {formData.isPreviewFree ? (
                  <Eye className="w-4 h-4 text-green-600" />
                ) : (
                  <Lock className="w-4 h-4 text-gray-500" />
                )}
                Make this lecture free for preview
              </label>
            </div>
            <p className="text-xs text-gray-500 ml-7">
              Students can watch this lecture without purchasing the course
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() =>
                navigate(`/dashboard/edit-course/${courseId}/lectures`)
              }
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                (uploadMethod === "upload" &&
                  !uploadedVideoData &&
                  !videoPreview)
              }
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSubmitting ? "Creating..." : "Create Lecture"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLecture;
