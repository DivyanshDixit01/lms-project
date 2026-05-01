// features/api/courseApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const COURSE_API = "http://localhost:5000/api/course";
const MEDIA_API = "http://localhost:5000/api/media";

export const courseApi = createApi({
  reducerPath: "courseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: COURSE_API,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Course", "Lecture", "Media"],
  endpoints: (builder) => ({
    // ==================== COURSE ENDPOINTS ====================

    createCourse: builder.mutation({
      query: (courseData) => ({
        url: "/create",
        method: "POST",
        body: courseData,
      }),
      invalidatesTags: ["Course"],
    }),

    getCreatorCourses: builder.query({
      query: () => ({
        url: "",
        method: "GET",
      }),
      providesTags: ["Course"],
    }),

    getCourseById: builder.query({
      query: (id) => ({
        url: `/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Course", id }],
    }),

    // Public course details (no authentication required)
    getPublicCourseById: builder.query({
      query: (id) => ({
        url: `/public/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Course", id }],
    }),

    updateCourse: builder.mutation({
      query: ({ id, body }) => ({
        url: `/${id}`,
        method: "PUT",
        body: body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Course", id }],
    }),

    deleteCourse: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Course"],
    }),

    updateCourseStatus: builder.mutation({
      query: ({ id, isPublished }) => ({
        url: `/${id}`,
        method: "PUT",
        body: { isPublished },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Course", id }],
    }),

    getAllPublishedCourses: builder.query({
      query: () => ({
        url: "/published",
        method: "GET",
      }),
      providesTags: ["Course"],
    }),

    // ==================== LECTURE ENDPOINTS ====================

    createLecture: builder.mutation({
      query: ({ courseId, ...lectureData }) => ({
        url: `/${courseId}/lectures`,
        method: "POST",
        body: lectureData,
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Course", id: courseId },
        "Lecture",
      ],
    }),

    getLecturesByCourse: builder.query({
      query: (courseId) => ({
        url: `/${courseId}/lectures`,
        method: "GET",
      }),
      providesTags: (result, error, courseId) => [
        { type: "Course", id: courseId },
        { type: "Lecture", id: courseId },
      ],
    }),

    getLectureById: builder.query({
      query: ({ courseId, lectureId }) => ({
        url: `/${courseId}/lectures/${lectureId}`,
        method: "GET",
      }),
      providesTags: (result, error, { lectureId }) => [
        { type: "Lecture", id: lectureId },
      ],
    }),

    updateLecture: builder.mutation({
      query: ({ courseId, lectureId, ...lectureData }) => ({
        url: `/${courseId}/lectures/${lectureId}`,
        method: "PUT",
        body: lectureData,
      }),
      invalidatesTags: (result, error, { courseId, lectureId }) => [
        { type: "Course", id: courseId },
        { type: "Lecture", id: lectureId },
      ],
    }),

    deleteLecture: builder.mutation({
      query: ({ courseId, lectureId }) => ({
        url: `/${courseId}/lectures/${lectureId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Course", id: courseId },
        "Lecture",
      ],
    }),

    reorderLectures: builder.mutation({
      query: ({ courseId, lectureOrders }) => ({
        url: `/${courseId}/lectures/reorder`,
        method: "PUT",
        body: { lectureOrders },
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Course", id: courseId },
        "Lecture",
      ],
    }),

    getPreviewLectures: builder.query({
      query: (courseId) => ({
        url: `/${courseId}/lectures/preview`,
        method: "GET",
      }),
      providesTags: (result, error, courseId) => [
        { type: "Course", id: courseId },
      ],
    }),

    // ==================== MEDIA ENDPOINTS ====================

    // Upload video for lecture
    uploadLectureVideo: builder.mutation({
      query: ({ courseId, lectureId, videoFile }) => {
        const formData = new FormData();
        formData.append("video", videoFile);
        formData.append("courseId", courseId);
        formData.append("lectureId", lectureId);

        return {
          url: `${MEDIA_API}/upload/video`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: (result, error, { courseId, lectureId }) => [
        { type: "Course", id: courseId },
        { type: "Lecture", id: lectureId },
        "Media",
      ],
    }),

    // Upload video for temporary storage (before lecture creation)
    uploadTemporaryVideo: builder.mutation({
      query: ({ courseId, videoFile }) => {
        const formData = new FormData();
        formData.append("video", videoFile);
        if (courseId) formData.append("courseId", courseId);

        return {
          url: `${MEDIA_API}/upload/video`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Media"],
    }),

    // Delete video from Cloudinary
    deleteVideo: builder.mutation({
      query: (publicId) => ({
        url: `${MEDIA_API}/delete/video/${publicId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Media"],
    }),

    // Get video details
    getVideoDetails: builder.query({
      query: (publicId) => ({
        url: `${MEDIA_API}/video/${publicId}`,
        method: "GET",
      }),
      providesTags: (result, error, publicId) => [
        { type: "Media", id: publicId },
      ],
    }),

    // Generate thumbnail from video
    generateVideoThumbnail: builder.mutation({
      query: ({ publicId, timestamp = 0 }) => ({
        url: `${MEDIA_API}/video/${publicId}/thumbnail`,
        method: "POST",
        body: { timestamp },
      }),
      invalidatesTags: ["Media"],
    }),

    // Get optimized video URL
    getOptimizedVideoUrl: builder.query({
      query: ({ publicId, quality = "auto", width, height }) => {
        const params = new URLSearchParams();
        if (quality) params.append("quality", quality);
        if (width) params.append("width", width);
        if (height) params.append("height", height);

        return {
          url: `${MEDIA_API}/video/${publicId}/optimize?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: (result, error, { publicId }) => [
        { type: "Media", id: publicId },
      ],
    }),

    // ==================== REVIEW ENDPOINTS ====================

    getReviewsByCourse: builder.query({
      query: (courseId) => ({
        url: `/reviews/${courseId}`,
        method: "GET",
      }),
      providesTags: (result, error, courseId) => [
        { type: "Review", id: courseId },
      ],
    }),

    createReview: builder.mutation({
      query: ({ courseId, ...reviewData }) => ({
        url: `/reviews/${courseId}`,
        method: "POST",
        body: reviewData,
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Review", id: courseId },
        { type: "Course", id: courseId },
      ],
    }),

    updateReview: builder.mutation({
      query: ({ courseId, reviewId, ...reviewData }) => ({
        url: `/reviews/${courseId}/${reviewId}`,
        method: "PUT",
        body: reviewData,
      }),
      invalidatesTags: (result, error, { courseId, reviewId }) => [
        { type: "Review", id: courseId },
        { type: "Course", id: courseId },
      ],
    }),

    deleteReview: builder.mutation({
      query: ({ courseId, reviewId }) => ({
        url: `/reviews/${courseId}/${reviewId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Review", id: courseId },
        { type: "Course", id: courseId },
      ],
    }),

    markReviewHelpful: builder.mutation({
      query: (reviewId) => ({
        url: `/reviews/${reviewId}/helpful`,
        method: "POST",
      }),
      invalidatesTags: (result, error, reviewId) => [
        { type: "Review", id: reviewId },
      ],
    }),

    markReviewUnhelpful: builder.mutation({
      query: (reviewId) => ({
        url: `/reviews/${reviewId}/unhelpful`,
        method: "POST",
      }),
      invalidatesTags: (result, error, reviewId) => [
        { type: "Review", id: reviewId },
      ],
    }),
  }),
});

export const {
  // Course hooks
  useCreateCourseMutation,
  useGetCreatorCoursesQuery,
  useGetCourseByIdQuery,
  useGetPublicCourseByIdQuery,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useUpdateCourseStatusMutation,
  useGetAllPublishedCoursesQuery,

  // Lecture hooks
  useCreateLectureMutation,
  useGetLecturesByCourseQuery,
  useGetLectureByIdQuery,
  useUpdateLectureMutation,
  useDeleteLectureMutation,
  useReorderLecturesMutation,
  useGetPreviewLecturesQuery,

  // Media hooks
  useUploadLectureVideoMutation,
  useUploadTemporaryVideoMutation,
  useDeleteVideoMutation,
  useGetVideoDetailsQuery,
  useGenerateVideoThumbnailMutation,
  useGetOptimizedVideoUrlQuery,

  // Review hooks
  useGetReviewsByCourseQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useMarkReviewHelpfulMutation,
  useMarkReviewUnhelpfulMutation,
} = courseApi;
