// client/src/features/api/authApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn } from "../authSlice";

const USER_API = "http://localhost:5000/api/users";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: USER_API,
    credentials: "include",
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (inputData) => ({
        url: "/register",
        method: "POST",
        body: inputData,
      }),
      // FIX: After successful registration, automatically log the user in
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success) {
            // After registration, automatically login
            const loginResult = await dispatch(
              authApi.endpoints.loginUser.initiate({
                email: arg.email,
                password: arg.password,
              }),
            ).unwrap();

            // User will be logged in via the loginUser's onQueryStarted
            console.log("Auto-login after registration successful");
          }
        } catch (error) {
          console.error("Registration failed:", error);
        }
      },
    }),

    loginUser: builder.mutation({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Store user in Redux state
          dispatch(userLoggedIn({ user: data.user }));

          // Also store in localStorage for persistence
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem("isAuthenticated", "true");
        } catch (error) {
          console.error("Login failed:", error);
        }
      },
    }),

    loadUser: builder.query({
      query: () => ({
        url: "/profile",
        method: "GET",
      }),
      providesTags: ["User"],
      // FIX: Keep user data in cache
      keepUnusedDataFor: 3600, // Keep for 1 hour
    }),

    updateProfile: builder.mutation({
      query: (userData) => {
        const formData = new FormData();

        // Append text fields - only name, location, education
        if (userData.name) formData.append("name", userData.name);
        if (userData.location) formData.append("location", userData.location);
        if (userData.education)
          formData.append("education", userData.education);

        // Handle file upload
        if (
          userData.profilePicture &&
          userData.profilePicture instanceof File
        ) {
          formData.append("profilePicture", userData.profilePicture);
        }

        return {
          url: "/profile",
          method: "PUT",
          body: formData,
          formData: true,
        };
      },
      invalidatesTags: ["User"],
      // FIX: Update Redux state after profile update
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success && data.user) {
            // Update Redux state with new user data
            dispatch(userLoggedIn({ user: data.user }));
            // Update localStorage
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        } catch (error) {
          console.error("Profile update failed:", error);
        }
      },
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useLoadUserQuery,
  useUpdateProfileMutation,
} = authApi;
