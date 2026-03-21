"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/lib/AuthContext";
import RoleGuard from "@/app/components/auth/RoleGuard";
import RecruiterDashboard from "@/app/dashboard/components/RecruiterDashboard";
import apiClient from "@/app/lib/apiClient";
import { Loader2 } from "lucide-react";
import DashboardLayout from "@/app/components/dashboard/layout/DashboardLayout";

export default function RecruiterDashboardPage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const fetchDashData = async () => {
      setLoading(true);
      try {
        const { data: dashJson } = await apiClient.get(`/api/dashboard/recruiter/${user.uid}`);
        setDashboardData(dashJson.data || null);
      } catch (err) {
        console.warn("Recruiter dashboard data unavailable:", err);
        setDashboardData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDashData();
  }, [user?.uid]);

  return (
    <RoleGuard allowedRoles={["recruiter"]}>
      <DashboardLayout>
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Recruiter Dashboard
            </h1>
            <p className="text-slate-500 font-medium">Manage your job listings and find top talent</p>
          </header>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <RecruiterDashboard user={user} data={dashboardData} loading={loading} />
          )}
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
