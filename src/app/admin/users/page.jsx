"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../lib/AuthContext";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { API_BASE } from "../../lib/apiClient";
import { ShieldX, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const fetchUsers = async () => {
      if (!user) return; // wait for auth
      setLoading(true);
      try {
        const headers = { "Content-Type": "application/json" };
        try {
          const token = await user.getIdToken();
          if (token) headers.Authorization = `Bearer ${token}`;
        } catch (e) {
          // token retrieval failed
        }

        const res = await fetch(`${API_BASE}/api/admin/users`, {
          headers,
          signal: controller.signal,
        });
        const json = await res.json().catch(() => ({}));
        if (!mounted) return;
        if (res.ok) setUsers(json.data || []);
        else
          setError(
            json.error ||
              json.message ||
              `Failed to load users (status ${res.status})`,
          );
      } catch (err) {
        if (!mounted) return;
        if (err.name === "AbortError") return;
        setError(String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchUsers();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">User Management</h1>
          <Link href="/dashboard" className="text-sm text-indigo-600">
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          {loading ? (
            <p className="text-sm text-slate-500">Loading users...</p>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-slate-500">No users found.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {users.map((u) => (
                <li
                  key={u.firebaseUid || u._id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-slate-800">
                      {u.displayName || u.email}
                    </p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${u.role === "admin" ? "bg-amber-100 text-amber-700" : u.role === "recruiter" ? "bg-blue-100 text-blue-700" : "bg-indigo-100 text-indigo-700"}`}
                    >
                      {u.role}
                    </span>
                    {u.banned ? (
                      <button className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded text-xs">
                        <ShieldCheck className="w-4 h-4" /> Unban
                      </button>
                    ) : (
                      <button className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1.5 rounded text-xs">
                        <ShieldX className="w-4 h-4" /> Ban
                      </button>
                    )}
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
