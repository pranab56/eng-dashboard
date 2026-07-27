export const getErrorMessage = (error: any, defaultMsg: string = "Something went wrong"): string => {
  if (!error) return defaultMsg;
  if (typeof error === "string") return error;
  if (typeof error?.data === "string") return error.data;
  if (error?.data?.message) return error.data.message;
  if (Array.isArray(error?.data?.errorMessages) && error.data.errorMessages.length > 0) {
    const firstErr = error.data.errorMessages[0];
    return typeof firstErr === "string" ? firstErr : firstErr?.message || defaultMsg;
  }
  if (error?.data?.error) return error.data.error;
  if (error?.message) return error.message;
  return defaultMsg;
};
