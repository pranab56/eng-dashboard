import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { toast } from "sonner";
import { baseURL } from "@/utils/BaseURL";
import { logout, setTokens } from "@/features/auth/authSlice";
import { ApiErrorResponse } from "./api.types";

// ============================================================================
// Cookie & Token Resolution Helpers
// ============================================================================

const getCookieValue = (name: string): string | null => {
  if (typeof window === "undefined" || !document.cookie) return null;
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") + "=([^;]*)")
  );
  return match ? decodeURIComponent(match[1]) : null;
};

// ============================================================================
// Raw Base Query Instance
// ============================================================================

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${baseURL}/api/v1`,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as any;
    let token = state.auth?.token;
    if (!token && typeof window !== "undefined") {
      token =
        getCookieValue("alexandertel-admin-token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token");
    }
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// ============================================================================
// Re-authentication & HTTP Status Error Interceptor
// ============================================================================

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const onRefreshed = (newToken: string) => {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

export const baseQueryWithInterceptor: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  // Status-based Error Handling & Toast Notifications
  if (result.error) {
    const status = result.error.status;
    const errorData = result.error.data as ApiErrorResponse | undefined;
    const errorMessage = errorData?.message || "An unexpected network error occurred.";

    switch (status) {
      case 400:
        toast.error(`Validation Error: ${errorMessage}`);
        break;
      case 401:
      case 403: {
        const isRefreshReq =
          typeof args === "string"
            ? args.includes("refresh-token")
            : args?.url?.includes("refresh-token");

        if (isRefreshReq) {
          api.dispatch(logout());
          return result;
        }

        const state = api.getState() as any;
        const refreshToken =
          state.auth?.refreshToken ||
          getCookieValue("alexandertel-admin-refresh-token") ||
          localStorage.getItem("refreshToken");

        if (!refreshToken) {
          api.dispatch(logout());
          if (typeof window !== "undefined") {
            localStorage.clear();
            window.location.replace("/auth/login");
          }
          return result;
        }

        if (!isRefreshing) {
          isRefreshing = true;

          try {
            const refreshResult: any = await rawBaseQuery(
              {
                url: "/auth/refresh-token",
                method: "POST",
                headers: { Authorization: `Bearer ${refreshToken}` },
                body: { refreshToken },
              },
              api,
              extraOptions
            );

            const newAccessToken =
              refreshResult?.data?.data?.accessToken ||
              refreshResult?.data?.accessToken;

            if (newAccessToken) {
              api.dispatch(
                setTokens({
                  accessToken: newAccessToken,
                  refreshToken,
                })
              );
              onRefreshed(newAccessToken);
              result = await rawBaseQuery(args, api, extraOptions);
            } else {
              throw new Error("Token refresh failed");
            }
          } catch {
            api.dispatch(logout());
            if (typeof window !== "undefined") {
              localStorage.clear();
              window.location.replace("/auth/login");
            }
          } finally {
            isRefreshing = false;
          }
        } else {
          const retryPromise = new Promise<ReturnType<typeof rawBaseQuery>>((resolve) => {
            addRefreshSubscriber(() => {
              resolve(rawBaseQuery(args, api, extraOptions));
            });
          });
          result = await retryPromise;
        }
        break;
      }
      case 404:
        toast.error("Resource not found (404).");
        break;
      case 422:
        toast.error(`Unprocessable Entity: ${errorMessage}`);
        break;
      case 500:
        toast.error("Internal Server Error (500). Please try again later.");
        break;
      default:
        toast.error(errorMessage);
    }
  }

  return result;
};

// ============================================================================
// Central Base API Service
// ============================================================================

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithInterceptor,
  endpoints: () => ({}),
  tagTypes: ["player", "user", "team", "match", "tournament", "auth"],
});
