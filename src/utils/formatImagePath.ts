import { baseURL } from "./BaseURL";

export const formatImagePath = (path: string | undefined | null): string => {
  if (!path || typeof path !== 'string') return '';
  const trimmed = path.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("/")) {
    return `${baseURL}${trimmed}`;
  }
  return `${baseURL}/${trimmed}`;
};