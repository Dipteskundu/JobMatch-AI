"use client";

import React, { useEffect, useState } from "react";
import apiClient from "@/app/lib/apiClient";
import Skeleton from "@/app/components/common/Skeleton";
import { Users, Briefcase, BarChart2, FileText } from "lucide-react";

function StatCard({ label, value, icon: Icon, bg = "bg-slate-50", color = "text-slate-700" }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-4 hover:shadow-sm transition">
      <div className={`${bg} p-3 rounded-xl shrink-0`}>
        <Icon className={`w-6 h-6 ${color}`} aria-hidden="true" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500 font-medium mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard({ user, data, loading }) {
  const [localData, setLocalData] = useState(data || null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await apiClient.get(`/api/dashboard/admin`);
      setLocalData(res.data?.data || null);
    } catch (err) {
      console.warn("Failed to refresh admin dashboard:", err);
    }
    setRefreshing(false);
  };

  if (loading && !localData) {
    return (
      <div className="space-y-6" aria-busy="true">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  const stats = [
    { label: "Total Users", value: localData?.stats?.users ?? 0, icon: Users, bg: "bg-indigo-50", color: "text-indigo-600" },
    { label: "Active Jobs", value: localData?.stats?.jobs ?? 0, icon: Briefcase, bg: "bg-blue-50", color: "text-blue-600" },
    { label: "Applications", value: localData?.stats?.applications ?? 0, icon: FileText, bg: "bg-emerald-50", color: "text-emerald-600" },
    { label: "Reports", value: localData?.stats?.reports ?? 0, icon: BarChart2, bg: "bg-amber-50", color: "text-amber-600" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
        <div className="shrink-0">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-slate-100 text-slate-800 rounded-xl font-semibold hover:bg-slate-200 disabled:opacity-60"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-4">Recent Activity</h3>
          {Array.isArray(localData?.recent) && localData.recent.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {localData.recent.map((r, i) => (
                <li key={r.id ?? i} className="py-3">
                  <p className="text-sm text-slate-800 font-medium">{r.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{r.detail}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No recent activity.</p>
          )}
        </section>

        <aside className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <h4 className="font-semibold text-slate-900">Quick Actions</h4>
            <div className="mt-3 grid grid-cols-1 gap-2">
              <a href="/dashboard/admin/users" className="block text-sm text-indigo-600 font-medium">Manage Users</a>
              <a href="/dashboard/admin/jobs" className="block text-sm text-indigo-600 font-medium">Review Jobs</a>
              <a href="/dashboard/admin/reports" className="block text-sm text-indigo-600 font-medium">View Reports</a>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <h4 className="font-semibold text-slate-900">System</h4>
            <p className="text-sm text-slate-500 mt-2">Last updated: {localData?.updatedAt ? new Date(localData.updatedAt).toLocaleString() : "—"}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

