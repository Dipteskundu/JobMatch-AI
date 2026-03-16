// Firebase client initialization for the frontend

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";

function cleanEnv(value) {
  return typeof value === "string" ? value.trim() : value;
}

function normalizeDatabaseUrl(rawUrl) {
  const value = String(cleanEnv(rawUrl) || "").trim();
  if (!value) return "";

  return value.replace(
    /^https:\/\/([^.]+)\.firebaseio\.com\/?$/i,
    "https://$1.firebasedatabase.app",
  );
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

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const realtimeDatabaseUrl = firebaseConfig.databaseURL;

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const rtdb = realtimeDatabaseUrl
  ? getDatabase(app, realtimeDatabaseUrl)
  : null;

export default app;
