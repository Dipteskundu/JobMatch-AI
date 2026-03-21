"use client";

import { useEffect } from "react";
import { useAuth } from "../lib/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2, User } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const { user, role, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated && role) {
      router.replace(`/dashboard/${role}`);
    }
  }, [role, loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center bg-white p-10 rounded-2xl shadow-sm border border-slate-200 max-w-sm w-full">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <User className="w-7 h-7 text-red-500" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">
            Sign in required
          </h1>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            You need to be signed in to access your dashboard.
          </p>
          <Link
            href="/signin"
            className="block w-full bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-4" />
        <p className="text-slate-500 font-medium">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
