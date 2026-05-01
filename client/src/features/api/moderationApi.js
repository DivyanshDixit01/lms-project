import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const MODERATION_API = "https://lms-project-5yly.onrender.com/api/moderation";

export const moderationApi = createApi({
  reducerPath: "moderationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: MODERATION_API,
    credentials: "include",
  }),
  tagTypes: ["Flags", "Appeals", "ModerationStats"],
  endpoints: (builder) => ({
    // Get all flagged content
    getAllFlags: builder.query({
      query: ({ page = 1, limit = 10, status = "all", reason = "all", contentType = "all", search = "" }) =>
        `/flags?page=${page}&limit=${limit}&status=${status}&reason=${reason}&contentType=${contentType}&search=${search}`,
      providesTags: ["Flags"],
    }),

    // Get flag by ID
    getFlagById: builder.query({
      query: (id) => `/flags/${id}`,
      providesTags: ["Flags"],
    }),

    // Get moderation statistics
    getModerationStats: builder.query({
      query: () => "/stats",
      providesTags: ["ModerationStats"],
    }),

    // Get moderation history
    getModerationHistory: builder.query({
      query: ({ userId = "", contentId = "", page = 1, limit = 10 }) =>
        `/history?userId=${userId}&contentId=${contentId}&page=${page}&limit=${limit}`,
      providesTags: ["Flags"],
    }),

    // Approve flagged content
    approveFlag: builder.mutation({
      query: ({ id, moderationReason }) => ({
        url: `/flags/${id}/approve`,
        method: "POST",
        body: { moderationReason },
      }),
      invalidatesTags: ["Flags", "ModerationStats"],
    }),

    // Remove flagged content
    removeFlag: builder.mutation({
      query: ({ id, moderationReason }) => ({
        url: `/flags/${id}/remove`,
        method: "POST",
        body: { moderationReason },
      }),
      invalidatesTags: ["Flags", "ModerationStats"],
    }),

    // Warn user
    warnUser: builder.mutation({
      query: ({ flagId }) => ({
        url: "/warn-user",
        method: "POST",
        body: { flagId },
      }),
      invalidatesTags: ["Flags"],
    }),

    // Get appeals
    getAppeals: builder.query({
      query: ({ status = "pending", page = 1, limit = 10 }) =>
        `/appeals?status=${status}&page=${page}&limit=${limit}`,
      providesTags: ["Appeals"],
    }),

    // Create appeal
    createAppeal: builder.mutation({
      query: ({ flagId, appealReason }) => ({
        url: "/appeals",
        method: "POST",
        body: { flagId, appealReason },
      }),
      invalidatesTags: ["Appeals"],
    }),

    // Create flag (report content)
    createFlag: builder.mutation({
      query: ({ contentId, contentType, flagReason, description, contentTitle }) => ({
        url: "/flags",
        method: "POST",
        body: { contentId, contentType, flagReason, description, contentTitle },
      }),
      invalidatesTags: ["Flags", "ModerationStats"],
    }),
  }),
});

export const {
  useGetAllFlagsQuery,
  useGetFlagByIdQuery,
  useGetModerationStatsQuery,
  useGetModerationHistoryQuery,
  useApproveFlagMutation,
  useRemoveFlagMutation,
  useWarnUserMutation,
  useGetAppealsQuery,
  useCreateAppealMutation,
  useCreateFlagMutation,
} = moderationApi;
