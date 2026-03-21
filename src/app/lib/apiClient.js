/**
 * Centralized API client using axios.
 * All requests are routed through the Next.js /backend proxy rewrite,
 * which forwards them server-side to avoid CORS issues.
 */
import axios from "axios";

// The proxy prefix defined in next.config.mjs rewrites
export const API_BASE = "/backend";

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor: unwrap data or throw a clean error
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";
    return Promise.reject(new Error(message));
  },
);

export default apiClient;
