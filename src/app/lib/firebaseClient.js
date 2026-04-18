// Firebase client initialization for the frontend

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";

function cleanEnv(value) {
  return typeof value === "string" ? value.trim() : value;
}

function hasValue(value) {
  if (typeof value !== "string") return false;
  const v = value.trim();
  if (!v) return false;
  if (v.toLowerCase() === "undefined") return false;
  if (v.toLowerCase() === "null") return false;
  return true;
}

function looksLikePlaceholder(value) {
  if (typeof value !== "string") return false;
  return /(your_|your-|\bexample\b|\bchangeme\b)/i.test(value);
}

function normalizeDatabaseUrl(rawUrl) {
  const value = String(cleanEnv(rawUrl) || "").trim();
  if (!value) return "";

  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    const url = new URL(withScheme);
    const hostname = url.hostname.toLowerCase();

    // If it already ends with valid firebase domains, keep it as is.
    if (hostname.endsWith(".firebaseio.com") || hostname.endsWith(".firebasedatabase.app")) {
      return url.origin;
    }

    // Legacy fallback for very old projects or partial URLs
    if (hostname && !hostname.includes(".")) {
      return `https://${hostname}.firebaseio.com`;
    }

    return url.origin;
  } catch {
    return value.replace(/\/+$/, "");
  }
}

const firebaseConfig = {
  apiKey: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
  databaseURL: normalizeDatabaseUrl(
    cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL),
  ),
};

export const firebaseConfigured =
  hasValue(firebaseConfig.apiKey) &&
  !looksLikePlaceholder(firebaseConfig.apiKey) &&
  hasValue(firebaseConfig.projectId) &&
  !looksLikePlaceholder(firebaseConfig.projectId);

export const firebaseClientStatus = {
  configured: firebaseConfigured,
  projectId: firebaseConfig.projectId || "",
  initError: null,
  authError: null,
};

const realtimeDatabaseUrl = firebaseConfig.databaseURL;

const app = (() => {
  if (!firebaseConfigured) return null;
  try {
    return !getApps().length ? initializeApp(firebaseConfig) : getApp();
  } catch (err) {
    // If Firebase config is present but invalid, avoid crashing the whole app at import time.
    firebaseClientStatus.initError =
      err?.code || err?.message || String(err);
    console.warn("Firebase client init failed. Auth features disabled.", err);
    return null;
  }
})();

export const auth = (() => {
  if (!app) return null;
  try {
    return getAuth(app);
  } catch (err) {
    firebaseClientStatus.authError = err?.code || err?.message || String(err);
    console.warn("Firebase Auth init failed. Auth features disabled.", err);
    return null;
  }
})();
export const googleProvider = new GoogleAuthProvider();
export const rtdb = realtimeDatabaseUrl
  ? app
    ? getDatabase(app, realtimeDatabaseUrl)
    : null
  : null;

export default app;
