// store.js (or wherever you configure your Redux store)
import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "../features/api/authApi";
import authReducer from "../features/authSlice";
import themeReducer from "../features/themeSlice";
import adminReducer from "../features/adminSlice";
import { courseApi } from "../features/api/courseApi";
import { purchaseApi } from "../features/api/purchaseApi";
import { courseProgressApi } from "../features/api/courseProgressApi";
import { adminApi } from "../features/api/adminApi";
import { paymentApi } from "../features/api/paymentApi";
import { analyticsApi } from "../features/api/analyticsApi";
import { moderationApi } from "../features/api/moderationApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    admin: adminReducer,
    [authApi.reducerPath]: authApi.reducer,
    [courseApi.reducerPath]: courseApi.reducer,
    [purchaseApi.reducerPath]: purchaseApi.reducer,
    [courseProgressApi.reducerPath]: courseProgressApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [paymentApi.reducerPath]: paymentApi.reducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
    [moderationApi.reducerPath]: moderationApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      courseApi.middleware,
      purchaseApi.middleware,
      courseProgressApi.middleware,
      adminApi.middleware,
      paymentApi.middleware,
      analyticsApi.middleware,
      moderationApi.middleware,
    ),
});
