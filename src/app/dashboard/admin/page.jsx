"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/lib/AuthContext";
import RoleGuard from "@/app/components/auth/RoleGuard";
import AdminDashboard from "@/app/dashboard/components/AdminDashboard";
import apiClient from "@/app/lib/apiClient";
import { Loader2 } from "lucide-react";
import DashboardLayout from "@/app/components/dashboard/layout/DashboardLayout";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const fetchDashData = async () => {
      setLoading(true);
      try {
        const { data: dashJson } = await apiClient.get(`/api/dashboard/admin`);
        setDashboardData(dashJson.data || null);
      } catch (err) {
        console.warn("Admin dashboard data unavailable:", err);
        setDashboardData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDashData();
  }, [user?.uid]);

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Admin Control Center
            </h1>
            <p className="text-slate-500 font-medium">Monitor platform activity and manage users</p>
          </header>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
          ) : (
            <AdminDashboard user={user} data={dashboardData} loading={loading} />
          )}
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
