import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  token: null,
  refreshToken: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthenticated: (state, action) => {
      state.isAuthenticated = true;
      if (typeof action.payload === "string") {
        state.token = action.payload;
      } else if (action.payload) {
        state.token = action.payload.accessToken || action.payload.token || null;
        state.refreshToken = action.payload.refreshToken || null;
      }
    },
    setTokens: (state, action) => {
      if (typeof action.payload === "string") {
        state.token = action.payload;
      } else if (action.payload) {
        if (action.payload.accessToken || action.payload.token) {
          state.token = action.payload.accessToken || action.payload.token;
        }
        if (action.payload.refreshToken) {
          state.refreshToken = action.payload.refreshToken;
        }
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.refreshToken = null;
    },
  },
});

export const { setAuthenticated, setTokens, logout } = authSlice.actions;
export default authSlice.reducer;
