
export const formatImagePath = (path: string) => {
  
  if (path.startsWith("http")) {
    return path;
  }else {
    return process.env.NEXT_PUBLIC_IMAGE_URL + path;
  }
};