import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const PAYMENT_API = "https://lms-project-5yly.onrender.com/api/payments";

export const paymentApi = createApi({
  reducerPath: "paymentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: PAYMENT_API,
    credentials: "include",
  }),
  tagTypes: ["Payments", "PaymentStats"],
  endpoints: (builder) => ({
    // Get all payments with filters
    getAllPayments: builder.query({
      query: ({ page = 1, limit = 10, status = "all", search = "" }) =>
        `/?page=${page}&limit=${limit}&status=${status}&search=${search}`,
      providesTags: ["Payments"],
    }),

    // Get payment by ID
    getPaymentById: builder.query({
      query: (id) => `/${id}`,
      providesTags: ["Payments"],
    }),

    // Get payment statistics
    getPaymentStats: builder.query({
      query: () => "/stats",
      providesTags: ["PaymentStats"],
    }),

    // Get revenue analytics
    getRevenueAnalytics: builder.query({
      query: ({ startDate = "", endDate = "", courseId = "" }) =>
        `/analytics/revenue?startDate=${startDate}&endDate=${endDate}&courseId=${courseId}`,
      providesTags: ["Payments"],
    }),

    // Process refund
    processRefund: builder.mutation({
      query: ({ id, refundAmount, refundReason }) => ({
        url: `/${id}/refund`,
        method: "POST",
        body: { refundAmount, refundReason },
      }),
      invalidatesTags: ["Payments", "PaymentStats"],
    }),
  }),
});

export const {
  useGetAllPaymentsQuery,
  useGetPaymentByIdQuery,
  useGetPaymentStatsQuery,
  useGetRevenueAnalyticsQuery,
  useProcessRefundMutation,
} = paymentApi;
