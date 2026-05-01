// features/api/purchaseApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = "https://lms-project-5yly.onrender.com/api/payment";

export const purchaseApi = createApi({
  reducerPath: "purchaseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: "include",
  }),
  tagTypes: ["Purchase"],
  endpoints: (builder) => ({
    // Create order for payment
    createOrder: builder.mutation({
      query: (courseData) => ({
        url: "/create-order",
        method: "POST",
        body: courseData,
      }),
      invalidatesTags: ["Purchase"],
    }),

    // Verify payment after successful transaction
    verifyPayment: builder.mutation({
      query: (paymentData) => ({
        url: "/verify-payment",
        method: "POST",
        body: paymentData,
      }),
      invalidatesTags: ["Purchase"],
    }),

    // Get all purchases of logged-in user
    getUserPurchases: builder.query({
      query: () => ({
        url: "/my-purchases",
        method: "GET",
      }),
      providesTags: ["Purchase"],
    }),

    // Check if user has purchased a specific course
    checkPurchaseStatus: builder.query({
      query: (courseId) => ({
        url: `/check/${courseId}`,
        method: "GET",
      }),
      providesTags: (result, error, courseId) => [{ type: "Purchase", id: courseId }],
    }),

    // Get all purchases (admin only)
    getAllPurchases: builder.query({
      query: () => ({
        url: "/admin/all",
        method: "GET",
      }),
      providesTags: ["Purchase"],
    }),

    // Get purchase statistics (admin only)
    getPurchaseStats: builder.query({
      query: () => ({
        url: "/admin/stats",
        method: "GET",
      }),
      providesTags: ["Purchase"],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useVerifyPaymentMutation,
  useGetUserPurchasesQuery,
  useCheckPurchaseStatusQuery,
  useGetAllPurchasesQuery,
  useGetPurchaseStatsQuery,
} = purchaseApi;
