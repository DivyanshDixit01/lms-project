import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const ADMIN_API = "https://lms-project-5yly.onrender.com/api/admin";

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: ADMIN_API,
    credentials: "include",
  }),
  tagTypes: ["Users", "Courses", "Payments", "FlaggedContent", "Analytics", "AuditLogs"],
  endpoints: (builder) => ({
    // Test endpoint
    testAdmin: builder.query({
      query: () => "/test",
    }),
    
    // ============ USER MANAGEMENT ============
    getAllUsers: builder.query({
      query: ({ page = 1, limit = 10, search = "", role = "", status = "" }) =>
        `/users?page=${page}&limit=${limit}&search=${search}&role=${role}&status=${status}`,
      providesTags: ["Users"],
    }),
    getUserDetails: builder.query({
      query: (userId) => `/users/${userId}`,
      providesTags: ["Users"],
    }),
    createUser: builder.mutation({
      query: (userData) => ({
        url: "/users",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["Users"],
    }),
    updateUser: builder.mutation({
      query: ({ userId, ...userData }) => ({
        url: `/users/${userId}`,
        method: "PUT",
        body: userData,
      }),
      invalidatesTags: ["Users"],
    }),
    suspendUser: builder.mutation({
      query: ({ userId, reason }) => ({
        url: `/users/${userId}/suspend`,
        method: "PUT",
        body: { reason },
      }),
      invalidatesTags: ["Users"],
    }),
    deleteUser: builder.mutation({
      query: ({ userId, reason }) => ({
        url: `/users/${userId}`,
        method: "DELETE",
        body: { reason },
      }),
      invalidatesTags: ["Users"],
    }),

    // ============ COURSE MANAGEMENT ============
    getAllCourses: builder.query({
      query: ({ page = 1, limit = 10, search = "", status = "", category = "" }) =>
        `/courses?page=${page}&limit=${limit}&search=${search}&status=${status}&category=${category}`,
      providesTags: ["Courses"],
    }),
    getCourseDetails: builder.query({
      query: (courseId) => `/courses/${courseId}`,
      providesTags: ["Courses"],
    }),
    approveCourse: builder.mutation({
      query: (courseId) => ({
        url: `/courses/${courseId}/approve`,
        method: "PUT",
      }),
      invalidatesTags: ["Courses"],
    }),
    rejectCourse: builder.mutation({
      query: ({ courseId, reason }) => ({
        url: `/courses/${courseId}/reject`,
        method: "PUT",
        body: { reason },
      }),
      invalidatesTags: ["Courses"],
    }),
    archiveCourse: builder.mutation({
      query: (courseId) => ({
        url: `/courses/${courseId}/archive`,
        method: "PUT",
      }),
      invalidatesTags: ["Courses"],
    }),

    // ============ PAYMENT MANAGEMENT ============
    getAllPayments: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        status = "",
        startDate = "",
        endDate = "",
      }) =>
        `/payments?page=${page}&limit=${limit}&search=${search}&status=${status}&startDate=${startDate}&endDate=${endDate}`,
      providesTags: ["Payments"],
    }),
    getPaymentDetails: builder.query({
      query: (paymentId) => `/payments/${paymentId}`,
      providesTags: ["Payments"],
    }),
    processRefund: builder.mutation({
      query: ({ paymentId, reason }) => ({
        url: `/payments/${paymentId}/refund`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: ["Payments"],
    }),

    // ============ ANALYTICS ============
    getDashboardAnalytics: builder.query({
      query: () => "/analytics/dashboard",
      providesTags: ["Analytics"],
    }),
    getUserAnalytics: builder.query({
      query: () => "/analytics/users",
      providesTags: ["Analytics"],
    }),
    getCourseAnalytics: builder.query({
      query: () => "/analytics/courses",
      providesTags: ["Analytics"],
    }),
    getRevenueAnalytics: builder.query({
      query: () => "/analytics/revenue",
      providesTags: ["Analytics"],
    }),

    // ============ CONTENT MODERATION ============
    getFlaggedContent: builder.query({
      query: ({ page = 1, limit = 10, status = "", contentType = "" }) =>
        `/moderation/flagged-content?page=${page}&limit=${limit}&status=${status}&contentType=${contentType}`,
      providesTags: ["FlaggedContent"],
    }),
    approveFlaggedContent: builder.mutation({
      query: (contentId) => ({
        url: `/moderation/flagged-content/${contentId}/approve`,
        method: "PUT",
      }),
      invalidatesTags: ["FlaggedContent"],
    }),
    rejectFlaggedContent: builder.mutation({
      query: ({ contentId, reason }) => ({
        url: `/moderation/flagged-content/${contentId}/reject`,
        method: "PUT",
        body: { reason },
      }),
      invalidatesTags: ["FlaggedContent"],
    }),
    getModerationStats: builder.query({
      query: () => "/moderation/stats",
      providesTags: ["FlaggedContent"],
    }),

    // ============ AUDIT LOGS ============
    getAuditLogs: builder.query({
      query: ({ page = 1, limit = 20, adminId = "", action = "" }) =>
        `/audit-logs?page=${page}&limit=${limit}&adminId=${adminId}&action=${action}`,
      providesTags: ["AuditLogs"],
    }),
  }),
});

export const {
  useTestAdminQuery,
  useGetAllUsersQuery,
  useGetUserDetailsQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useSuspendUserMutation,
  useDeleteUserMutation,
  useGetAllCoursesQuery,
  useGetCourseDetailsQuery,
  useApproveCourseMutation,
  useRejectCourseMutation,
  useArchiveCourseMutation,
  useGetAllPaymentsQuery,
  useGetPaymentDetailsQuery,
  useProcessRefundMutation,
  useGetDashboardAnalyticsQuery,
  useGetUserAnalyticsQuery,
  useGetCourseAnalyticsQuery,
  useGetRevenueAnalyticsQuery,
  useGetFlaggedContentQuery,
  useApproveFlaggedContentMutation,
  useRejectFlaggedContentMutation,
  useGetModerationStatsQuery,
  useGetAuditLogsQuery,
} = adminApi;
