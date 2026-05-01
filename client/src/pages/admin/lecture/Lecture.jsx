// pages/admin/lecture/Lectures.js
import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Video,
  Plus,
  Trash2,
  Edit,
  ArrowLeft,
  Clock,
  Link as LinkIcon,
  Loader,
  AlertCircle,
  Search,
  Eye,
  Lock,
  Play,
  Calendar,
  FileText,
} from "lucide-react";
import {
  useGetCourseByIdQuery,
  useGetLecturesByCourseQuery,
  useDeleteLectureMutation,
  useDeleteVideoMutation,
} from "../../../features/api/courseApi";

const Lectures = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const {
    data: courseData,
    isLoading: isLoadingCourse,
    refetch: refetchCourse,
  } = useGetCourseByIdQuery(courseId);

  const {
    data: lecturesData,
    isLoading: isLoadingLectures,
    refetch: refetchLectures,
  } = useGetLecturesByCourseQuery(courseId);

  const [deleteLecture] = useDeleteLectureMutation();
  const [deleteVideo] = useDeleteVideoMutation();

  const isLoading = isLoadingCourse || isLoadingLectures;

  const handleDeleteLecture = async (lecture) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${lecture.lectureTitle}"?`,
      )
    ) {
      return;
    }

    setDeletingId(lecture._id);

    try {
      // Delete video from Cloudinary if it's a uploaded video (not external link)
      if (lecture.videoPublicId) {
        try {
          await deleteVideo(lecture.videoPublicId).unwrap();
        } catch (error) {
          console.error("Error deleting video from Cloudinary:", error);
        }
      }

      // Delete lecture from database
      await deleteLecture({ courseId, lectureId: lecture._id }).unwrap();

      alert("Lecture deleted successfully!");
      refetchLectures();
      refetchCourse();
    } catch (error) {
      console.error("Error deleting lecture:", error);
      alert(
        error.data?.message || "Failed to delete lecture. Please try again.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Format duration from seconds to readable format
  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return "No duration";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}min`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Filter lectures based on search term
  const filteredLectures =
    lecturesData?.lectures?.filter(
      (lecture) =>
        lecture.lectureTitle
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        lecture.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  // Get video platform icon
  const getVideoPlatform = (url) => {
    if (!url) return "link";
    if (url.includes("youtube.com") || url.includes("youtu.be"))
      return "youtube";
    if (url.includes("vimeo.com")) return "vimeo";
    return "link";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading lectures...</p>
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
              The course you're looking for doesn't exist.
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

  const course = courseData.course;
  const lectures = lecturesData?.lectures || [];
  const totalDuration = lectures.reduce(
    (total, lecture) => total + (lecture.videoDuration || 0),
    0,
  );
  const previewCount = lectures.filter((l) => l.isPreviewFree).length;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={`/dashboard/edit-course/${courseId}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Course
          </Link>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Course Lectures
              </h1>
              <p className="text-gray-500 mt-1">{course.courseTitle}</p>
            </div>
            <Link
              to={`/dashboard/edit-course/${courseId}/lectures/create`}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add New Lecture
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Lectures</p>
                <p className="text-2xl font-bold text-gray-800">
                  {lectures.length}
                </p>
              </div>
              <div className="bg-indigo-100 rounded-lg p-3">
                <Video className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Duration</p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatDuration(totalDuration)}
                </p>
              </div>
              <div className="bg-green-100 rounded-lg p-3">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Preview Free</p>
                <p className="text-2xl font-bold text-gray-800">
                  {previewCount}
                </p>
              </div>
              <div className="bg-yellow-100 rounded-lg p-3">
                <Eye className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="text-sm font-medium text-gray-800">
                  {course.updatedAt ? formatDate(course.updatedAt) : "N/A"}
                </p>
              </div>
              <div className="bg-purple-100 rounded-lg p-3">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search lectures by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Lectures List */}
        {filteredLectures.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {searchTerm ? "No lectures found" : "No lectures yet"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm
                ? `No lectures matching "${searchTerm}"`
                : "Start creating your first lecture to build your course content"}
            </p>
            {!searchTerm && (
              <Link
                to={`/dashboard/edit-course/${courseId}/lectures/create`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create First Lecture
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLectures.map((lecture, index) => {
              const platform = getVideoPlatform(lecture.videoUrl);
              const isUploadedVideo =
                lecture.videoPublicId &&
                !lecture.videoUrl?.includes("youtube") &&
                !lecture.videoUrl?.includes("vimeo");

              return (
                <div
                  key={lecture._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Lecture Number and Title */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-lg">
                            <span className="text-indigo-600 font-semibold text-sm">
                              {index + 1}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {lecture.lectureTitle}
                          </h3>
                          <div className="flex gap-2">
                            {lecture.isPreviewFree ? (
                              <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                <Eye className="w-3 h-3" />
                                Preview Free
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                <Lock className="w-3 h-3" />
                                Premium
                              </span>
                            )}
                            {isUploadedVideo && (
                              <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                <Video className="w-3 h-3" />
                                Uploaded
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        {lecture.description && (
                          <p className="text-gray-600 mb-3 ml-11 line-clamp-2">
                            {lecture.description.length > 200
                              ? `${lecture.description.substring(0, 200)}...`
                              : lecture.description}
                          </p>
                        )}

                        {/* Lecture Metadata */}
                        <div className="flex items-center flex-wrap gap-4 ml-11 text-sm">
                          {/* Video Link */}
                          <a
                            href={lecture.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
                          >
                            {platform === "youtube" ? (
                              <Play className="w-4 h-4" />
                            ) : platform === "vimeo" ? (
                              <Video className="w-4 h-4" />
                            ) : (
                              <LinkIcon className="w-4 h-4" />
                            )}
                            Watch Video
                          </a>

                          {/* Duration */}
                          {(lecture.videoDuration > 0 ||
                            lecture.duration > 0) && (
                            <span className="flex items-center gap-1 text-gray-500">
                              <Clock className="w-4 h-4" />
                              {formatDuration(
                                lecture.videoDuration || lecture.duration,
                              )}
                            </span>
                          )}

                          {/* Created Date */}
                          <span className="flex items-center gap-1 text-gray-400 text-xs">
                            <Calendar className="w-3 h-3" />
                            Added: {formatDate(lecture.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/dashboard/edit-course/${courseId}/lectures/${lecture._id}/edit`}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Lecture"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteLecture(lecture)}
                          disabled={deletingId === lecture._id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete Lecture"
                        >
                          {deletingId === lecture._id ? (
                            <Loader className="w-5 h-5 animate-spin" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Video Preview (for uploaded videos) */}
                    {isUploadedVideo && lecture.videoUrl && (
                      <div className="mt-4 ml-11">
                        <div className="relative rounded-lg overflow-hidden bg-gray-900 max-w-md">
                          <video
                            src={lecture.videoUrl}
                            className="w-full h-auto cursor-pointer"
                            style={{ maxHeight: "150px" }}
                            onClick={() =>
                              window.open(lecture.videoUrl, "_blank")
                            }
                          >
                            <source src={lecture.videoUrl} type="video/mp4" />
                          </video>
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                            <div className="bg-white rounded-full p-2">
                              <Play className="w-6 h-6 text-indigo-600" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Stats */}
        {filteredLectures.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Showing {filteredLectures.length} of {lectures.length} lectures
            {searchTerm && filteredLectures.length !== lectures.length && (
              <button
                onClick={() => setSearchTerm("")}
                className="ml-2 text-indigo-600 hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Lectures;
