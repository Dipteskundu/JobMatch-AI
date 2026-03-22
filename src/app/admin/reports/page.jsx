"use client";

import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import Link from "next/link";

export default function AdminReportsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Platform Reports</h1>
          <Link href="/dashboard" className="text-sm text-indigo-600">
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-sm text-slate-600">
            Summary reports and charts will appear here. For now, use the
            dashboard graphs.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
