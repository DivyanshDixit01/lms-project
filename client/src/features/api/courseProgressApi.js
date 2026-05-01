// features/api/courseProgressApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const PROGRESS_API = "https://lms-project-5yly.onrender.com/api/progress";

export const courseProgressApi = createApi({
  reducerPath: "courseProgressApi",
  baseQuery: fetchBaseQuery({
    baseUrl: PROGRESS_API,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Progress"],
  endpoints: (builder) => ({
    // Get course progress for a specific course
    getCourseProgress: builder.query({
      query: (courseId) => ({
        url: `/${courseId}`,
        method: "GET",
      }),
      providesTags: (result, error, courseId) => [
        { type: "Progress", id: courseId },
      ],
    }),

    // Mark a lecture as completed
    markLectureComplete: builder.mutation({
      query: ({ courseId, lectureId }) => ({
        url: `/${courseId}/lectures/${lectureId}/complete`,
        method: "POST",
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Progress", id: courseId },
      ],
    }),

    // Update lecture watch time and position
    updateLectureProgress: builder.mutation({
      query: ({ courseId, lectureId, watchTime, position }) => ({
        url: `/${courseId}/lectures/${lectureId}/progress`,
        method: "PUT",
        body: { watchTime, position },
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Progress", id: courseId },
      ],
    }),

    // Get user's overall progress across all courses
    getUserOverallProgress: builder.query({
      query: () => ({
        url: "/user/overall",
        method: "GET",
      }),
      providesTags: ["Progress"],
    }),
  }),
});

export const {
  useGetCourseProgressQuery,
  useMarkLectureCompleteMutation,
  useUpdateLectureProgressMutation,
  useGetUserOverallProgressQuery,
} = courseProgressApi;
