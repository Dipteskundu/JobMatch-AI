import axios from "axios";

import { auth } from "./firebaseClient";

const cleanEnv = (value) =>
  typeof value === "string" ? value.trim() : value;

const rawBase = cleanEnv(process.env.NEXT_PUBLIC_API_BASE_URL) || "http://localhost:5000";

// Strip trailing slash
export const API_BASE = rawBase.endsWith("/") ? rawBase.slice(0, -1) : rawBase;

/**
 * In the browser we use a relative base URL so requests go through the
 * Next.js rewrite proxy → avoids CORS entirely.
 * On the server (SSR/RSC) we use the full backend URL directly.
 */
const baseURL =
  typeof window === "undefined"
    ? (typeof process !== "undefined" && process.env.VERCEL && !process.env.NEXT_PUBLIC_API_BASE_URL
        ? "http://SERVER_CONFIG_REQUIRED" // Fail fast with a clear error if misconfigured on Vercel
        : API_BASE)
    : "";               // client-side: relative → Next.js proxy handles it

const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined" && auth?.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        console.warn("Failed to attach ID token to request", err);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If it's a 500 error, return a resolved object to prevent UI crashes,
    // maintaining compatibility with how the app was originally built with authedFetch.
    if (error.response && error.response.status === 500) {
      return Promise.resolve({
        status: 500,
        data: {
          success: false,
          _serverError: true,
          message: error.response.data?.message || "Server error. Please try again later.",
          interviews: [],
          data: null,
          applications: [],
          jobs: [],
          notifications: [],
        },
      });
    }
    return Promise.reject(error);
  }
);

export default api;
