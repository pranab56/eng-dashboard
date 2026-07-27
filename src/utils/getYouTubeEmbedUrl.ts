/**
 * Extracts YouTube video ID and returns a standard YouTube embed URL.
 * Supports youtube.com, youtu.be, shorts, and embed links.
 */
export const getYouTubeEmbedUrl = (url: string | null | undefined): string | null => {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = trimmed.match(regExp);

  if (match && match[1]) {
    return `https://www.youtube-nocookie.com/embed/${match[1]}?rel=0&autoplay=0`;
  }

  return null;
};
