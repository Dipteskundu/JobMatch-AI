"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/AuthContext";
import { API_BASE } from "../lib/apiClient";

const acceptedTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

export default function ResumePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [result, setResult] = useState(null);

  const isAuthenticated = useMemo(() => !!user?.uid, [user]);

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0] || null;
    setError("");
    setSuccess("");

    if (!nextFile) {
      setFile(null);
      return;
    }

    if (nextFile.size > 10 * 1024 * 1024) {
      setError("File size must be 10MB or less.");
      setFile(null);
      return;
    }

    if (!acceptedTypes.includes(nextFile.type)) {
      setError("Please upload PDF, DOC, DOCX, or TXT format.");
      setFile(null);
      return;
    }

    setFile(nextFile);
  };

  const handleUpload = async () => {
    if (!isAuthenticated) {
      setError("Please sign in first to upload your resume.");
      return;
    }

    if (!file) {
      setError("Please select a resume file first.");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("candidateId", user.uid);

      const response = await fetch(`${API_BASE}/api/resume/upload`, {
        method: "POST",
        body: formData,
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || "Resume upload failed.");
      }

      setResult(payload?.data || null);
      setSuccess(
        payload?.warning
          ? `Resume uploaded with limited parsing: ${payload.warning}`
          : "Resume uploaded and analyzed successfully.",
      );
    } catch (uploadError) {
      setError(uploadError?.message || "Resume upload failed.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-24">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-slate-700 shadow-sm">
          Loading...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-24">
      <div className="mx-auto max-w-3xl space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Upload Resume</h1>
          <p className="mt-2 text-sm text-slate-600">
            Upload your resume to extract skills and improve matching quality.
          </p>

          {!isAuthenticated && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              You need to sign in before uploading your resume.
            </div>
          )}

          <div className="mt-6 space-y-4">
            <label className="block text-sm font-semibold text-slate-700">
              Resume file (PDF / DOC / DOCX / TXT)
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-indigo-700"
            />

            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {success}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading || !isAuthenticated}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploading ? "Uploading..." : "Upload & Analyze"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/profile")}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Go to Profile
              </button>
            </div>
          </div>
        </section>

        {result && (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Extracted Result
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Experience (years)
                </p>
                <p className="mt-2 text-lg font-bold text-slate-800">
                  {result.experience_years ?? 0}
                </p>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Roles
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  {(result.role_titles || []).join(", ") || "—"}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Skills
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  {(result.skills || []).join(", ") || "—"}
                </p>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Technologies
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  {(result.technologies || []).join(", ") || "—"}
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
