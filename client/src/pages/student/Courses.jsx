// pages/student/CourseCatalog.js
import React, { useState } from "react";
import {
  Star,
  Clock,
  ShoppingBag,
  Search,
  X,
  Layers,
  Heart,
  AlertCircle,
  User,
  BookOpen,
} from "lucide-react";
import { useGetAllPublishedCoursesQuery } from "../../features/api/courseApi";
import { useNavigate } from "react-router-dom";

// Skeleton Card Component
const CourseCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 animate-pulse">
      <div className="h-40 bg-gray-200 w-full" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="flex gap-2">
          <div className="h-3 bg-gray-200 rounded w-16" />
          <div className="h-3 bg-gray-200 rounded w-20" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <div className="h-6 bg-gray-200 rounded w-20" />
          <div className="h-8 bg-gray-200 rounded-lg w-20" />
        </div>
      </div>
    </div>
  );
};

// Course Card Component
const CourseCard = ({ course, onClick, onEnroll }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const getLevelStyles = (level) => {
    switch (level) {
      case "Beginner":
        return "bg-emerald-50 text-emerald-600";
      case "Intermediate":
        return "bg-amber-50 text-amber-600";
      case "Advanced":
        return "bg-rose-50 text-rose-600";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  const renderStars = () => {
    const rating = course.rating || 4.5;
    const fullStars = Math.floor(rating);
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < fullStars ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200"}`}
        />,
      );
    }
    return stars;
  };

  const getThumbnailUrl = () => {
    if (course.courseThumbnail) {
      if (course.courseThumbnail.startsWith("http")) {
        return course.courseThumbnail;
      }
      return `http://localhost:5000${course.courseThumbnail}`;
    }
    return "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=500&h=300&fit=crop";
  };

  const handleCardClick = (e) => {
    // Don't navigate if clicking on enroll button or save button
    if (
      e.target.closest(".enroll-button") ||
      e.target.closest(".save-button")
    ) {
      return;
    }
    onClick();
  };

  return (
    <div
      className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Image Section */}
      <div className="relative h-40 overflow-hidden bg-gray-100">
        <img
          src={getThumbnailUrl()}
          alt={course.courseTitle}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=500&h=300&fit=crop";
          }}
        />

        {/* Save Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsSaved(!isSaved);
          }}
          className="save-button absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all z-10"
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${isSaved ? "fill-red-500 text-red-500" : "text-gray-500"}`}
          />
        </button>

        {/* Category Tag */}
        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1">
          <Layers className="w-2.5 h-2.5" />
          {course.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Instructor */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="w-5 h-5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
            <User className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs text-gray-500 truncate">
            {course.creator?.name || "Instructor"}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-sm text-gray-800 line-clamp-2 mb-1.5 group-hover:text-indigo-600 transition-colors">
          {course.courseTitle}
        </h3>

        {/* Description Preview */}
        {course.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-2">
            {course.description}
          </p>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex items-center gap-0.5">{renderStars()}</div>
          <span className="text-xs font-semibold text-gray-700">
            {course.rating || 4.5}
          </span>
          <span className="text-[10px] text-gray-400">
            ({course.totalRatings || 0} ratings)
          </span>
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1 text-[10px] text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{course.totalDuration || "Coming soon"}</span>
          </div>
          <div
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${getLevelStyles(course.courseLevel)}`}
          >
            {course.courseLevel}
          </div>
        </div>

        {/* Price & Button */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-gray-900">
                ${course.coursePrice}
              </span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEnroll(course);
            }}
            className={`enroll-button flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-all duration-300 ${
              isHovered
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Enroll
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
const CourseCatalog = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all published courses
  const {
    data: coursesData,
    isLoading,
    error,
    refetch,
  } = useGetAllPublishedCoursesQuery();

  // Filter courses based on search term
  const filteredCourses =
    coursesData?.courses?.filter((course) => {
      if (!searchTerm) return true;
      return (
        course.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.creator?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }) || [];

  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  const handleEnroll = (course) => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to enroll in courses");
      navigate("/login");
      return;
    }

    alert(
      `🎉 You've enrolled in "${course.courseTitle}"!\n\nPrice: $${course.coursePrice}\nStart learning today!`,
    );
    // Here you would typically call an API to enroll the user
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-300 to-purple-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-indigo-200 via-white to-purple-500 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium shadow-sm animate-pulse">
                Loading Courses...
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Our Courses
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* Courses Grid with Skeletons */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array(8)
              .fill(0)
              .map((_, index) => (
                <CourseCardSkeleton key={`skeleton-${index}`} />
              ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-300 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Failed to Load Courses
          </h2>
          <p className="text-gray-600 mb-4">
            {error.data?.message ||
              "Unable to fetch courses. Please try again later."}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-300 to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-200 via-white to-purple-500 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium shadow-sm">
              <BookOpen className="w-4 h-4" />
              {filteredCourses.length} Courses Available
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Our Courses
              </span>
            </h1>

            {/* Description */}
            <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Explore our wide range of courses designed to help you master new
              skills and advance your career.
              <span className="block mt-2 font-medium text-gray-800">
                Start learning today and unlock your potential
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white/70 backdrop-blur-md border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="relative max-w-2xl mx-auto group">
            {/* Icon */}
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition" />
            </div>

            {/* Input */}
            <input
              type="text"
              placeholder="Search courses by title, category, or instructor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-gray-200 
                bg-white shadow-sm text-sm md:text-base
                focus:outline-none focus:ring-2 focus:ring-indigo-500
                transition-all duration-300 hover:shadow-md focus:shadow-lg"
            />

            {/* Clear Button */}
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-red-500 transition" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <p className="text-xs text-gray-500">
          {filteredCourses.length} course
          {filteredCourses.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-12">
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                onClick={() => handleCourseClick(course._id)}
                onEnroll={handleEnroll}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-700 mb-1">
              No courses found
            </h3>
            <p className="text-xs text-gray-500">
              {searchTerm
                ? `No courses matching "${searchTerm}"`
                : "No published courses available yet"}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 text-indigo-600 text-sm hover:underline"
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

export default CourseCatalog;
