"use client";

import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import Link from "next/link";

export default function AdminSecurityPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Security Settings</h1>
          <Link href="/dashboard" className="text-sm text-indigo-600">
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <p className="text-sm text-slate-600">
            Security controls for the platform will live here.
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Require MFA for admins</p>
              <p className="text-xs text-slate-500">
                Enforce multi-factor authentication for admin accounts.
              </p>
            </div>
            <button className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm">
              Enable
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
