import { ApiErrorLike } from "@/types/dashboard";

export const getErrorMessage = (
  error: unknown,
  fallback = "Something went wrong"
): string => {
  if (typeof error !== "object" || error === null) {
    return fallback;
  }

  const typedError = error as ApiErrorLike;

  return (
    typedError.data?.message ||
    typedError.data?.error ||
    typedError.message ||
    typedError.error ||
    fallback
  );
};
