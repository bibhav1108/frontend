import { BACKEND_BASE_URL } from "../services/api";

/**
 * Resolves a profile image URL.
 * Handles null/undefined, partial paths, and existing full URLs.
 * Falls back to the backend's default profile picture if no image is provided.
 * 
 * @param {string} url - The image URL or partial path from the database.
 * @returns {string} - The fully resolved URL for use in an <img> src.
 */
export const resolveProfileImage = (url) => {
  // If no URL is provided, return the official backend default
  if (!url || url === "null" || url === "undefined") {
    return `${BACKEND_BASE_URL}/static/default_pfp.jpg`;
  }

  // If it's already a full HTTP(S) URL, return it as is
  if (url.startsWith("http")) {
    return url;
  }

  // Handle case where we might have double slashes if url starts with /
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  
  // Prefix with the backend base URL (removing the /api/v1 suffix if it exists there)
  const base = BACKEND_BASE_URL.replace("/api/v1", "");
  return `${base}${cleanUrl}`;
};
