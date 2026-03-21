"use client";

import DashboardLayout from "@/app/components/dashboard/layout/DashboardLayout";
import { Construction, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/app/lib/AuthContext";

export default function PlaceholderPage({ title, description }) {
  const { role } = useAuth();

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <Construction className="w-10 h-10 text-indigo-500" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-4">{title}</h1>
        <p className="text-slate-500 font-medium mb-10 max-w-md mx-auto leading-relaxed">
          {description || "We're working hard to bring this feature to you. Stay tuned for updates!"}
        </p>
        <Link
          href={`/dashboard/${role}`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>
      </div>
    </DashboardLayout>
  );
}
