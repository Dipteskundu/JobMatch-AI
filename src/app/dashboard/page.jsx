"use client";

import { useEffect } from "react";
import { useAuth } from "../lib/AuthContext";
<<<<<<< HEAD
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
=======
import {
  User,
  Briefcase,
  Shield,
  Users,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import Avatar from "../components/common/Avatar";
import CandidateDashboard from "./components/CandidateDashboard";
import RecruiterDashboard from "./components/RecruiterDashboard";
import AdminDashboard from "./components/AdminDashboard";
import { API_BASE } from "../lib/apiClient";

const ROLE_CONFIG = {
  candidate: {
    label: "Candidate",
    color: "text-indigo-700",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    icon: Briefcase,
  },
  recruiter: {
    label: "Recruiter",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: Users,
  },
  admin: {
    label: "Admin",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: Shield,
  },
};

export default function Dashboard() {
  const { user, isAuthenticated, claims } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const profileRes = await fetch(
          `${API_BASE}/api/auth/profile/${user.uid}`,
        );
        const profileData = await profileRes.json();
        const profile = profileData.data || {};
        setUserProfile(profile);

        const role = (claims && claims.role) || profile.role || "candidate";
        let dashUrl = "";
        if (role === "candidate")
          dashUrl = `/api/dashboard/candidate/${user.uid}`;
        else if (role === "recruiter")
          dashUrl = `/api/dashboard/recruiter/${user.uid}`;
        else if (role === "admin") dashUrl = `/api/dashboard/admin`;

        const dashRes = await fetch(`${API_BASE}${dashUrl}`);
        const dashJson = await dashRes.json();
        setDashboardData(dashJson.data || null);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Could not load dashboard data. The backend may be offline.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user?.uid]);

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
            className="block w-full bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Sign In
          </Link>
        </div>
>>>>>>> 76c074d (Save changes)
      </div>
    );
  }

<<<<<<< HEAD
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
=======
  const role = (claims && claims.role) || userProfile?.role || "candidate";
  const roleConfig = ROLE_CONFIG[role] || ROLE_CONFIG.candidate;
  const RoleIcon = roleConfig.icon;
  const firstName = user?.displayName?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-5 md:pt-5">
        {/* Page Header */}
        <header className="mb-8 animate-fade-up">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <Avatar src={user?.photoURL} size="w-14 h-14" ring={true} />
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"
                  aria-label="Online"
                  title="Online"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${roleConfig.bg} ${roleConfig.color} ${roleConfig.border}`}
                  >
                    <RoleIcon className="w-3 h-3" aria-hidden="true" />
                    {roleConfig.label}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Welcome back, {firstName}
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">{user?.email}</p>
              </div>
            </div>

            {role === "candidate" && (
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shrink-0"
              >
                <Briefcase className="w-4 h-4" aria-hidden="true" />
                Find Jobs
              </Link>
            )}
            {role === "recruiter" && (
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shrink-0"
              >
                <Users className="w-4 h-4" aria-hidden="true" />
                Browse Talent
              </Link>
            )}
          </div>
        </header>

        {/* Error Banner */}
        {error && !loading && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm font-medium animate-slide-in"
          >
            <AlertCircle
              className="w-5 h-5 shrink-0 mt-0.5 text-amber-500"
              aria-hidden="true"
            />
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div
            className="flex items-center justify-center py-20"
            aria-live="polite"
            aria-label="Loading dashboard"
          >
            <Loader2
              className="w-8 h-8 text-indigo-500 animate-spin"
              aria-hidden="true"
            />
            <span className="ml-3 text-slate-500 font-medium">
              Loading your dashboard...
            </span>
          </div>
        )}

        {/* Dashboard Content */}
        {!loading && (
          <div className="animate-fade-up delay-100">
            {role === "candidate" && (
              <CandidateDashboard
                user={user}
                data={dashboardData}
                loading={loading}
              />
            )}
            {role === "recruiter" && (
              <RecruiterDashboard
                user={user}
                data={dashboardData}
                loading={loading}
              />
            )}
            {role === "admin" && (
              <AdminDashboard
                user={user}
                data={dashboardData}
                loading={loading}
              />
            )}
          </div>
        )}
      </main>
      <Footer />
>>>>>>> 76c074d (Save changes)
    </div>
  );
}
