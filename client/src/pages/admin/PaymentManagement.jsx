import React, { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useGetAllPaymentsQuery, useGetPaymentStatsQuery, useProcessRefundMutation } from "../../features/api/paymentApi";

const StatCard = ({ icon: Icon, label, value, trend }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
        <Icon className="w-6 h-6 text-indigo-600" />
      </div>
      {trend > 0 && (
        <span className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
          <TrendingUp className="w-3 h-3" />
          +{trend}%
        </span>
      )}
    </div>
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
  </div>
);

const PaymentManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [refundAmount, setRefundAmount] = useState("");

  // API calls
  const { data: paymentsData, isLoading: paymentsLoading, error: paymentsError } = useGetAllPaymentsQuery({
    page: currentPage,
    limit: 10,
    status: statusFilter,
    search: searchTerm,
  });

  const { data: statsData } = useGetPaymentStatsQuery();
  const [processRefund] = useProcessRefundMutation();

  // Calculate stats from API data
  const calculateStats = () => {
    if (!statsData?.stats) {
      return {
        totalRevenue: 0,
        totalTransactions: 0,
        averageValue: 0,
        completedCount: 0,
      };
    }

    const stats = statsData.stats;
    console.log("Stats from API:", stats);
    
    return {
      totalRevenue: stats.totalRevenue || 0,
      totalTransactions: stats.totalPayments || 0,
      averageValue: stats.averageValue || 0,
      completedCount: stats.completedPayments || 0,
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

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "failed":
        return "bg-red-100 text-red-700";
      case "refunded":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleRefund = async () => {
    if (!refundAmount || parseFloat(refundAmount) <= 0) {
      toast.error("Please enter a valid refund amount");
      return;
    }

    if (parseFloat(refundAmount) > selectedTransaction.amount) {
      toast.error("Refund amount cannot exceed original transaction amount");
      return;
    }

    try {
      await processRefund({
        id: selectedTransaction._id,
        refundAmount: parseFloat(refundAmount),
        refundReason,
      }).unwrap();
      
      toast.success("Refund processed successfully");
      setShowRefundDialog(false);
      setRefundReason("");
      setRefundAmount("");
      setSelectedTransaction(null);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to process refund");
    }
  };

  const handleExport = (format) => {
    try {
      // Export logic would go here
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error("Failed to export data");
    }
  };



  return (
    <div className="p-8">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Payment Management</h1>
        <p className="text-gray-500 mt-2">
          Track and manage all course payments and transactions
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          trend={23}
        />
        <StatCard
          icon={TrendingUp}
          label="Total Transactions"
          value={stats.totalTransactions}
          trend={12}
        />
        <StatCard
          icon={DollarSign}
          label="Average Value"
          value={formatCurrency(stats.averageValue)}
          trend={8}
        />
        <StatCard
          icon={Calendar}
          label="Completed"
          value={stats.completedCount}
          trend={15}
        />
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID, user, or course..."
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
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          {/* Date Range */}
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {/* Export */}
          <div className="flex gap-2">
            <button
              onClick={() => handleExport("csv")}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
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
              {paymentsLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <Loader className="w-6 h-6 animate-spin mx-auto text-indigo-600" />
                  </td>
                </tr>
              ) : paymentsError ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <div className="text-red-600">
                      <p className="font-medium">Error loading payments</p>
                      <p className="text-sm text-gray-500 mt-1">{paymentsError?.data?.message || "Failed to fetch payment data"}</p>
                    </div>
                  </td>
                </tr>
              ) : paymentsData?.payments && paymentsData.payments.length > 0 ? (
                paymentsData.payments.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      {transaction.transactionId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>
                        <p className="font-medium">{transaction.metadata?.userName || "N/A"}</p>
                        <p className="text-xs text-gray-500">
                          {transaction.metadata?.userEmail || "N/A"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {transaction.metadata?.courseTitle || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}
                      >
                        {transaction.status.charAt(0).toUpperCase() +
                          transaction.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          if (transaction.status === "completed") {
                            setShowRefundDialog(true);
                          }
                        }}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        {transaction.status === "completed"
                          ? "Refund"
                          : "View"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {paymentsData?.pagination && paymentsData.pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Page {paymentsData.pagination.page} of {paymentsData.pagination.pages}
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
                  setCurrentPage(Math.min(paymentsData.pagination.pages, currentPage + 1))
                }
                disabled={currentPage === paymentsData.pagination.pages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Refund Dialog */}
      {showRefundDialog && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Process Refund
            </h2>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Transaction ID:</span>{" "}
                {selectedTransaction.transactionId}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Original Amount:</span>{" "}
                {formatCurrency(selectedTransaction.amount)}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">User:</span>{" "}
                {selectedTransaction.metadata.userName}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Refund Amount
              </label>
              <input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="Enter refund amount"
                max={selectedTransaction.amount}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason
              </label>
              <select
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a reason</option>
                <option value="customer_request">Customer Request</option>
                <option value="duplicate">Duplicate Transaction</option>
                <option value="not_satisfied">Not Satisfied</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRefundDialog(false);
                  setRefundReason("");
                  setRefundAmount("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRefund}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Process Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;
