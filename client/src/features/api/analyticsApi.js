import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const ANALYTICS_API = "http://localhost:5000/api/analytics";

export const analyticsApi = createApi({
  reducerPath: "analyticsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: ANALYTICS_API,
    credentials: "include",
  }),
  tagTypes: ["Analytics", "Engagement", "Cohorts", "Conversion"],
  endpoints: (builder) => ({
    // Get dashboard metrics
    getDashboardMetrics: builder.query({
      query: ({ startDate = "", endDate = "", period = "monthly" }) =>
        `/dashboard?startDate=${startDate}&endDate=${endDate}&period=${period}`,
      providesTags: ["Analytics"],
    }),

    // Get analytics summary
    getAnalyticsSummary: builder.query({
      query: () => "/summary",
      providesTags: ["Analytics"],
    }),

    // Get engagement metrics
    getEngagementMetrics: builder.query({
      query: ({ startDate = "", endDate = "", courseId = "" }) =>
        `/engagement?startDate=${startDate}&endDate=${endDate}&courseId=${courseId}`,
      providesTags: ["Engagement"],
    }),

    // Get course performance
    getCoursePerformance: builder.query({
      query: ({ courseId = "", startDate = "", endDate = "" }) =>
        `/courses/performance?courseId=${courseId}&startDate=${startDate}&endDate=${endDate}`,
      providesTags: ["Analytics"],
    }),

    // Get conversion metrics
    getConversionMetrics: builder.query({
      query: ({ startDate = "", endDate = "" }) =>
        `/conversion?startDate=${startDate}&endDate=${endDate}`,
      providesTags: ["Conversion"],
    }),

    // Get cohort analysis
    getCohortAnalysis: builder.query({
      query: ({ cohortType = "signup_date" }) =>
        `/cohorts?cohortType=${cohortType}`,
      providesTags: ["Cohorts"],
    }),
  }),
});

export const {
  useGetDashboardMetricsQuery,
  useGetAnalyticsSummaryQuery,
  useGetEngagementMetricsQuery,
  useGetCoursePerformanceQuery,
  useGetConversionMetricsQuery,
  useGetCohortAnalysisQuery,
} = analyticsApi;
