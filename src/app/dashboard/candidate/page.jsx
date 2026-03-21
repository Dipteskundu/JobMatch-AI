"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/lib/AuthContext";
import RoleGuard from "@/app/components/auth/RoleGuard";
import CandidateDashboard from "@/app/dashboard/components/CandidateDashboard";
import apiClient from "@/app/lib/apiClient";
import { Loader2 } from "lucide-react";
import DashboardLayout from "@/app/components/dashboard/layout/DashboardLayout";

export default function CandidateDashboardPage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const fetchDashData = async () => {
      setLoading(true);
      try {
        const { data: dashJson } = await apiClient.get(`/api/dashboard/candidate/${user.uid}`);
        setDashboardData(dashJson.data || null);
      } catch (err) {
        console.warn("Candidate dashboard data unavailable:", err);
        setDashboardData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDashData();
  }, [user?.uid]);

  return (
    <RoleGuard allowedRoles={["candidate"]}>
      <DashboardLayout>
        <div className="max-w-5xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Candidate Dashboard
            </h1>
            <p className="text-slate-500 font-medium">Manage your applications and track your progress</p>
          </header>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : (
            <CandidateDashboard user={user} data={dashboardData} loading={loading} />
          )}
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
