import React, { useState } from "react";
import { useGetAllCoursesQuery, useApproveCourseMutation, useRejectCourseMutation, useArchiveCourseMutation } from "../../features/api/adminApi";
import { Search, CheckCircle, XCircle, Archive, Eye } from "lucide-react";

const CourseManagement = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);

  const { data, isLoading, error } = useGetAllCoursesQuery({
    page,
    limit: 10,
    search,
    status,
  });

  const [approveCourse] = useApproveCourseMutation();
  const [rejectCourse] = useRejectCourseMutation();
  const [archiveCourse] = useArchiveCourseMutation();

  const courses = data?.courses || [];
  const pagination = data?.pagination || {};

  const handleApprove = async (courseId) => {
    if (window.confirm("Are you sure you want to approve this course?")) {
      try {
        await approveCourse(courseId).unwrap();
        alert("Course approved successfully");
      } catch (error) {
        alert("Error approving course: " + error.message);
      }
    }
  };

  const handleReject = async (courseId) => {
    const reason = prompt("Enter rejection reason:");
    if (reason) {
      try {
        await rejectCourse({ courseId, reason }).unwrap();
        alert("Course rejected successfully");
      } catch (error) {
        alert("Error rejecting course: " + error.message);
      }
    }
  };

  const handleArchive = async (courseId) => {
    if (window.confirm("Are you sure you want to archive this course?")) {
      try {
        await archiveCourse(courseId).unwrap();
        alert("Course archived successfully");
      } catch (error) {
        alert("Error archiving course: " + error.message);
      }
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading courses...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error loading courses</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Course Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage and approve courses</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              &nbsp;
            </label>
            <button
              onClick={() => {
                setSearch("");
                setStatus("");
                setPage(1);
              }}
              className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Instructor
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Students
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {courses.length > 0 ? (
                courses.map((course) => (
                  <tr
                    key={course._id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {course.courseTitle}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {course.creator?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          course.status === "published"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                            : course.status === "draft"
                            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {course.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {course.enrollmentCount || 0}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedCourse(course)}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {course.status === "draft" && (
                          <>
                            <button
                              onClick={() => handleApprove(course._id)}
                              className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(course._id)}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {course.status === "published" && (
                          <button
                            onClick={() => handleArchive(course._id)}
                            className="p-2 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded"
                            title="Archive"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-600 dark:text-gray-400">
                    No courses found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Page {pagination.page} of {pagination.pages} ({pagination.total} total)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                disabled={page === pagination.pages}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Course Details Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Course Details</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Title</p>
                <p className="text-gray-900 dark:text-white">{selectedCourse.courseTitle}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Instructor</p>
                <p className="text-gray-900 dark:text-white">{selectedCourse.creator?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <p className="text-gray-900 dark:text-white">{selectedCourse.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Students Enrolled</p>
                <p className="text-gray-900 dark:text-white">{selectedCourse.enrollmentCount || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Description</p>
                <p className="text-gray-900 dark:text-white text-sm">
                  {selectedCourse.description || "No description"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedCourse(null)}
              className="mt-6 w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
