import React, { useEffect } from "react";
import { useTestAdminQuery, useGetDashboardAnalyticsQuery, useGetAllUsersQuery, useGetAllCoursesQuery, useGetAllPaymentsQuery, useGetModerationStatsQuery } from "../../features/api/adminApi";
import { Users, BookOpen, CreditCard, TrendingUp, AlertCircle } from "lucide-react";

const AdminDashboard = () => {
  // Test connection first
  const { data: testData, isLoading: testLoading, error: testError } = useTestAdminQuery();
  
  const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError } = useGetDashboardAnalyticsQuery();
  const { data: usersData, isLoading: usersLoading, error: usersError } = useGetAllUsersQuery({ page: 1, limit: 5 });
  const { data: coursesData, isLoading: coursesLoading, error: coursesError } = useGetAllCoursesQuery({ page: 1, limit: 5 });
  const { data: paymentsData, isLoading: paymentsLoading, error: paymentsError } = useGetAllPaymentsQuery({ page: 1, limit: 5 });
  const { data: moderationData, isLoading: moderationLoading, error: moderationError } = useGetModerationStatsQuery();

  // Debug logging
  useEffect(() => {
    console.log("=== ADMIN DASHBOARD DEBUG ===");
    console.log("Test Data:", testData);
    console.log("Test Error:", testError);
    console.log("Analytics Error:", analyticsError);
    console.log("Users Error:", usersError);
    console.log("Courses Error:", coursesError);
    console.log("Payments Error:", paymentsError);
    console.log("Moderation Error:", moderationError);
  }, [testData, testError, analyticsError, usersError, coursesError, paymentsError, moderationError]);

  const isLoading = testLoading || analyticsLoading || usersLoading || coursesLoading || paymentsLoading || moderationLoading;
  const hasError = testError || analyticsError || usersError || coursesError || paymentsError || moderationError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 dark:text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4 font-bold">Error loading dashboard data</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            {testError && <p>Test Connection: {testError?.data?.message || testError?.message || "Failed"}</p>}
            {analyticsError && <p>Analytics: {analyticsError?.data?.message || analyticsError?.message || "Failed"}</p>}
            {usersError && <p>Users: {usersError?.data?.message || usersError?.message || "Failed"}</p>}
            {coursesError && <p>Courses: {coursesError?.data?.message || coursesError?.message || "Failed"}</p>}
            {paymentsError && <p>Payments: {paymentsError?.data?.message || paymentsError?.message || "Failed"}</p>}
            {moderationError && <p>Moderation: {moderationError?.data?.message || moderationError?.message || "Failed"}</p>}
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const analytics = analyticsData?.analytics || {};
  const users = usersData?.users || [];
  const courses = coursesData?.courses || [];
  const payments = paymentsData?.payments || [];
  const moderationStats = moderationData?.stats || {};

  const cards = [
    {
      icon: Users,
      label: "Total Users",
      value: analytics.totalUsers || 0,
      color: "indigo",
    },
    {
      icon: Users,
      label: "Active Users",
      value: analytics.activeUsers || 0,
      color: "green",
    },
    {
      icon: BookOpen,
      label: "Total Courses",
      value: analytics.totalCourses || 0,
      color: "blue",
    },
    {
      icon: CreditCard,
      label: "Total Revenue",
      value: `$${(analytics.totalRevenue || 0).toFixed(2)}`,
      color: "purple",
    },
    {
      icon: TrendingUp,
      label: "Completions",
      value: analytics.completionRate || 0,
      color: "orange",
    },
  ];

  const colorClasses = {
    indigo: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
    green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Welcome to the admin dashboard. Here's an overview of your platform.
        </p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {card.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {card.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${colorClasses[card.color]}`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Moderation Stats */}
      {moderationStats.totalFlagged > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-900 dark:text-yellow-200">
              {moderationStats.pendingFlagged} items pending moderation
            </p>
            <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
              Review flagged content to maintain platform quality
            </p>
          </div>
        </div>
      )}

      {/* Recent Users */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Users</h2>
        {users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{user.name}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === 'active' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400 text-center py-8">No users found</p>
        )}
      </div>

      {/* Recent Courses */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Courses</h2>
        {courses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Title</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Instructor</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Students</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course._id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{course.courseTitle}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{course.creator?.name || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        course.status === 'published'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : course.status === 'draft'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                      }`}>
                        {course.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{course.enrollmentCount || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400 text-center py-8">No courses found</p>
        )}
      </div>

      {/* Recent Payments */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Payments</h2>
        {payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Course</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{payment.userId?.name || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{payment.courseId?.courseTitle || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">${payment.amount?.toFixed(2) || '0.00'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'completed'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : payment.status === 'pending'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400 text-center py-8">No payments found</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
