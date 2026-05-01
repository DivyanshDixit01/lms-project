// pages/admin/course/EditLecture.js
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Save,
  ArrowLeft,
  Loader,
  AlertCircle,
  Trash2,
  Eye,
  Lock,
  ExternalLink,
  Upload,
  Video,
  X,
  CheckCircle,
} from "lucide-react";
import {
  useGetCourseByIdQuery,
  useGetLectureByIdQuery,
  useUpdateLectureMutation,
  useDeleteLectureMutation,
  useUploadTemporaryVideoMutation,
  useDeleteVideoMutation,
} from "../../../features/api/courseApi";

const EditLecture = () => {
  const { courseId, lectureId } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadMethod, setUploadMethod] = useState("upload");
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [uploadedVideoData, setUploadedVideoData] = useState(null);
  const [existingVideo, setExistingVideo] = useState(null);
  const fileInputRef = useRef(null);

  const { data: courseData, isLoading: isLoadingCourse } =
    useGetCourseByIdQuery(courseId);
  const { data: lectureData, isLoading: isLoadingLecture } =
    useGetLectureByIdQuery(
      { courseId, lectureId },
      { skip: !courseId || !lectureId },
    );
  const [updateLecture] = useUpdateLectureMutation();
  const [deleteLecture] = useDeleteLectureMutation();
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

  useEffect(() => {
    if (lectureData?.lecture) {
      const lecture = lectureData.lecture;
      console.log("Lecture data:", lecture); // Debug log

      const formattedDuration = formatDurationFromSeconds(
        lecture.duration || lecture.videoDuration,
      );

      setFormData({
        lectureTitle: lecture.lectureTitle || "",
        description: lecture.description || "",
        videoUrl: lecture.videoUrl || "",
        duration: formattedDuration,
        isPreviewFree: lecture.isPreviewFree || false,
      });

      // Check if the video is uploaded (not external link)
      const isUploadedVideo =
        lecture.videoUrl &&
        !lecture.videoUrl.includes("youtube") &&
        !lecture.videoUrl.includes("youtu.be") &&
        !lecture.videoUrl.includes("vimeo");

      if (lecture.videoUrl && isUploadedVideo) {
        setExistingVideo({
          url: lecture.videoUrl,
          publicId: lecture.publicId || lecture.videoPublicId,
          duration: lecture.duration || lecture.videoDuration,
        });
        setUploadMethod("upload");
        console.log("Existing video set:", lecture.videoUrl); // Debug log
      } else if (lecture.videoUrl) {
        setUploadMethod("link");
        console.log("External video link:", lecture.videoUrl); // Debug log
      }
    }
  }, [lectureData]);

  const formatDurationFromSeconds = (seconds) => {
    if (!seconds || seconds === 0) return "";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
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
    const previewUrl = URL.createObjectURL(file);
    setVideoPreview(previewUrl);

    // Clear existing video
    setExistingVideo(null);

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
    setExistingVideo(null);
    setFormData((prev) => ({
      ...prev,
      videoUrl: "",
      duration: "",
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const lectureDataToUpdate = {
        lectureTitle: formData.lectureTitle,
        description: formData.description,
        videoUrl: formData.videoUrl,
        duration: formData.duration,
        isPreviewFree: formData.isPreviewFree,
        publicId: uploadedVideoData?.publicId,
        videoDuration: uploadedVideoData?.duration,
      };

      console.log("Updating lecture with data:", lectureDataToUpdate); // Debug log

      await updateLecture({
        courseId,
        lectureId,
        ...lectureDataToUpdate,
      }).unwrap();

      alert("Lecture updated successfully!");
      navigate(`/dashboard/edit-course/${courseId}/lectures`);
    } catch (error) {
      console.error("Error updating lecture:", error);
      alert(
        error.data?.message || "Failed to update lecture. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this lecture?"))
      return;

    setIsSubmitting(true);
    try {
      if (existingVideo?.publicId) {
        await deleteVideo(existingVideo.publicId).unwrap();
      }
      await deleteLecture({ courseId, lectureId }).unwrap();
      alert("Lecture deleted successfully!");
      navigate(`/dashboard/edit-course/${courseId}/lectures`);
    } catch (error) {
      console.error("Error deleting lecture:", error);
      alert(error.data?.message || "Failed to delete lecture");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isLoadingCourse || isLoadingLecture;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading lecture data...</p>
        </div>
      </div>
    );
  }

  if (!courseData?.course || !lectureData?.lecture) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-red-700 mb-2">
              Not Found
            </h2>
            <p className="text-red-600 mb-4">
              The lecture or course doesn't exist.
            </p>
            <button
              onClick={() =>
                navigate(`/dashboard/edit-course/${courseId}/lectures`)
              }
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Back to Lectures
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            to={`/dashboard/edit-course/${courseId}/lectures`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Lectures
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Edit Lecture</h1>
          <p className="text-gray-500 mt-2">
            {courseData.course.courseTitle} • {lectureData.lecture.lectureTitle}
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
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Video Source */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Source *
              </label>
              <div className="flex gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setUploadMethod("upload")}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                    uploadMethod === "upload"
                      ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Upload className="w-4 h-4 inline mr-2" />
                  Upload Video
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMethod("link")}
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
                  {/* Show existing video or upload area */}
                  {!videoPreview && !existingVideo ? (
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
                        Click to upload new video
                      </p>
                      <p className="text-xs text-gray-500">
                        MP4, MOV, AVI, WEBM (max 500MB)
                      </p>
                    </div>
                  ) : (
                    <div className="relative">
                      <video
                        src={videoPreview || existingVideo?.url}
                        controls
                        className="w-full rounded-lg shadow-md"
                        style={{ maxHeight: "300px" }}
                      />
                      {(uploadedVideoData?.duration ||
                        existingVideo?.duration) && (
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                          Duration:{" "}
                          {formatDuration(
                            uploadedVideoData?.duration ||
                              existingVideo?.duration,
                          )}
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
                        Video Loaded
                      </div>
                    </div>
                  )}
                  {isUploading && (
                    <div className="text-center text-sm text-gray-600">
                      <Loader className="w-4 h-4 animate-spin inline mr-2" />
                      Uploading new video...
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
                    placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                  />
                  <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    Supported: YouTube, Vimeo, or direct video URLs
                  </p>
                </div>
              )}
              {errors.videoUrl && (
                <p className="mt-1 text-sm text-red-600">{errors.videoUrl}</p>
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
          </div>

          {/* Actions */}
          <div className="flex justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Delete Lecture
            </button>
            <div className="flex gap-4">
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
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isSubmitting ? "Updating..." : "Update Lecture"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLecture;
