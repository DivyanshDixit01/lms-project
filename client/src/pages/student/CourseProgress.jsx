// pages/student/CourseProgress.js
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetCourseProgressQuery,
  useMarkLectureCompleteMutation,
  useUpdateLectureProgressMutation,
} from "../../features/api/courseProgressApi";
import {
  ArrowLeft,
  CheckCircle,
  Lock,
  Video,
  Clock,
  User,
  BookOpen,
  Play,
  Loader,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Home,
  Grid,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Trophy,
  TrendingUp,
  Calendar,
} from "lucide-react";

const CourseProgress = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [watchTime, setWatchTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const videoRef = useRef(null);
  const intervalRef = useRef(null);
  const videoEndedRef = useRef(false);

  // Fetch course progress
  const {
    data: progressData,
    isLoading: progressLoading,
    refetch: refetchProgress,
  } = useGetCourseProgressQuery(courseId);

  const [markLectureComplete] = useMarkLectureCompleteMutation();
  const [updateLectureProgress] = useUpdateLectureProgressMutation();

  // Handle window resize for responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Set selected lecture from progress data
  useEffect(() => {
    if (
      progressData?.data?.lectureProgress &&
      progressData.data.lectureProgress.length > 0 &&
      !selectedLecture
    ) {
      const lastWatched = progressData.data.lastWatchedLecture;
      if (lastWatched) {
        const lecture = progressData.data.lectureProgress.find(
          (lp) => lp.lectureId?._id === lastWatched,
        );
        if (lecture?.lectureId) {
          setSelectedLecture(lecture.lectureId);
        }
      } else {
        setSelectedLecture(progressData.data.lectureProgress[0]?.lectureId);
      }
    }
  }, [progressData]);

  // Handle video end event - auto mark as complete
  const handleVideoEnd = async () => {
    if (
      selectedLecture &&
      !isLectureCompleted(selectedLecture._id) &&
      !videoEndedRef.current
    ) {
      videoEndedRef.current = true;
      try {
        await markLectureComplete({
          courseId,
          lectureId: selectedLecture._id,
        }).unwrap();

        refetchProgress();

        // Auto play next lecture
        const currentIndex = lectures.findIndex(
          (l) => l._id === selectedLecture._id,
        );
        if (currentIndex < lectures.length - 1) {
          const nextLecture = lectures[currentIndex + 1];
          setSelectedLecture(nextLecture);
          videoEndedRef.current = false;
        }
      } catch (error) {
        console.error("Error auto-marking lecture complete:", error);
      }
    }
  };

  // Track watch time and save last position
  useEffect(() => {
    if (selectedLecture && videoRef.current) {
      const video = videoRef.current;

      // Load saved position
      const savedProgress = progressData?.data?.lectureProgress?.find(
        (lp) => lp.lectureId?._id === selectedLecture._id,
      );
      if (
        savedProgress?.lastPosition &&
        savedProgress.lastPosition > 0 &&
        !savedProgress.viewed
      ) {
        video.currentTime = savedProgress.lastPosition;
      }

      const handleTimeUpdate = () => {
        if (!isPlaying) return;

        if (intervalRef.current) return;

        intervalRef.current = setInterval(async () => {
          const newWatchTime = watchTime + 5;
          setWatchTime(newWatchTime);

          await updateLectureProgress({
            courseId,
            lectureId: selectedLecture._id,
            watchTime: 5,
            position: Math.floor(video.currentTime),
          });
        }, 5000);
      };

      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);

      video.addEventListener("timeupdate", handleTimeUpdate);
      video.addEventListener("play", handlePlay);
      video.addEventListener("pause", handlePause);
      video.addEventListener("ended", handleVideoEnd);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.removeEventListener("play", handlePlay);
        video.removeEventListener("pause", handlePause);
        video.removeEventListener("ended", handleVideoEnd);
      };
    }
  }, [
    selectedLecture,
    courseId,
    updateLectureProgress,
    isPlaying,
    watchTime,
    progressData,
  ]);

  const formatDuration = (seconds) => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const rem = minutes % 60;
      return `${hours}h ${rem}m`;
    }
    return `${minutes}m`;
  };

  const getVideoUrl = (lecture) => {
    if (!lecture?.videoUrl) return null;
    let url = lecture.videoUrl;
    if (url.includes("youtube.com/watch") || url.includes("youtu.be")) {
      const id = url.includes("v=")
        ? url.split("v=")[1]?.split("&")[0]
        : url.split("/").pop();
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes("vimeo.com"))
      return `https://player.vimeo.com/video/${url.split("/").pop()}`;
    if (url.startsWith("http")) return url;
    return `http://localhost:5000${url}`;
  };

  const handleMarkComplete = async () => {
    if (!selectedLecture) return;

    try {
      await markLectureComplete({
        courseId,
        lectureId: selectedLecture._id,
      }).unwrap();

      refetchProgress();

      const currentIndex = lectures.findIndex(
        (l) => l._id === selectedLecture._id,
      );
      if (currentIndex < lectures.length - 1) {
        const nextLecture = lectures[currentIndex + 1];
        setSelectedLecture(nextLecture);
      }
    } catch (error) {
      console.error("Error marking lecture complete:", error);
    }
  };

  const isLectureCompleted = (lectureId) => {
    if (!progressData?.data?.lectureProgress) return false;
    const lectureProgress = progressData.data.lectureProgress.find(
      (lp) => lp.lectureId?._id === lectureId || lp.lectureId === lectureId,
    );
    return lectureProgress?.viewed || false;
  };

  const lectures =
    progressData?.data?.lectureProgress
      ?.map((lp) => lp.lectureId)
      .filter(Boolean) || [];
  const totalLectures = lectures.length;
  const completedCount =
    progressData?.data?.lectureProgress?.filter((lp) => lp.viewed).length || 0;
  const progressPercentage = progressData?.data?.progressPercentage || 0;

  if (progressLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading your course...</p>
        </div>
      </div>
    );
  }

  if (!progressData?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-500 mb-6">
            You need to enroll in this course to access the content.
          </p>
          <button
            onClick={() => navigate(`/course/${courseId}`)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            View Course Details
          </button>
        </div>
      </div>
    );
  }

  const course = progressData?.data?.courseId || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/my-courses")}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition" />
                <span className="hidden sm:inline text-sm font-medium">
                  Back to My Courses
                </span>
              </button>
              <div className="hidden md:block h-6 w-px bg-gray-200"></div>
              <div className="hidden md:block">
                <h1 className="text-sm font-semibold text-gray-800 line-clamp-1 max-w-md">
                  {course.courseTitle || "Course Progress"}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-gray-500">Progress</div>
                <div className="text-sm font-semibold text-gray-800">
                  {Math.round(progressPercentage)}%
                </div>
              </div>
              <div className="w-20 sm:w-32">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition"
              >
                {sidebarOpen ? (
                  <ChevronRight className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex">
        {/* Sidebar - Course Content */}
        <aside
          className={`
            fixed lg:relative top-0 left-0 bottom-0 z-20
            bg-white border-r border-gray-200 transition-all duration-300 ease-in-out
            w-80 lg:w-96 overflow-y-auto shadow-lg lg:shadow-none
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            lg:block
          `}
          style={{ height: "calc(100vh - 64px)" }}
        >
          <div className="sticky top-0 bg-white z-10 border-b border-gray-200">
            <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-gray-800">Course Content</h2>
                <div className="flex items-center gap-1 text-sm">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="font-semibold text-gray-700">
                    {completedCount}
                  </span>
                  <span className="text-gray-400">/{totalLectures}</span>
                </div>
              </div>
              <div className="relative">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {Math.round(progressPercentage)}% Complete • {completedCount}{" "}
                  of {totalLectures} lessons
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100 pb-20">
            {lectures.map((lecture, index) => {
              const isCompleted = isLectureCompleted(lecture._id);
              const isSelected = selectedLecture?._id === lecture._id;

              return (
                <div
                  key={lecture._id}
                  onClick={() => {
                    setSelectedLecture(lecture);
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className={`p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                    isSelected ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                          <span className="text-xs text-gray-400">
                            {index + 1}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${isSelected ? "text-blue-600" : "text-gray-700"}`}
                      >
                        {lecture.lectureTitle}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">
                          {formatDuration(lecture.duration)}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <Play className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Main Content - Video Player */}
        <main className="flex-1 min-w-0">
          {selectedLecture ? (
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="max-w-5xl mx-auto">
                {/* Video Player */}
                <div className="bg-black rounded-xl overflow-hidden shadow-2xl">
                  <div className="aspect-video">
                    {getVideoUrl(selectedLecture) ? (
                      <iframe
                        ref={videoRef}
                        src={getVideoUrl(selectedLecture)}
                        className="w-full h-full"
                        title={selectedLecture.lectureTitle}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-gray-900">
                        <Video className="w-16 h-16 mb-3 opacity-50" />
                        <p className="text-sm">Video preview not available</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Lecture Details */}
                <div className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                            Lesson{" "}
                            {lectures.findIndex(
                              (l) => l._id === selectedLecture._id,
                            ) + 1}
                          </span>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {formatDuration(selectedLecture.duration)}
                          </span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">
                          {selectedLecture.lectureTitle}
                        </h2>
                      </div>
                      {!isLectureCompleted(selectedLecture._id) ? (
                        <button
                          onClick={handleMarkComplete}
                          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition shadow-sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark as Complete
                        </button>
                      ) : (
                        <span className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-100 text-green-700 rounded-lg font-medium">
                          <CheckCircle className="w-4 h-4" />
                          Completed
                        </span>
                      )}
                    </div>

                    {selectedLecture.description && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <h3 className="font-semibold text-gray-700 mb-2">
                          About this lesson
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {selectedLecture.description}
                        </p>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Duration: {formatDuration(selectedLecture.duration)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          Lesson{" "}
                          {lectures.findIndex(
                            (l) => l._id === selectedLecture._id,
                          ) + 1}{" "}
                          of {lectures.length}
                        </span>
                      </div>

                      {/* Navigation Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const currentIndex = lectures.findIndex(
                              (l) => l._id === selectedLecture._id,
                            );
                            if (currentIndex > 0) {
                              setSelectedLecture(lectures[currentIndex - 1]);
                            }
                          }}
                          disabled={
                            lectures.findIndex(
                              (l) => l._id === selectedLecture._id,
                            ) === 0
                          }
                          className="px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => {
                            const currentIndex = lectures.findIndex(
                              (l) => l._id === selectedLecture._id,
                            );
                            if (currentIndex < lectures.length - 1) {
                              setSelectedLecture(lectures[currentIndex + 1]);
                            }
                          }}
                          disabled={
                            lectures.findIndex(
                              (l) => l._id === selectedLecture._id,
                            ) ===
                            lectures.length - 1
                          }
                          className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          Next Lesson
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[calc(100vh-64px)]">
              <div className="text-center p-8">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Select a lesson to begin
                </h3>
                <p className="text-gray-500 text-sm">
                  Choose a lesson from the sidebar to start learning
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CourseProgress;
