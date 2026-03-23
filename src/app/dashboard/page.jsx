"use client";

import { useEffect } from "react";
import { useAuth } from "../lib/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { role, loading, isAuthenticated, user, claims } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      // Check if user is admin by email or claims
      const adminEmails = ["admin@admin.com", "admin@manager.com"];
      const isAdmin =
        user?.isLocalAdmin ||
        adminEmails.includes((user?.email || "").trim().toLowerCase()) ||
        claims?.role === "admin" ||
        role === "admin";

      // Check for pending role from signup
      const pendingRole = sessionStorage.getItem("pendingRole");

      // Redirect to appropriate dashboard
      if (isAdmin) {
        router.replace(`/dashboard/admin`);
      } else if (pendingRole) {
        // Use pending role from signup, then clear it
        router.replace(`/dashboard/${pendingRole}`);
        sessionStorage.removeItem("pendingRole");
      } else if (role) {
        router.replace(`/dashboard/${role}`);
      } else {
        // Fallback to candidate if no role is set
        router.replace(`/dashboard/candidate`);
      }
    }
  }, [role, loading, isAuthenticated, user, claims, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-slate-500 font-medium">
          Redirecting to your dashboard...
        </p>
      </div>
    );
  }
  return null;
}
