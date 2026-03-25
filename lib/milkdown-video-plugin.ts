/**
 * Utilities for video and image detection
 * 
 * In a real app with Milkdown, this would be a full plugin:
 * - Custom markdown parser for !video[alt](url) syntax
 * - Renderer for <video controls> elements
 * - Serializer back to markdown
 * 
 * For this POC, we just provide helper functions to detect media types.
 */

// Utility to check if URL is a video
export const isVideoUrl = (url: string): boolean => {
  return /\.(mp4|webm|ogg|mov|avi|flv|mkv)$/i.test(url);
};

// Utility to check if URL is an image
export const isImageUrl = (url: string): boolean => {
  return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
};

// Example of markdown to video syntax
export const markdownToVideoSyntax = (url: string, alt: string = "Video"): string => {
  return `!video[${alt}](${url})`;
};

// Example of parsing video syntax
export const parseVideoSyntax = (markdown: string): Array<{alt: string, url: string}> => {
  const videoRegex = /!video\[(.*?)\]\((.*?)\)/g;
  const matches = [];
  let match;
  
  while ((match = videoRegex.exec(markdown)) !== null) {
    matches.push({
      alt: match[1],
      url: match[2],
    });
  }
  
  return matches;
};
