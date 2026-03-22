"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import Link from "next/link";
import { API_BASE } from "../../lib/apiClient";

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/jobs`);
        const json = await res.json();
        if (!mounted) return;
        if (res.ok) setJobs(json.data || json || []);
        else setError(json.error || json.message || "Failed to load jobs");
      } catch (err) {
        if (!mounted) return;
        setError(String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchJobs();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Manage Jobs</h1>
          <Link href="/dashboard" className="text-sm text-indigo-600">
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          {loading ? (
            <p className="text-sm text-slate-500">Loading jobs...</p>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : jobs.length === 0 ? (
            <p className="text-sm text-slate-500">No job posts found.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {jobs.map((job) => (
                <li
                  key={job._id || job.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-slate-800">{job.title}</p>
                    <p className="text-xs text-slate-400">
                      {job.company} · {job.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded">
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
