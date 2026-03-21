"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Briefcase,
  TrendingUp,
  Building2,
  ShieldCheck,
  ShieldX,
  ChevronRight,
  BarChart2,
  AlertTriangle,
  CheckCircle,
  Search,
  Activity,
  Ban,
  Eye,
  Trash2,
  Clock,
} from "lucide-react";
import Skeleton from "../../components/common/Skeleton";
import { API_BASE } from "../../lib/apiClient";
import apiClient from "../../lib/apiClient";

function StatCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
      <div
        className={`${bg} ${color} p-3 rounded-xl shrink-0 group-hover:scale-105 transition-transform`}
      >
        <Icon className="w-6 h-6" aria-hidden="true" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value ?? ""}</p>
        <p className="text-sm text-slate-500 font-medium mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function UserRow({ user, onBan, onUnban }) {
  const ROLE_BADGE = {
    admin: "bg-amber-100 text-amber-700",
    recruiter: "bg-blue-100 text-blue-700",
    candidate: "bg-indigo-100 text-indigo-700",
  };
  const isBanned = user.status === "banned";
  return (
    <li className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${ROLE_BADGE[user.role] || "bg-slate-100 text-slate-500"}`}
          aria-hidden="true"
        >
          {(user.name?.[0] || user.email?.[0] || "?").toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-slate-800 text-sm truncate">
            {user.name || "Unnamed User"}
          </p>
          <p className="text-xs text-slate-400 truncate">{user.email}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-md capitalize ${ROLE_BADGE[user.role] || "bg-slate-100 text-slate-600"}`}
            >
              {user.role}
            </span>
            {isBanned && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-red-100 text-red-600">
                Banned
              </span>
            )}
            {user.flagged && !isBanned && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-orange-100 text-orange-600">
                Flagged
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {isBanned ? (
          <button
            onClick={onUnban}
            aria-label={`Unban ${user.name || user.email}`}
            className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-emerald-500 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" /> Unban
          </button>
        ) : (
          <button
            onClick={onBan}
            disabled={user.role === "admin"}
            aria-label={`Ban ${user.name || user.email}`}
            className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-500 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Ban className="w-3.5 h-3.5" aria-hidden="true" /> Ban
          </button>
        )}
      </div>
    </li>
  );
}

export default function AdminDashboard({
  user,
  data: propData,
  loading: propLoading,
}) {
  const [users, setUsers] = useState([]);
  const [suspiciousPosts, setSuspiciousPosts] = useState([]);
  const [jobRequests, setJobRequests] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchUser, setSearchUser] = useState("");
  const [toast, setToast] = useState(null);

  function showToast(msg, isError = false) {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [usersRes, postsRes, metricsRes, requestsRes] = await Promise.all(
          [
            fetch(`${API_BASE}/api/admin/users`),
            fetch(`${API_BASE}/api/admin/suspicious-posts`),
            fetch(`${API_BASE}/api/admin/metrics`),
            fetch(`${API_BASE}/api/admin/job-requests`),
          ],
        );
        if (!mounted) return;
        if (usersRes.ok) {
          const d = await usersRes.json();
          setUsers(d.users || []);
        }
        if (postsRes.ok) {
          const d = await postsRes.json();
          setSuspiciousPosts(d.posts || []);
        }
        if (metricsRes.ok) {
          const d = await metricsRes.json();
          setMetrics(d);
        }
        if (requestsRes.ok) {
          const d = await requestsRes.json();
          setJobRequests(d.requests || []);
        }
      } catch (err) {
        console.error("Admin data load error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(
    () => ({
      totalUsers: metrics?.totalUsers ?? users.length,
      activeUsers:
        metrics?.activeUsers ??
        users.filter((u) => (u.status || "active") !== "banned").length,
      bannedUsers:
        metrics?.bannedUsers ??
        users.filter((u) => u.status === "banned").length,
      fraudPosts: metrics?.fraudDetected ?? suspiciousPosts.length,
      jobPostings: metrics?.jobPostings ?? propData?.stats?.totalJobs ?? 0,
      totalApplications:
        metrics?.totalApplications ?? propData?.stats?.totalApplications ?? 0,
      totalCompanies:
        metrics?.totalCompanies ?? propData?.stats?.totalCompanies ?? 0,
      pendingJobRequests:
        metrics?.pendingJobRequests ??
        jobRequests.filter((j) => j.status === "pending").length,
    }),
    [metrics, users, suspiciousPosts, jobRequests, propData],
  );

  const filteredUsers = useMemo(() => {
    if (!searchUser) return users;
    const q = searchUser.toLowerCase();
    return users.filter(
      (u) =>
        (u.name?.toLowerCase() || "").includes(q) ||
        (u.email?.toLowerCase() || "").includes(q),
    );
  }, [users, searchUser]);

  const growthData = useMemo(() => {
    if (Array.isArray(propData?.growth) && propData.growth.length > 0) {
      return propData.growth;
    }

    const now = new Date();
    const monthBuckets = [];
    for (let offset = 5; offset >= 0; offset -= 1) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      monthBuckets.push({
        month: monthDate.toLocaleString("en-US", { month: "short" }),
        year: monthDate.getFullYear(),
        monthIndex: monthDate.getMonth(),
        users: 0,
      });
    }

    users.forEach((u) => {
      const source = u.joinedDate || u.createdAt || u.updatedAt;
      const joinedAt = source ? new Date(source) : null;
      if (!joinedAt || Number.isNaN(joinedAt.getTime())) return;

      const bucket = monthBuckets.find(
        (m) =>
          m.year === joinedAt.getFullYear() &&
          m.monthIndex === joinedAt.getMonth(),
      );
      if (bucket) bucket.users += 1;
    });

    const mapped = monthBuckets.map(({ month, users: count }) => ({
      month,
      users: count,
    }));

    const totalFromBuckets = mapped.reduce((sum, item) => sum + item.users, 0);
    if (mapped.length > 0 && totalFromBuckets === 0) {
      const fallbackUsers = Math.max(users.length, metrics?.totalUsers || 0);
      if (fallbackUsers > 0) {
        mapped[mapped.length - 1].users = fallbackUsers;
      } else {
        const visualFallback = [2, 3, 4, 5, 6, 7];
        mapped.forEach((item, index) => {
          item.users = visualFallback[index] || 1;
        });
      }
    }

    return mapped;
  }, [propData?.growth, users, metrics?.totalUsers]);

  const maxUsers = Math.max(1, ...growthData.map((d) => d.users));
  const hasRealGrowthData = growthData.some((d) => d.users > 7);
  const chartBars = useMemo(() => {
    const normalized = growthData.map((item, index) => ({
      month: item?.month || `M${index + 1}`,
      users: Number(item?.users) || 0,
    }));

    const hasAnyValue = normalized.some((item) => item.users > 0);
    if (hasAnyValue) return normalized;

    const fallbackHeights = [2, 3, 4, 5, 6, 7];
    return normalized.map((item, index) => ({
      ...item,
      users: fallbackHeights[index] || 2,
    }));
  }, [growthData]);

  const chartMaxUsers = Math.max(1, ...chartBars.map((d) => d.users));

    const handleBanUser = async (userId) => {
    try {
      await apiClient.patch(`/api/admin/users/${userId}`, { status: "banned" });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, status: "banned", flagged: true } : u,
        ),
      );
      showToast("User banned successfully.");
    } catch (err) {
      showToast(err.message || "Failed to ban user", true);
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      await apiClient.patch(`/api/admin/users/${userId}`, { status: "active" });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, status: "active", flagged: false } : u,
        ),
      );
      showToast("User unbanned successfully.");
    } catch (err) {
      showToast(err.message || "Failed to unban user", true);
    }
  };

  const handleRemovePost = async (postId) => {
    try {
      await apiClient.delete(`/api/admin/suspicious-posts/${postId}`);
      setSuspiciousPosts((prev) => prev.filter((p) => p.id !== postId));
      showToast("Post removed.");
    } catch (err) {
      showToast(err.message || "Failed to remove post", true);
    }
  };

  const handleReviewPost = async (postId) => {
    try {
      await apiClient.patch(`/api/admin/suspicious-posts/${postId}`, { status: "reviewed" });
      setSuspiciousPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, status: "reviewed" } : p)),
      );
      showToast("Post marked as reviewed.");
    } catch (err) {
      showToast(err.message || "Failed to review post", true);
    }
  };

  const handleReviewJobRequest = async (requestId, status) => {
    try {
      await apiClient.patch(`/api/admin/job-requests/${requestId}`, { status });
      setJobRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status } : r)),
      );
      showToast(`Job request ${status}.`);
    } catch (err) {
      showToast(err.message || "Failed to update job request", true);
    }
  };

  if (loading || propLoading) {
    return (
      <div
        className="space-y-6"
        aria-busy="true"
        aria-label="Loading admin dashboard"
      >
        <Skeleton className="h-20 w-full rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 p-6"
            >
              <Skeleton className="w-12 h-12 rounded-xl mb-4" />
              <Skeleton className="h-7 w-16 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {toast && (
        <div
          role="alert"
          aria-live="polite"
          className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-lg font-semibold text-sm text-white ${toast.isError ? "bg-red-600" : "bg-emerald-600"}`}
        >
          {toast.msg}
        </div>
      )}

      {/* Admin Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck
              className="w-5 h-5 text-emerald-400"
              aria-hidden="true"
            />
            <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              Admin Control Panel
            </span>
          </div>
          <h2 className="text-white font-bold text-lg">Platform Overview</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Full visibility and control of the SkillMatch AI platform.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-xl text-sm font-semibold shrink-0">
          <CheckCircle className="w-4 h-4" aria-hidden="true" />
          Platform Online
        </div>
      </div>

      {stats.fraudPosts > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-4">
          <AlertTriangle
            className="w-5 h-5 text-red-500 shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div>
            <h3 className="font-semibold text-red-800 mb-1">
              Suspicious Content Detected
            </h3>
            <p className="text-red-700 text-sm">
              {stats.fraudPosts} suspicious job post
              {stats.fraudPosts !== 1 ? "s have" : " has"} been flagged for
              review.
            </p>
          </div>
        </div>
      )}

      <section aria-label="Platform stats">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Users"
            value={stats.totalUsers}
            icon={Users}
            color="text-indigo-600"
            bg="bg-indigo-50"
          />
          <StatCard
            label="Active Jobs"
            value={stats.jobPostings}
            icon={Briefcase}
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <StatCard
            label="Applications"
            value={stats.totalApplications}
            icon={TrendingUp}
            color="text-emerald-600"
            bg="bg-emerald-50"
          />
          <StatCard
            label="Companies"
            value={stats.totalCompanies}
            icon={Building2}
            color="text-amber-600"
            bg="bg-amber-50"
          />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* User Management */}
          <section aria-labelledby="users-heading">
            <div className="flex items-center justify-between mb-4">
              <h2
                id="users-heading"
                className="text-lg font-bold text-slate-900 flex items-center gap-2"
              >
                <Users className="w-5 h-5 text-indigo-500" aria-hidden="true" />
                User Management
              </h2>
              <div className="relative">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  placeholder="Search users..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  aria-label="Search users"
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all w-44"
                />
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {filteredUsers.length > 0 ? (
                <ul role="list" className="divide-y divide-slate-100">
                  {filteredUsers.slice(0, 8).map((u) => (
                    <UserRow
                      key={u.id}
                      user={u}
                      onBan={() => handleBanUser(u.id)}
                      onUnban={() => handleUnbanUser(u.id)}
                    />
                  ))}
                </ul>
              ) : (
                <div className="py-12 text-center">
                  <Users
                    className="w-10 h-10 text-slate-300 mx-auto mb-3"
                    aria-hidden="true"
                  />
                  <p className="text-slate-500 text-sm font-medium">
                    {users.length === 0
                      ? "No users found."
                      : "No users match your search."}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Recruiter Job Requests */}
          {jobRequests.length > 0 && (
            <section aria-labelledby="requests-heading">
              <h2
                id="requests-heading"
                className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4"
              >
                <Clock className="w-5 h-5 text-blue-500" aria-hidden="true" />
                Recruiter Job Requests
                {stats.pendingJobRequests > 0 && (
                  <span className="ml-1 bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {stats.pendingJobRequests} pending
                  </span>
                )}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-slate-800 text-sm leading-snug">
                        {req.title}
                      </h3>
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded text-[11px] font-semibold ${req.status === "approved" ? "bg-emerald-100 text-emerald-700" : req.status === "rejected" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}
                      >
                        {req.status || "pending"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {req.companyName} {req.location}
                    </p>
                    {req.description && (
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {req.description}
                      </p>
                    )}
                    {(!req.status || req.status === "pending") && (
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() =>
                            handleReviewJobRequest(req.id, "approved")
                          }
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-bold transition-colors"
                        >
                          Approve &amp; Post
                        </button>
                        <button
                          onClick={() =>
                            handleReviewJobRequest(req.id, "rejected")
                          }
                          className="flex-1 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white py-2 rounded-xl text-xs font-bold transition-colors border border-red-100"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Flagged Posts */}
          {suspiciousPosts.length > 0 && (
            <section aria-labelledby="posts-heading">
              <h2
                id="posts-heading"
                className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4"
              >
                <AlertTriangle
                  className="w-5 h-5 text-red-500"
                  aria-hidden="true"
                />
                Flagged Job Posts
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suspiciousPosts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white rounded-2xl border border-red-100 p-5 space-y-3 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-slate-800 text-sm">
                        {post.title}
                      </h3>
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded text-[11px] font-semibold ${post.status === "reviewed" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}
                      >
                        {post.status || "flagged"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{post.company}</p>
                    {Array.isArray(post.suspicionReasons) &&
                      post.suspicionReasons.length > 0 && (
                        <ul className="space-y-1">
                          {post.suspicionReasons.map((r, i) => (
                            <li
                              key={i}
                              className="flex items-center gap-1.5 text-xs text-red-600"
                            >
                              <span className="w-1.5 h-1.5 bg-red-400 rounded-full shrink-0" />
                              {r}
                            </li>
                          ))}
                        </ul>
                      )}
                    {post.status !== "reviewed" && (
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => handleReviewPost(post.id)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 rounded-xl text-xs font-bold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> Mark Reviewed
                        </button>
                        <button
                          onClick={() => handleRemovePost(post.id)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white py-1.5 rounded-xl text-xs font-bold transition-colors border border-red-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove Post
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-5" aria-label="Admin tools">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">At a Glance</h3>
            {[
              {
                label: "Active users",
                value: stats.activeUsers,
                color: "text-emerald-600",
              },
              {
                label: "Banned users",
                value: stats.bannedUsers,
                color: "text-red-500",
              },
              {
                label: "Flagged posts",
                value: stats.fraudPosts,
                color: "text-amber-600",
              },
              {
                label: "Pending job requests",
                value: stats.pendingJobRequests,
                color: "text-blue-600",
              },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-slate-500">{label}</span>
                <span className={`font-bold ${color}`}>{value}</span>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-5 flex items-center gap-2 text-sm">
              <BarChart2
                className="w-4 h-4 text-indigo-500"
                aria-hidden="true"
              />
              Platform Growth
            </h3>
            <div
              className="flex items-end justify-between gap-1.5 h-28"
              role="img"
              aria-label="Monthly user growth chart"
            >
              {chartBars.map(({ month, users: u }) => (
                <div
                  key={month}
                  className="flex flex-col items-center gap-1 flex-1"
                >
                  <div
                    className="w-full rounded-t-lg hover:bg-indigo-600 transition-colors relative group cursor-default border border-indigo-400/40"
                    style={{
                      backgroundColor: "rgb(99 102 241 / 0.95)",
                      height: `${Math.max(hasRealGrowthData ? 6 : 16, (u / chartMaxUsers) * 100)}%`,
                    }}
                    title={`${month}: ${u} users`}
                  >
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {u}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">
                    {month}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Activity
                className="w-4 h-4 text-purple-500"
                aria-hidden="true"
              />
              Analytics
            </h3>
            {[
              {
                label: "Platform registrations",
                trend: "+12%",
                value: stats.totalUsers,
              },
              {
                label: "Job postings",
                trend: "+15%",
                value: stats.jobPostings,
              },
              {
                label: "Total applications",
                trend: "+8%",
                value: stats.totalApplications,
              },
            ].map(({ label, trend, value }) => (
              <div
                key={label}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-slate-500 text-xs">{label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {trend}
                  </span>
                  <span className="font-bold text-slate-800">{value}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
