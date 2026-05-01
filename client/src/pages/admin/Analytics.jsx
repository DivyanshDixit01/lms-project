import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  TrendingUp,
  DollarSign,
  BookOpen,
  Download,
  Calendar,
  Loader,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import {
  useGetAnalyticsSummaryQuery,
  useGetDashboardMetricsQuery,
  useGetEngagementMetricsQuery,
  useGetConversionMetricsQuery,
  useGetCohortAnalysisQuery,
} from "../../features/api/analyticsApi";

const Analytics = () => {
  const [timePeriod, setTimePeriod] = useState("monthly");
  const [activeTab, setActiveTab] = useState("overview");

  // API calls
  const { data: summaryData, isLoading: summaryLoading } = useGetAnalyticsSummaryQuery();
  const { data: metricsData, isLoading: metricsLoading } = useGetDashboardMetricsQuery({ period: timePeriod });
  const { data: engagementData, isLoading: engagementLoading } = useGetEngagementMetricsQuery({});
  const { data: conversionData, isLoading: conversionLoading } = useGetConversionMetricsQuery({});
  const { data: cohortData, isLoading: cohortLoading } = useGetCohortAnalysisQuery({ cohortType: "signup_date" });

  // Transform revenue data for charts
  const revenueData = useMemo(() => {
    return metricsData?.data?.map((item) => ({
      month: item.month || "N/A",
      revenue: item.revenue || 0,
      transactions: item.transactions || 0,
    })) || [];
  }, [metricsData]);

  // Transform engagement data
  const engagementChartData = useMemo(() => {
    return engagementData?.data || [];
  }, [engagementData]);

  // Transform course performance data
  const coursePerformance = useMemo(() => {
    return metricsData?.byCourse?.map((course, index) => ({
      id: course.courseId,
      name: `Course ${index + 1}`,
      enrollments: course.enrollments || 0,
      revenue: course.revenue || 0,
    })) || [];
  }, [metricsData]);

  // Transform cohort data
  const cohortChartData = useMemo(() => {
    return cohortData?.data?.slice(0, 6).map((cohort) => ({
      name: cohort.cohortName,
      revenue: cohort.metrics?.totalRevenue || 0,
      users: cohort.userCount || 0,
      retention: cohort.metrics?.retentionRate || 0,
    })) || [];
  }, [cohortData]);

  const COLORS = ["#4f46e5", "#7c3aed", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"];

  const StatCard = ({ icon: Icon, label, value, trend, color, loading }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full ${
            trend >= 0 
              ? "text-green-600 bg-green-50" 
              : "text-red-600 bg-red-50"
          }`}>
            {trend >= 0 ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-800">
        {loading ? (
          <Loader className="w-5 h-5 animate-spin" />
        ) : (
          value
        )}
      </p>
    </div>
  );

  const handleExport = (format) => {
    try {
      const data = {
        summary: summaryData?.summary,
        metrics: metricsData?.data,
        engagement: engagementData?.metrics,
        conversion: conversionData?.metrics,
        exportDate: new Date().toISOString(),
      };

      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `analytics-${new Date().toISOString().split("T")[0]}.${format}`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error("Failed to export data");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
        <p className="text-gray-500 mt-2">
          Real-time platform performance and user engagement metrics
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Period
              </label>
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleExport("json")}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </button>
            <button
              onClick={() => handleExport("csv")}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-200">
        {["overview", "engagement", "conversion", "cohorts"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === tab
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Users}
              label="Total Users"
              value={summaryData?.summary?.totalUsers || "0"}
              trend={12}
              color="bg-indigo-600"
              loading={summaryLoading}
            />
            <StatCard
              icon={BookOpen}
              label="Total Courses"
              value={summaryData?.summary?.totalCourses || "0"}
              trend={8}
              color="bg-purple-600"
              loading={summaryLoading}
            />
            <StatCard
              icon={DollarSign}
              label="Total Revenue"
              value={`$${(summaryData?.summary?.totalRevenue || 0).toLocaleString()}`}
              trend={23}
              color="bg-green-600"
              loading={summaryLoading}
            />
            <StatCard
              icon={TrendingUp}
              label="Total Purchases"
              value={summaryData?.summary?.totalPurchases || "0"}
              trend={5}
              color="bg-orange-600"
              loading={summaryLoading}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Revenue Trend */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Revenue Trend
              </h3>
              {metricsLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <Loader className="w-6 h-6 animate-spin text-indigo-600" />
                </div>
              ) : revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#4f46e5"
                      strokeWidth={2}
                      name="Revenue"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </div>

            {/* Transactions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Transactions
              </h3>
              {metricsLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <Loader className="w-6 h-6 animate-spin text-indigo-600" />
                </div>
              ) : revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="transactions" fill="#7c3aed" name="Transactions" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </div>
          </div>

          {/* Course Performance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Course Performance
            </h3>
            {metricsLoading ? (
              <div className="h-80 flex items-center justify-center">
                <Loader className="w-6 h-6 animate-spin text-indigo-600" />
              </div>
            ) : coursePerformance.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Enrollments
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {coursePerformance.map((course, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-800">
                          {course.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {course.enrollments}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-800">
                          ${course.revenue.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                No course data available
              </div>
            )}
          </div>
        </>
      )}

      {/* Engagement Tab */}
      {activeTab === "engagement" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Engagement Metrics
          </h3>
          {engagementLoading ? (
            <div className="h-80 flex items-center justify-center">
              <Loader className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
          ) : engagementChartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={engagementChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completion" fill="#4f46e5" name="Completion %" />
                  <Bar dataKey="retention" fill="#7c3aed" name="Retention %" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-indigo-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Unique Users</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {engagementData?.metrics?.uniqueUsers || 0}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Avg Engagement Time</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {engagementData?.metrics?.averageEngagementTime || 0}s
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              No engagement data available
            </div>
          )}
        </div>
      )}

      {/* Conversion Tab */}
      {activeTab === "conversion" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Conversion Metrics
            </h3>
            {conversionLoading ? (
              <div className="h-80 flex items-center justify-center">
                <Loader className="w-6 h-6 animate-spin text-indigo-600" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-indigo-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Conversion Rate</p>
                  <p className="text-3xl font-bold text-indigo-600">
                    {conversionData?.metrics?.conversionRate || 0}%
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-600">
                    ${(conversionData?.metrics?.totalRevenue || 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Avg Revenue Per User</p>
                  <p className="text-3xl font-bold text-purple-600">
                    ${conversionData?.metrics?.averageRevenuePerUser || 0}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Transaction Summary
            </h3>
            {conversionLoading ? (
              <div className="h-80 flex items-center justify-center">
                <Loader className="w-6 h-6 animate-spin text-indigo-600" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Transactions</span>
                  <span className="text-2xl font-bold text-gray-800">
                    {conversionData?.metrics?.totalTransactions || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Completed Transactions</span>
                  <span className="text-2xl font-bold text-green-600">
                    {conversionData?.metrics?.completedTransactions || 0}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cohorts Tab */}
      {activeTab === "cohorts" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            User Cohorts Analysis
          </h3>
          {cohortLoading ? (
            <div className="h-80 flex items-center justify-center">
              <Loader className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
          ) : cohortChartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cohortChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#4f46e5" name="Revenue" />
                  <Bar dataKey="users" fill="#7c3aed" name="Users" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-6 overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Cohort
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Users
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Retention
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {cohortData?.data?.map((cohort, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-800">
                          {cohort.cohortName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {cohort.userCount}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-800">
                          ${(cohort.metrics?.totalRevenue || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {(cohort.metrics?.retentionRate || 0).toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              No cohort data available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Analytics;
