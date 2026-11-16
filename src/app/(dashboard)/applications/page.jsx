"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useAuth } from "../../lib/AuthContext";
import api, { API_BASE } from "../../lib/apiClient";
import { signInUrlWithReturn } from "../../lib/redirect";
import ApplicationPulseTracker from "../../dashboard/components/candidate/ApplicationPulseTracker";

export default function ApplicationsPage() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.uid) {
      setLoading(false);
      return;
    }

    const fetchApps = async () => {
    try {
        setLoading(true);
        const res = await api.get(`/api/dashboard/candidate/${user.uid}`);
        const json = res.data;
        if (json.success) {
            setApplications(json.data.applications || []);
        } else {
            setError(json.message || "Failed to load applications");
        }
      } catch (err) {
        console.error(err);
        setError("Server error while fetching applications");
      } finally {
        setLoading(false);
      }
    };

    fetchApps();
  }, [isAuthenticated, user]);

  return (
    <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-6">My Applications</h1>

        {!isAuthenticated && (
          <Link
            href={signInUrlWithReturn("/applications")}
            className="text-indigo-600 font-semibold underline underline-offset-2 hover:text-indigo-700"
          >
            Sign in to see your applications.
          </Link>
        )}

        {loading && <p className="text-slate-500">Loading applications…</p>}

        {!loading && error && <p className="text-red-600">{error}</p>}

        {!loading && !error && isAuthenticated && applications.length === 0 && (
          <div className="p-6 border rounded-md bg-white/5">
            <p className="text-slate-400">You have no applications yet.</p>
            <Link
              href="/jobs"
              className="text-indigo-500 underline mt-3 inline-block"
            >
              Browse jobs
            </Link>
          </div>
        )}

        {!loading && !error && applications.length > 0 && (
          <ul className="space-y-4">
            {applications.map((app) => (
              <li key={app._id} className="p-4 border rounded-md bg-white/3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold">
                      <Link href={`/jobs/${app.jobId}`}>
                        {app.jobTitle || "Job"}
                      </Link>
                    </h3>
                    <p className="text-sm text-slate-400">{app.company}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Applied on: {new Date(app.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 rounded-full bg-indigo-600 text-white font-bold text-sm">
                      {app.status}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <ApplicationPulseTracker application={app} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
  );
}
