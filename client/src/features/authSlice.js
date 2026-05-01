// client/src/features/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

// Load initial state from localStorage
const loadInitialState = () => {
  try {
    const user = localStorage.getItem("user");
    const isAuthenticated = localStorage.getItem("isAuthenticated");

    console.log("Loading initial state:", { user, isAuthenticated }); // Debug log

    if (user && isAuthenticated === "true") {
      return {
        user: JSON.parse(user),
        isAuthenticated: true,
      };
    }
  } catch (error) {
    console.error("Error loading auth state:", error);
  }

  return {
    user: null,
    isAuthenticated: false,
  };
};

const initialState = loadInitialState();

const authSlice = createSlice({
  name: "authSlice",
  initialState,
  reducers: {
    userLoggedIn: (state, action) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      // Persist to localStorage
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("isAuthenticated", "true");
    },
    userLoggedOut: (state) => {
      console.log("userLoggedOut action"); // Debug log
      state.user = null;
      state.isAuthenticated = false;
      // Clear localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("token");
    },
  },
});

export const { userLoggedIn, userLoggedOut } = authSlice.actions;
export default authSlice.reducer;
