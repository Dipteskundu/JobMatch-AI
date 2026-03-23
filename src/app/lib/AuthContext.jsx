"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebaseClient";

const AuthContext = createContext(null);
const LOCAL_ADMIN_SESSION_EVENT = "local-admin-session-changed";

function getLocalAdminUser() {
  if (typeof window === "undefined") return null;
  const isLocalAdmin = localStorage.getItem("localAdminSession") === "true";
  if (!isLocalAdmin) return null;
  return {
    uid: "local-admin",
    email: "admin@admin.com",
    displayName: "Admin",
    isLocalAdmin: true,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(
    () => auth.currentUser || getLocalAdminUser(),
  );
  const [dbUser, setDbUser] = useState(null);
  const [role, setRole] = useState(null);
  const [claims, setClaims] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let resolved = false;
    const timeoutId = setTimeout(() => {
      if (!resolved) setLoading(false);
    }, 1500);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      resolved = true;
      clearTimeout(timeoutId);

      // local admin via localStorage takes precedence for local testing
      const adminUser = getLocalAdminUser();
      if (adminUser) {
        setUser(adminUser);
        setRole("admin");
        setDbUser(adminUser);
        setClaims(null);
        setLoading(false);
        return;
      }

      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          // attempt to fetch profile from backend
          const apiBase =
            process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";
          const resp = await fetch(
            `${apiBase}/api/auth/profile/${firebaseUser.uid}`,
          );
          if (resp.ok) {
            const result = await resp.json();
            if (result.success) {
              setDbUser(result.data);
              // Only default to candidate if no role exists
              if (result.data.role) {
                setRole(result.data.role);
              } else {
                // Check if user is likely a recruiter based on email domain or keywords
                const recruiterDomains = [
                  "@company.com",
                  "@recruiter.com",
                  "@hiring.com",
                ];
                const recruiterKeywords = [
                  "recruiter",
                  "hiring",
                  "talent",
                  "hr",
                  "staff",
                ];
                const emailDomain = firebaseUser.email
                  ? firebaseUser.email.toLowerCase()
                  : "";

                const isLikelyRecruiter =
                  recruiterDomains.some((domain) =>
                    emailDomain.includes(domain),
                  ) ||
                  recruiterKeywords.some(
                    (keyword) =>
                      emailDomain.includes(keyword) ||
                      (firebaseUser.displayName &&
                        firebaseUser.displayName
                          .toLowerCase()
                          .includes(keyword)),
                  );

                setRole(isLikelyRecruiter ? "recruiter" : "candidate");
              }
            }
          }
        } catch (err) {
          console.error("AuthContext: Failed to fetch profile", err);
        }

        try {
          const idTokenResult = await firebaseUser.getIdTokenResult();
          setClaims(idTokenResult.claims || null);
        } catch (e) {
          setClaims(null);
        }
      } else {
        setDbUser(null);
        setRole(null);
        setClaims(null);
      }

      setLoading(false);
    });

    const onStorage = (event) => {
      if (event.key !== "localAdminSession") return;
      if (event.newValue === "true") {
        const adminUser = getLocalAdminUser();
        setUser(adminUser);
        setRole("admin");
        setDbUser(adminUser);
        setClaims(null);
        setLoading(false);
      } else {
        setUser(auth.currentUser || null);
        setDbUser(null);
        setRole(null);
        setClaims(null);
      }
    };

    const onLocalAdminSessionChanged = () => {
      const adminUser = getLocalAdminUser();
      if (adminUser) {
        setUser(adminUser);
        setRole("admin");
        setDbUser(adminUser);
        setClaims(null);
        setLoading(false);
      } else {
        setUser(auth.currentUser || null);
        setDbUser(null);
        setRole(null);
        setClaims(null);
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(
      LOCAL_ADMIN_SESSION_EVENT,
      onLocalAdminSessionChanged,
    );

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        LOCAL_ADMIN_SESSION_EVENT,
        onLocalAdminSessionChanged,
      );
    };
  }, []);

  const logout = async () => {
    if (user?.isLocalAdmin) {
      localStorage.removeItem("localAdminSession");
      window.dispatchEvent(new Event(LOCAL_ADMIN_SESSION_EVENT));
      setUser(null);
      return;
    }
    await signOut(auth);
    setUser(null);
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setUser({ ...auth.currentUser });
      try {
        const idTokenResult = await auth.currentUser.getIdTokenResult(true);
        setClaims(idTokenResult.claims || null);
      } catch (e) {
        // ignore
      }
    }
  };

  const value = {
    user,
    dbUser,
    role,
    claims,
    loading,
    isAuthenticated: !!user,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
