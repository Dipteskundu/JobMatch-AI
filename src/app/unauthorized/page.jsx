"use client";

import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center bg-white p-12 rounded-[2.5rem] shadow-xl border border-slate-100 animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <ShieldAlert className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-4">Access Denied</h1>
        <p className="text-slate-500 font-medium mb-10 leading-relaxed">
          You do not have permission to access this page. Please make sure you are logged in with the correct account.
        </p>
        <div className="space-y-4">
          <Link
            href="/dashboard"
            className="block w-full py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100"
          >
            Go to My Dashboard
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 py-4 text-slate-500 font-bold hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
