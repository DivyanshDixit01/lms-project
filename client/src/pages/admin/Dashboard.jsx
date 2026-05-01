// pages/admin/Dashboard.js
import React, { useState } from "react";
import {
  BookOpen,
  Users,
  DollarSign,
  Star,
  PlusCircle,
  TrendingUp,
  Award,
  Calendar,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Loader,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  useGetCreatorCoursesQuery,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
} from "../../features/api/courseApi";
import toast, { Toaster } from "react-hot-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const {
    data: coursesData,
    isLoading: coursesLoading,
    error: coursesError,
    refetch,
  } = useGetCreatorCoursesQuery();

  const [updateCourse] = useUpdateCourseMutation();
  const [deleteCourse] = useDeleteCourseMutation();

  // Get courses from the response
  const courses = coursesData?.courses || [];

  // Calculate stats based on actual courses data
  const calculateStats = () => {
    if (!courses.length) {
      return {
        totalCourses: 0,
        totalStudents: 0,
        totalRevenue: 0,
        avgRating: 0,
        monthlyGrowth: 0,
      };
    }

    const totalCourses = courses.length;
    const totalStudents = courses.reduce(
      (sum, course) => sum + (course.enrolledStudents?.length || 0),
      0,
    );
    const totalRevenue = courses.reduce(
      (sum, course) => sum + (course.coursePrice || 0),
      0,
    );

    const avgRating =
      courses.reduce((sum, course) => sum + (course.avgRating || 0), 0) /
        totalCourses || 0;

    return {
      totalCourses,
      totalStudents,
      totalRevenue,
      avgRating: avgRating.toFixed(1),
      monthlyGrowth: 23,
    };
  };

  const stats = calculateStats();

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Handle publish/unpublish
  const handleTogglePublish = async (courseId, currentStatus) => {
    setUpdatingId(courseId);
    try {
      await updateCourse({
        id: courseId,
        isPublished: !currentStatus,
      }).unwrap();

      toast.success(
        `Course ${!currentStatus ? "published" : "unpublished"} successfully!`,
      );
      refetch();
    } catch (error) {
      console.error("Error toggling publish status:", error);
      toast.error(error.data?.message || "Failed to update course status");
    } finally {
      setUpdatingId(null);
    }
  };

  // Handle delete course
  const handleDeleteCourse = async (courseId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this course? This action cannot be undone.",
    );

    if (!confirmDelete) return;

    setDeletingId(courseId);
    try {
      await deleteCourse(courseId).unwrap();
      toast.success("Course deleted successfully!");
      refetch();
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error(error.data?.message || "Failed to delete course");
    } finally {
      setDeletingId(null);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color, trend }) => {
    const colorClasses = {
      indigo: "bg-indigo-50 text-indigo-600",
      green: "bg-green-50 text-green-600",
      purple: "bg-purple-50 text-purple-600",
      orange: "bg-orange-50 text-orange-600",
      blue: "bg-blue-50 text-blue-600",
    };

    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-12 h-12 rounded-xl ${colorClasses[color]} flex items-center justify-center`}
          >
            <Icon className="w-6 h-6" />
          </div>
          {trend > 0 && (
            <span className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" />+{trend}%
            </span>
          )}
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
      </div>
    );
  };

  if (coursesLoading) {
    return (
      <div className="p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-32"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (coursesError) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <h3 className="font-semibold mb-2">Error Loading Dashboard</h3>
          <p>Failed to load courses. Please try again later.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500 mt-2">
          Welcome back! Here's an overview of your courses
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={BookOpen}
          label="Total Courses"
          value={stats.totalCourses}
          color="indigo"
          trend={stats.monthlyGrowth}
        />
        <StatCard
          icon={Users}
          label="Total Students"
          value={stats.totalStudents.toLocaleString()}
          color="green"
          trend={stats.totalStudents > 0 ? 8 : 0}
        />
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          color="purple"
          trend={stats.totalRevenue > 0 ? 23 : 0}
        />
        <StatCard
          icon={Star}
          label="Average Rating"
          value={`${stats.avgRating}/5`}
          color="orange"
        />
      </div>

      {/* Courses Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Your Courses
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {courses.length === 0
                ? "You haven't created any courses yet"
                : `Total ${courses.length} course${courses.length > 1 ? "s" : ""}`}
            </p>
          </div>
          <Link
            to="/dashboard/create-course"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Add New Course
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No courses yet
            </h3>
            <p className="text-gray-500 mb-4">
              Get started by creating your first course
            </p>
            <Link
              to="/dashboard/create-course"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Create Your First Course
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Students
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {courses.map((course) => (
                  <tr
                    key={course._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {course.courseThumbnail ? (
                          <img
                            src={`http://localhost:5000${course.courseThumbnail}`}
                            alt={course.courseTitle}
                            className="w-12 h-12 rounded-lg object-cover cursor-pointer"
                            onClick={() =>
                              navigate(`/dashboard/edit-course/${course._id}`)
                            }
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/48x48?text=No+Image";
                            }}
                          />
                        ) : (
                          <div
                            className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer"
                            onClick={() =>
                              navigate(`/dashboard/edit-course/${course._id}`)
                            }
                          >
                            <BookOpen className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p
                            className="font-medium text-gray-800 cursor-pointer hover:text-indigo-600"
                            onClick={() =>
                              navigate(`/dashboard/edit-course/${course._id}`)
                            }
                          >
                            {course.courseTitle}
                          </p>
                          <p className="text-xs text-gray-500">
                            {course.subTitle || "No subtitle"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {course.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          course.courseLevel === "Beginner"
                            ? "bg-green-100 text-green-700"
                            : course.courseLevel === "Intermediate"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {course.courseLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{course.enrolledStudents?.length || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-800">
                        ${course.coursePrice}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          course.isPublished
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {course.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(course.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            navigate(`/dashboard/edit-course/${course._id}`)
                          }
                          className="p-1 text-indigo-600 hover:text-indigo-800 transition-colors"
                          title="Edit Course"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleTogglePublish(course._id, course.isPublished)
                          }
                          disabled={updatingId === course._id}
                          className={`p-1 transition-colors ${
                            course.isPublished
                              ? "text-yellow-600 hover:text-yellow-800"
                              : "text-green-600 hover:text-green-800"
                          } disabled:opacity-50`}
                          title={course.isPublished ? "Unpublish" : "Publish"}
                        >
                          {updatingId === course._id ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : course.isPublished ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course._id)}
                          disabled={deletingId === course._id}
                          className="p-1 text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                          title="Delete Course"
                        >
                          {deletingId === course._id ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <PlusCircle className="w-10 h-10 mb-4 opacity-90" />
              <h3 className="text-xl font-semibold mb-2">Create New Course</h3>
              <p className="text-sm opacity-90 mb-4">
                Expand your platform by adding a new course
              </p>
              <Link
                to="/dashboard/create-course"
                className="inline-block bg-white/20 hover:bg-white/30 px-5 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
            <Award className="w-16 h-16 opacity-20" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <Users className="w-10 h-10 mb-4 opacity-90" />
              <h3 className="text-xl font-semibold mb-2">Manage Users</h3>
              <p className="text-sm opacity-90 mb-4">
                View and manage all platform users
              </p>
              <Link
                to="/dashboard/users"
                className="inline-block bg-white/20 hover:bg-white/30 px-5 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                View Users
              </Link>
            </div>
            <TrendingUp className="w-16 h-16 opacity-20" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
