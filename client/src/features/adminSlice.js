import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  users: [],
  courses: [],
  payments: [],
  flaggedContent: [],
  auditLogs: [],
  analytics: {
    dashboard: {},
    users: {},
    courses: {},
    revenue: {},
  },
  loading: false,
  error: null,
  pagination: {
    users: { page: 1, limit: 10, total: 0 },
    courses: { page: 1, limit: 10, total: 0 },
    payments: { page: 1, limit: 10, total: 0 },
    flaggedContent: { page: 1, limit: 10, total: 0 },
  },
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    // Users
    setUsers: (state, action) => {
      state.users = action.payload.users;
      state.pagination.users = action.payload.pagination;
    },
    addUser: (state, action) => {
      state.users.unshift(action.payload);
    },
    updateUserInList: (state, action) => {
      const index = state.users.findIndex((u) => u._id === action.payload._id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    removeUser: (state, action) => {
      state.users = state.users.filter((u) => u._id !== action.payload);
    },

    // Courses
    setCourses: (state, action) => {
      state.courses = action.payload.courses;
      state.pagination.courses = action.payload.pagination;
    },
    updateCourseInList: (state, action) => {
      const index = state.courses.findIndex((c) => c._id === action.payload._id);
      if (index !== -1) {
        state.courses[index] = action.payload;
      }
    },

    // Payments
    setPayments: (state, action) => {
      state.payments = action.payload.payments;
      state.pagination.payments = action.payload.pagination;
    },
    updatePaymentInList: (state, action) => {
      const index = state.payments.findIndex((p) => p._id === action.payload._id);
      if (index !== -1) {
        state.payments[index] = action.payload;
      }
    },

    // Flagged Content
    setFlaggedContent: (state, action) => {
      state.flaggedContent = action.payload.flaggedContent;
      state.pagination.flaggedContent = action.payload.pagination;
    },
    updateFlaggedContentInList: (state, action) => {
      const index = state.flaggedContent.findIndex((f) => f._id === action.payload._id);
      if (index !== -1) {
        state.flaggedContent[index] = action.payload;
      }
    },

    // Analytics
    setDashboardAnalytics: (state, action) => {
      state.analytics.dashboard = action.payload;
    },
    setUserAnalytics: (state, action) => {
      state.analytics.users = action.payload;
    },
    setCourseAnalytics: (state, action) => {
      state.analytics.courses = action.payload;
    },
    setRevenueAnalytics: (state, action) => {
      state.analytics.revenue = action.payload;
    },

    // Audit Logs
    setAuditLogs: (state, action) => {
      state.auditLogs = action.payload;
    },

    // Loading and Error
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setUsers,
  addUser,
  updateUserInList,
  removeUser,
  setCourses,
  updateCourseInList,
  setPayments,
  updatePaymentInList,
  setFlaggedContent,
  updateFlaggedContentInList,
  setDashboardAnalytics,
  setUserAnalytics,
  setCourseAnalytics,
  setRevenueAnalytics,
  setAuditLogs,
  setLoading,
  setError,
  clearError,
} = adminSlice.actions;

export default adminSlice.reducer;
