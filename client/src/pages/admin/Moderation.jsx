import React, { useState } from "react";
import {
  Flag,
  AlertCircle,
  CheckCircle,
  Trash2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Loader,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useGetAllFlagsQuery, useGetModerationStatsQuery, useApproveFlagMutation, useRemoveFlagMutation } from "../../features/api/moderationApi";

const Moderation = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [reasonFilter, setReasonFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState(""); // approve, remove, warn
  const [actionReason, setActionReason] = useState("");

  // API calls
  const { data: flagsData, isLoading: flagsLoading, error: flagsError } = useGetAllFlagsQuery({
    page: currentPage,
    limit: 10,
    status: statusFilter,
    reason: reasonFilter,
    search: searchTerm,
  });

  const { data: statsData, isLoading: statsLoading } = useGetModerationStatsQuery();
  const [approveFlag, { isLoading: approveLoading }] = useApproveFlagMutation();
  const [removeFlag, { isLoading: removeLoading }] = useRemoveFlagMutation();

  const itemsPerPage = 10;

  // Calculate stats from API data
  const calculateStats = () => {
    if (!statsData?.stats) {
      return {
        pending: 0,
        reviewed: 0,
        approved: 0,
        removed: 0,
      };
    }

    return {
      pending: statsData.stats.pending || 0,
      reviewed: statsData.stats.reviewed || 0,
      approved: statsData.stats.approved || 0,
      removed: statsData.stats.removed || 0,
    };
  };

  const stats = calculateStats();

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );

  const getFlagReasonColor = (reason) => {
    switch (reason) {
      case "inappropriate":
        return "bg-red-100 text-red-700";
      case "spam":
        return "bg-orange-100 text-orange-700";
      case "harassment":
        return "bg-pink-100 text-pink-700";
      case "copyright":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "reviewed":
        return "bg-blue-100 text-blue-700";
      case "approved":
        return "bg-green-100 text-green-700";
      case "removed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleAction = async () => {
    if (!actionReason) {
      toast.error("Please provide a reason for this action");
      return;
    }

    try {
      if (actionType === "approve") {
        await approveFlag({
          id: selectedFlag._id,
          moderationReason: actionReason,
        }).unwrap();
      } else if (actionType === "remove") {
        await removeFlag({
          id: selectedFlag._id,
          moderationReason: actionReason,
        }).unwrap();
      }

      toast.success(`Content ${actionType}d successfully`);
      setShowActionDialog(false);
      setActionType("");
      setActionReason("");
      setSelectedFlag(null);
    } catch (error) {
      toast.error(error?.data?.message || `Failed to ${actionType} content`);
    }
  };



  return (
    <div className="p-8">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Moderation Dashboard</h1>
        <p className="text-gray-500 mt-2">
          Review and manage flagged content
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={AlertCircle}
          label="Pending Review"
          value={stats.pending}
          color="bg-yellow-50 text-yellow-600"
        />
        <StatCard
          icon={MessageSquare}
          label="Reviewed"
          value={stats.reviewed}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={CheckCircle}
          label="Approved"
          value={stats.approved}
          color="bg-green-50 text-green-600"
        />
        <StatCard
          icon={Trash2}
          label="Removed"
          value={stats.removed}
          color="bg-red-50 text-red-600"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search content or user..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="approved">Approved</option>
            <option value="removed">Removed</option>
          </select>

          {/* Reason Filter */}
          <select
            value={reasonFilter}
            onChange={(e) => {
              setReasonFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Reasons</option>
            <option value="inappropriate">Inappropriate</option>
            <option value="spam">Spam</option>
            <option value="harassment">Harassment</option>
            <option value="copyright">Copyright</option>
          </select>

          {/* Placeholder for alignment */}
          <div></div>
        </div>
      </div>

      {/* Flagged Content Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Content
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Reported User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {flagsLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <Loader className="w-6 h-6 animate-spin mx-auto text-indigo-600" />
                  </td>
                </tr>
              ) : flagsError ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <div className="text-red-600">
                      <p className="font-medium">Error loading flagged content</p>
                      <p className="text-sm text-gray-500 mt-1">{flagsError?.data?.message || "Failed to fetch moderation data"}</p>
                    </div>
                  </td>
                </tr>
              ) : flagsData?.flags && flagsData.flags.length > 0 ? (
                flagsData.flags.map((flag) => (
                  <tr key={flag._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {flag.contentType}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {flag.contentPreview}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getFlagReasonColor(flag.flagReason)}`}
                      >
                        {flag.flagReason}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {flag.reportedUserEmail}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(flag.status)}`}
                      >
                        {flag.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(flag.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {flag.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedFlag(flag);
                              setActionType("approve");
                              setShowActionDialog(true);
                            }}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedFlag(flag);
                              setActionType("remove");
                              setShowActionDialog(true);
                            }}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No flagged content found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {flagsData?.pagination && flagsData.pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Page {flagsData.pagination.page} of {flagsData.pagination.pages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(flagsData.pagination.pages, currentPage + 1))
                }
                disabled={currentPage === flagsData.pagination.pages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Dialog */}
      {showActionDialog && selectedFlag && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {actionType === "approve" ? "Approve Content" : "Remove Content"}
            </h2>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Content:</span>
              </p>
              <p className="text-sm text-gray-700 line-clamp-3">
                {selectedFlag.contentPreview}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {actionType === "approve" ? "Approval" : "Removal"} Reason
              </label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Enter reason for this action..."
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowActionDialog(false);
                  setActionType("");
                  setActionReason("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                className={`flex-1 px-4 py-2 text-white rounded-lg ${
                  actionType === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {actionType === "approve" ? "Approve" : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Moderation;
