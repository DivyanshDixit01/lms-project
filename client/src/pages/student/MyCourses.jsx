// pages/student/MyCourses.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Search,
  Filter,
  Clock,
  Calendar,
  ChevronRight,
  Award,
  TrendingUp,
  CheckCircle,
  Play,
  Share2,
  Star,
  Users,
  X,
  AlertCircle,
  Grid3x3,
  List,
  SlidersHorizontal,
  RefreshCw,
  User,
} from "lucide-react";
import { useGetUserPurchasesQuery } from "../../features/api/purchaseApi";
import { useGetCourseProgressQuery } from "../../features/api/courseProgressApi";

// ==================== SKELETON LOADER ====================
const CoursesSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-20 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-96" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                  <div className="h-8 bg-gray-200 rounded w-16" />
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-8 bg-gray-200 rounded-full w-20" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="h-40 bg-gray-200" />
              <div className="p-4">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="h-2 bg-gray-200 rounded-full mb-3" />
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-20" />
                  <div className="h-8 bg-gray-200 rounded w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==================== STAT CARD COMPONENT ====================
const StatCard = ({ icon: Icon, label, value, color }) => {
  const colorClasses = {
    indigo: "bg-indigo-50 text-indigo-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div
          className={`w-12 h-12 rounded-xl ${colorClasses[color]} flex items-center justify-center`}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

// ==================== COURSE CARD COMPONENT ====================
const CourseCard = ({
  course,
  progress,
  onContinue,
  onShare,
  viewMode = "grid",
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getLevelColor = (level) => {
    const colors = {
      Beginner: "bg-green-100 text-green-700",
      Intermediate: "bg-blue-100 text-blue-700",
      Advanced: "bg-purple-100 text-purple-700",
    };
    return colors[level] || "bg-gray-100 text-gray-700";
  };

  const getCategoryColor = (category) => {
    const colors = {
      "Frontend Development": "bg-blue-100 text-blue-700",
      "Backend Development": "bg-green-100 text-green-700",
      "Full Stack Development": "bg-purple-100 text-purple-700",
      "Mobile Development": "bg-orange-100 text-orange-700",
      "Data Science": "bg-indigo-100 text-indigo-700",
      DevOps: "bg-red-100 text-red-700",
      "Cloud Computing": "bg-cyan-100 text-cyan-700",
      Cybersecurity: "bg-yellow-100 text-yellow-700",
    };
    return colors[category] || "bg-gray-100 text-gray-700";
  };

  const getThumbnailUrl = () => {
    if (!course)
      return "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=400&h=250&fit=crop";
    if (course.courseThumbnail) {
      if (course.courseThumbnail.startsWith("http"))
        return course.courseThumbnail;
      return `http://localhost:5000${course.courseThumbnail}`;
    }
    return "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=400&h=250&fit=crop";
  };

  const getDuration = () => course?.totalDuration || "Coming soon";
  const progressPercent = Math.round(progress || 0);
  const instructorName =
    course?.creator?.name || course?.instructor || "Instructor";

  if (viewMode === "list") {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden group cursor-pointer">
        <div className="flex flex-col md:flex-row">
          <div className="relative md:w-64 h-48 md:h-auto">
            <img
              src={getThumbnailUrl()}
              alt={course?.courseTitle}
              className="w-full h-full object-cover"
              onError={(e) =>
                (e.target.src =
                  "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=400&h=250&fit=crop")
              }
            />
            <div className="absolute top-3 left-3 flex gap-2">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${getCategoryColor(course?.category)}`}
              >
                {course?.category || "Course"}
              </span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${getLevelColor(course?.courseLevel)}`}
              >
                {course?.courseLevel || "Beginner"}
              </span>
            </div>
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
              <span className="text-xs font-semibold text-white">
                {progressPercent}%
              </span>
            </div>
          </div>
          <div className="flex-1 p-5">
            <h3 className="font-semibold text-gray-800 text-lg mb-1 line-clamp-1">
              {course?.courseTitle}
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <User className="w-3.5 h-3.5 text-gray-400" />
              <p className="text-sm text-gray-500">{instructorName}</p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{getDuration()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-500" />
                <span>{course?.rating || 4.8}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{course?.enrolledStudents?.length || 0} students</span>
              </div>
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span className="font-medium text-indigo-600">
                  {progressPercent}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>Last accessed: {formatDate(course?.lastAccessed)}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare(course);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onContinue(course);
                  }}
                  className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium"
                >
                  <Play className="w-3.5 h-3.5" /> Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onContinue(course)}
      className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={getThumbnailUrl()}
          alt={course?.courseTitle}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) =>
            (e.target.src =
              "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=400&h=250&fit=crop")
          }
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${getCategoryColor(course?.category)}`}
          >
            {course?.category || "Course"}
          </span>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${getLevelColor(course?.courseLevel)}`}
          >
            {course?.courseLevel || "Beginner"}
          </span>
        </div>
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1">
          <span className="text-xs font-semibold text-white">
            {progressPercent}%
          </span>
        </div>
        {progressPercent === 100 && (
          <div className="absolute bottom-3 left-3 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
            <Award className="w-3 h-3" /> Completed
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">
          {course?.courseTitle}
        </h3>
        <div className="flex items-center gap-1 mb-3">
          <User className="w-3 h-3 text-gray-400" />
          <p className="text-xs text-gray-500">{instructorName}</p>
        </div>
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span className="font-medium text-indigo-600">
              {progressPercent}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{getDuration()}</span>
          </div>
          <button className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors text-sm font-medium">
            Continue <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== FILTER MODAL ====================
const FilterModal = ({
  isOpen,
  onClose,
  categories,
  levels,
  selectedCategory,
  selectedLevel,
  onApplyFilters,
}) => {
  const [localCategory, setLocalCategory] = useState(selectedCategory);
  const [localLevel, setLocalLevel] = useState(selectedLevel);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              Filter Courses
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setLocalCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${localCategory === cat ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Level
            </label>
            <div className="flex flex-wrap gap-2">
              {levels.map((level) => (
                <button
                  key={level}
                  onClick={() => setLocalLevel(level)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${localLevel === level ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                setLocalCategory("All");
                setLocalLevel("All");
                onApplyFilters("All", "All");
                onClose();
              }}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Reset All
            </button>
            <button
              onClick={() => {
                onApplyFilters(localCategory, localLevel);
                onClose();
              }}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN MY COURSES COMPONENT ====================
const MyCourses = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [viewMode, setViewMode] = useState("grid");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  const { data: purchasesData, isLoading: purchasesLoading } =
    useGetUserPurchasesQuery();
  const purchases = purchasesData?.data || [];

  // Get all course IDs
  const courseIds = purchases.map((p) => p.courseId?._id).filter(Boolean);

  // Fetch progress for each course using individual hooks
  // This creates an array of hook results
  const progressResults = {};
  courseIds.forEach((courseId) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data: progressData } = useGetCourseProgressQuery(courseId, {
      skip: !courseId,
    });
    if (progressData?.data) {
      progressResults[courseId] = progressData.data.progressPercentage || 0;
    }
  });

  // Extract unique categories from real courses
  const categories = [
    "All",
    ...new Set(purchases.map((p) => p.courseId?.category).filter(Boolean)),
  ];
  const levels = ["All", "Beginner", "Intermediate", "Advanced"];

  const filteredCourses = purchases.filter((purchase) => {
    const course = purchase.courseId;
    if (!course) return false;
    const matchesSearch =
      !searchQuery ||
      course.courseTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.creator?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || course.category === selectedCategory;
    const matchesLevel =
      selectedLevel === "All" || course.courseLevel === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const totalCourses = purchases.length;
  const completedCourses = purchases.filter(
    (p) => (progressResults[p.courseId?._id] || 0) === 100,
  ).length;
  const inProgressCourses = purchases.filter((p) => {
    const progress = progressResults[p.courseId?._id] || 0;
    return progress > 0 && progress < 100;
  }).length;
  const avgProgress =
    totalCourses > 0
      ? Math.round(
          purchases.reduce(
            (acc, p) => acc + (progressResults[p.courseId?._id] || 0),
            0,
          ) / totalCourses,
        )
      : 0;

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleContinueCourse = (course) => {
    navigate(`/course-progress/${course._id}`);
  };

  const handleShareCourse = (course) => {
    navigator.clipboard.writeText(
      `Check out ${course.courseTitle} on Learning Platform!`,
    );
    showNotification(`Link to ${course.courseTitle} copied!`, "success");
  };

  const handleApplyFilters = (category, level) => {
    setSelectedCategory(category);
    setSelectedLevel(level);
  };

  const handleResetFilters = () => {
    setSelectedCategory("All");
    setSelectedLevel("All");
    setSearchQuery("");
  };

  if (purchasesLoading) {
    return <CoursesSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {notification && (
        <div className="fixed top-24 right-4 z-50 animate-slide-in">
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${notification.type === "success" ? "bg-green-500" : "bg-blue-500"} text-white`}
          >
            {notification.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="text-sm">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Learning</h1>
          <p className="text-gray-500">
            Continue your journey and track your progress
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={BookOpen}
            label="Total Courses"
            value={totalCourses}
            color="indigo"
          />
          <StatCard
            icon={CheckCircle}
            label="Completed"
            value={completedCourses}
            color="green"
          />
          <StatCard
            icon={TrendingUp}
            label="Avg Progress"
            value={`${avgProgress}%`}
            color="purple"
          />
          <StatCard
            icon={Clock}
            label="In Progress"
            value={inProgressCourses}
            color="orange"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses by title or instructor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-500"}`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-500"}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" /> Filters
            </button>
            {(selectedCategory !== "All" ||
              selectedLevel !== "All" ||
              searchQuery) && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-gray-700"
              >
                <RefreshCw className="w-4 h-4" /> Reset
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedCategory === cat ? "bg-indigo-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-medium text-gray-700">
              {filteredCourses.length}
            </span>{" "}
            courses
          </p>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              No courses found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ||
              selectedCategory !== "All" ||
              selectedLevel !== "All"
                ? "Try adjusting your search or filters"
                : "You haven't enrolled in any courses yet"}
            </p>
            {searchQuery ||
            selectedCategory !== "All" ||
            selectedLevel !== "All" ? (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Clear all filters
              </button>
            ) : (
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Browse Courses
              </button>
            )}
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {filteredCourses.map((purchase) => {
              const course = purchase.courseId;
              const progress = progressResults[course?._id] || 0;
              return (
                <CourseCard
                  key={purchase._id}
                  course={course}
                  progress={progress}
                  onContinue={handleContinueCourse}
                  onShare={handleShareCourse}
                  viewMode={viewMode}
                />
              );
            })}
          </div>
        )}
      </div>

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        categories={categories}
        levels={levels}
        selectedCategory={selectedCategory}
        selectedLevel={selectedLevel}
        onApplyFilters={handleApplyFilters}
      />

      <style>{`
        @keyframes slide-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
};

export default MyCourses;
