"use server";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { getToken } from "./getToken";
import { getRefreshToken, setAuthCookie } from "../app/actions/auth";
import { baseURL } from "./BaseURL";

export interface FetchResponse {
  success: boolean;
  message?: string;
  data?: any;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPage: number;
  };
  error?: string | null;
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface FetchOptions {
  method?: HttpMethod;
  body?: any;
  tags?: string[];
  token?: string;
  headers?: Record<string, string>;
  cache?: RequestCache;
  isRetry?: boolean;
}

export const myFetch = async (
  url: string,
  {
    method = "GET",
    body,
    tags,
    token,
    headers = {},
    cache = "no-cache",
    isRetry = false,
  }: FetchOptions = {}
): Promise<FetchResponse> => {
  const accessToken = token || (await getToken());

  const isFormData = body instanceof FormData;
  const hasBody = body !== undefined && method !== "GET";

  const reqHeaders: Record<string, string> = {
    Accept: "application/json",
    ...headers,
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  try {
    const targetUrl = url.startsWith("http") ? url : `${baseURL}/api/v1${url.startsWith("/") ? "" : "/"}${url}`;
    const response = await fetch(targetUrl, {
      method,
      headers: reqHeaders,
      ...(hasBody && { body: isFormData ? body : JSON.stringify(body) }),
      ...(tags && { next: { tags } }),
      ...(!(method === "GET") ? { cache: "no-store" } : { cache: cache }),
    });

    // If 401 Unauthorized and not already retrying, try to refresh token
    if ((response.status === 401 || response.status === 403) && !isRetry && !url.includes("refresh-token")) {
      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        const refreshRes = await fetch(`${baseURL}/api/v1/auth/refresh-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${refreshToken}`,
            refreshToken: refreshToken,
          },
          body: JSON.stringify({ refreshToken }),
          cache: "no-store",
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          const newAccessToken =
            refreshData?.data?.accessToken ||
            refreshData?.data?.token ||
            refreshData?.accessToken ||
            refreshData?.token;
          const newRefreshToken =
            refreshData?.data?.refreshToken ||
            refreshData?.refreshToken ||
            refreshToken;

          if (newAccessToken) {
            await setAuthCookie(newAccessToken, newRefreshToken);
            return myFetch(url, {
              method,
              body,
              tags,
              token: newAccessToken,
              headers,
              cache,
              isRetry: true,
            });
          }
        }
      }
    }

    const data = await response.json();

    if (response.ok) {
      return {
        success: data?.success ?? true,
        message: data?.message,
        data: data?.data,
        pagination: data?.meta,
        error: null,
      };
    }

    return {
      success: false,
      message: data?.message,
      data: null,
      error: data?.errorMessages || "Request failed",
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: "Network error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
