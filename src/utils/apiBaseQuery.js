import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseURL } from "./BaseURL";
import { logout, setTokens } from "../features/auth/authSlice";
import { removeAuthCookie, setAuthCookie } from "../app/actions/auth";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${baseURL}/api/v1`,
  prepareHeaders: (headers, { getState }) => {
    // Get token from auth state
    const state = getState();
    const token = state.auth ? state.auth.token : null;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (cb) => {
  refreshSubscribers.push(cb);
};

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  // Check for 401 Unauthorized or 403 Forbidden
  if (result.error && (result.error.status === 401 || result.error.status === 403)) {
    // Avoid infinite loop if the refresh-token request itself returns 401/403
    const isRefreshReq = typeof args === "string" ? args.includes("refresh-token") : args?.url?.includes("refresh-token");
    if (isRefreshReq) {
      return result;
    }

    const state = api.getState();
    const refreshToken = state.auth ? state.auth.refreshToken : null;

    if (!refreshToken) {
      api.dispatch(logout());
      if (typeof window !== "undefined") {
        removeAuthCookie();
        window.location.replace("/auth/login");
      }
      return result;
    }

    if (!isRefreshing) {
      isRefreshing = true;

      try {
        const refreshResult = await rawBaseQuery(
          {
            url: "/auth/refresh-token",
            method: "POST",
            headers: {
              Authorization: `Bearer ${refreshToken}`,
              refreshToken: refreshToken,
            },
            body: { refreshToken },
          },
          api,
          extraOptions
        );

        const responseData = refreshResult?.data;

        if (responseData && responseData.success !== false) {
          const newAccessToken =
            responseData?.data?.accessToken ||
            responseData?.data?.token ||
            responseData?.accessToken ||
            responseData?.token;

          const newRefreshToken =
            responseData?.data?.refreshToken ||
            responseData?.refreshToken ||
            refreshToken;

          if (newAccessToken) {
            api.dispatch(
              setTokens({
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
              })
            );

            if (typeof window !== "undefined") {
              await setAuthCookie(newAccessToken, newRefreshToken);
            }

            onRefreshed(newAccessToken);

            // Retry original request with updated state
            result = await rawBaseQuery(args, api, extraOptions);
          } else {
            throw new Error("Invalid token refresh response");
          }
        } else {
          throw new Error(refreshResult?.error?.data?.message || "Token refresh failed");
        }
      } catch {
        api.dispatch(logout());
        if (typeof window !== "undefined") {
          removeAuthCookie();
          window.location.replace("/auth/login");
        }
      } finally {
        isRefreshing = false;
      }
    } else {
      // Queue requests while token refresh is in progress
      const retryPromise = new Promise((resolve) => {
        addRefreshSubscriber(() => {
          resolve(rawBaseQuery(args, api, extraOptions));
        });
      });
      result = await retryPromise;
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
  tagTypes: [
    "table",
    "match",
    "team",
    "reword",
    "profile",
    "news",
    "terms",
    "privacy",
    "league",
    "referee",
    "leagueTeam",
    "manager-team",
    "notification",
    "overview",
    "player",
    "transfer",
    "video",
    "user",
    "event",
    "package",
  ],
});
