"use client";

import { useState, useEffect } from "react";
import {
  Briefcase,
  Users,
  TrendingUp,
  Target,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle,
  Star,
  BarChart2,
  Mail,
  X,
} from "lucide-react";
import Link from "next/link";
import { ref, onValue } from "firebase/database";
import { rtdb } from "@/app/lib/firebaseClient";
import Skeleton from "@/app/components/common/Skeleton";
import { useScrollReveal } from "@/app/lib/useScrollReveal";
import apiClient from "@/app/lib/apiClient";
import StatusChangeModal from "@/app/components/modals/StatusChangeModal";
import { toast } from "react-toastify";

function StatCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
      <div
        className={`${bg} ${color} p-3 rounded-xl shrink-0 group-hover:scale-105 transition-transform`}
      >
        <Icon className="w-6 h-6" aria-hidden="true" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500 font-medium mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function RecruiterDashboard({ user, data, loading }) {
  const [liveApplicantCounts, setLiveApplicantCounts] = useState({});

  // Debug logging
  useEffect(() => {
    console.log("🔍 DEBUG: RecruiterDashboard data:", data);
    console.log("🔍 DEBUG: data.jobs:", data?.jobs);
    if (data?.jobs) {
      data.jobs.forEach((job, i) => {
        console.log(
          `🔍 DEBUG: Job ${i}:`,
          job.title,
          "applicantsCount:",
          job.applicantsCount,
          "_id:",
          job._id,
        );
      });
    }
  }, [data]);
  const [showPostJob, setShowPostJob] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusChangeData, setStatusChangeData] = useState({
    applicant: null,
    newStatus: "",
  });
  const [jobForm, setJobForm] = useState({
    title: "",
    company: "",
    location: "",
    salaryRange: "",
    experienceLevel: "",
    employmentType: "",
    skills: "",
  });
  const [posting, setPosting] = useState(false);
  const [postMsg, setPostMsg] = useState(null);
  const revealRef = useScrollReveal();

  useEffect(() => {
    if (!data?.jobs || !rtdb) return;
    const unsubscribes = data.jobs.map((job) => {
      const countRef = ref(rtdb, `jobApplicants/${job._id}`);
      return onValue(countRef, (snapshot) => {
        const val = snapshot.val();
        if (val?.count !== undefined) {
          setLiveApplicantCounts((prev) => ({ ...prev, [job._id]: val.count }));
        }
      });
    });
    return () => unsubscribes.forEach((u) => u());
  }, [data?.jobs]);

  if (loading) {
    return (
      <div
        className="space-y-6"
        aria-busy="true"
        aria-label="Loading recruiter dashboard"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 p-6"
            >
              <Skeleton className="w-12 h-12 rounded-xl mb-4" />
              <Skeleton className="h-7 w-16 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Active Jobs",
      value: data?.stats?.activeJobs ?? "0",
      icon: Briefcase,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Total Applicants",
      value: data?.stats?.totalApplicants ?? "0",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Shortlisted",
      value: data?.stats?.shortlisted ?? "0",
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Interviews Set",
      value: data?.stats?.interviews ?? "0",
      icon: Target,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  const handlePostJob = async (e) => {
    e.preventDefault();
    setPosting(true);
    try {
      const { data: result } = await apiClient.post("/api/jobs/request", {
        ...jobForm,
        recruiterEmail: user?.email || "",
        recruiterUid: user?.uid || "",
        skills: jobForm.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      if (result.success) {
        setPostMsg({
          type: "success",
          text: "Job request submitted for admin approval.",
        });
        setJobForm({
          title: "",
          company: "",
          location: "",
          salaryRange: "",
          experienceLevel: "",
          employmentType: "",
          skills: "",
        });
        setShowPostJob(false);
      } else {
        setPostMsg({
          type: "error",
          text: result.message || "Failed to submit job request.",
        });
      }
    } catch {
      setPostMsg({ type: "error", text: "Network error. Please try again." });
    }
    setPosting(false);
    setTimeout(() => setPostMsg(null), 4000);
  };

  const handleStatusChange = (applicant, newStatus) => {
    // Show confirmation modal instead of directly changing status
    setStatusChangeData({
      applicant,
      newStatus,
    });
    setShowStatusModal(true);
  };

  const confirmStatusChange = async () => {
    const { applicant, newStatus } = statusChangeData;

    try {
      await apiClient.put(`/api/applications/${applicant._id}/status`, {
        status: newStatus,
      });

      const statusMessages = {
        shortlisted: "Applicant shortlisted successfully!",
        interviewing: "Applicant moved to interviewing stage!",
        selected: "Applicant selected for the position!",
        rejected: "Applicant status updated to rejected.",
      };

      toast.success(
        statusMessages[newStatus] || "Status updated successfully!",
      );

      // Refresh the dashboard data to show updated status
      window.location.reload();
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Failed to update status. Please try again.");
    }
  };

  const handleContact = async (applicant) => {
    const email = applicant.email || applicant.firebaseUid;
    const subject = `Regarding your application for ${applicant.jobTitle || "a position"}`;
    const body = `Hi ${applicant.email?.split("@")[0] || "Candidate"},\n\nI'm reaching out regarding your application for ${applicant.jobTitle || "a position"} at ${applicant.company || "our company"}.\n\nI'd like to discuss the next steps in the hiring process.\n\nBest regards,\n${user?.displayName || "Hiring Team"}`;

    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, "_blank");
  };

  return (
    <div className="space-y-8" ref={revealRef}>
      {/* Toast */}
      {postMsg && (
        <div
          role="alert"
          aria-live="polite"
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg font-semibold text-sm text-white transition-all ${postMsg.type === "success" ? "bg-emerald-600" : "bg-red-600"}`}
        >
          {postMsg.text}
          <button
            onClick={() => setPostMsg(null)}
            aria-label="Dismiss"
            className="ml-1 opacity-80 hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats */}
      <section aria-label="Recruiter stats" className="reveal">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      </section>

      {/* Post Job Banner */}
      <div className="reveal delay-100 bg-indigo-600 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-white font-bold text-lg">Post a New Job</h2>
          <p className="text-indigo-200 text-sm mt-0.5">
            Reach thousands of qualified candidates instantly.
          </p>
        </div>
        <button
          onClick={() => setShowPostJob(!showPostJob)}
          aria-expanded={showPostJob}
          aria-controls="post-job-form"
          className="inline-flex items-center gap-2 bg-white text-indigo-700 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-50 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 shrink-0"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          {showPostJob ? "Cancel" : "Post Job"}
        </button>
      </div>

      {/* Post Job Form */}
      {showPostJob && (
        <div
          id="post-job-form"
          className="bg-white rounded-2xl border border-slate-200 p-6"
        >
          <h3 className="font-bold text-slate-900 mb-5">Job Details</h3>
          <form
            onSubmit={handlePostJob}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {[
              {
                label: "Job Title",
                key: "title",
                placeholder: "e.g. Senior React Developer",
                required: true,
              },
              {
                label: "Company",
                key: "company",
                placeholder: "e.g. Google",
                required: true,
              },
              {
                label: "Location",
                key: "location",
                placeholder: "e.g. Remote / New York",
                required: true,
              },
              {
                label: "Salary Range",
                key: "salaryRange",
                placeholder: "e.g. $80k – $120k",
              },
              {
                label: "Experience Level",
                key: "experienceLevel",
                placeholder: "e.g. Mid-level",
              },
              {
                label: "Employment Type",
                key: "employmentType",
                placeholder: "e.g. Full-time",
              },
            ].map(({ label, key, placeholder, required }) => (
              <div key={key}>
                <label
                  htmlFor={`job-${key}`}
                  className="block text-xs font-semibold text-slate-600 mb-1.5"
                >
                  {label}
                  {required && (
                    <span className="text-red-500 ml-0.5" aria-hidden="true">
                      *
                    </span>
                  )}
                </label>
                <input
                  id={`job-${key}`}
                  type="text"
                  placeholder={placeholder}
                  value={jobForm[key]}
                  onChange={(e) =>
                    setJobForm((f) => ({ ...f, [key]: e.target.value }))
                  }
                  required={required}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label
                htmlFor="job-skills"
                className="block text-xs font-semibold text-slate-600 mb-1.5"
              >
                Required Skills{" "}
                <span className="text-slate-400 font-normal">
                  (comma-separated)
                </span>
              </label>
              <input
                id="job-skills"
                type="text"
                placeholder="e.g. React, Node.js, TypeScript"
                value={jobForm.skills}
                onChange={(e) =>
                  setJobForm((f) => ({ ...f, skills: e.target.value }))
                }
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={posting}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60"
              >
                {posting ? "Posting..." : "Post Job"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applicants */}
        <div className="lg:col-span-2 space-y-4">
          <section aria-labelledby="applicants-heading">
            <h2
              id="applicants-heading"
              className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4"
            >
              <Users className="w-5 h-5 text-indigo-500" aria-hidden="true" />
              Recent Applicants
            </h2>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {Array.isArray(data?.recentApplications) &&
              data.recentApplications.length > 0 ? (
                <ul role="list" className="divide-y divide-slate-100">
                  {data.recentApplications.map((app, i) => (
                    <li
                      key={i}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center font-bold text-indigo-500 text-sm shrink-0"
                          aria-hidden="true"
                        >
                          {app.email?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 text-sm truncate">
                            {app.email}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 truncate">
                            {app.jobTitle} — {app.company}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap shrink-0">
                        <label
                          htmlFor={`status-${app._id || i}`}
                          className="sr-only"
                        >
                          Update status for {app.email}
                        </label>
                        <select
                          id={`status-${app._id || i}`}
                          defaultValue={app.status || "submitted"}
                          onChange={(e) =>
                            handleStatusChange(app, e.target.value)
                          }
                          className="text-xs font-medium border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                        >
                          <option value="submitted">Submitted</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="interviewing">Interviewing</option>
                          <option value="rejected">Rejected</option>
                          <option value="selected">Selected</option>
                        </select>
                        <button
                          onClick={() => handleContact(app)}
                          className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-50 hover:text-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        >
                          <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                          Contact
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="py-12 text-center">
                  <Users
                    className="w-10 h-10 text-slate-300 mx-auto mb-3"
                    aria-hidden="true"
                  />
                  <p className="text-slate-500 font-medium text-sm">
                    No applicants yet
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    Post a job to start receiving applications.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5" aria-label="Recruiter tools">
          {/* Hiring Score */}
          <div className="bg-slate-900 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-amber-400" aria-hidden="true" />
              <h3 className="font-bold text-sm">AI Hiring Score Formula</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: "Skill Match", pct: 50, color: "bg-indigo-500" },
                { label: "Test Score", pct: 30, color: "bg-blue-500" },
                { label: "Experience", pct: 20, color: "bg-cyan-500" },
              ].map(({ label, pct, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-slate-400">{label}</span>
                    <span className="text-white font-bold">{pct}%</span>
                  </div>
                  <div
                    className="h-1.5 bg-slate-700 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${label}: ${pct}%`}
                  >
                    <div
                      className={`h-full ${color} rounded-full`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-slate-500 text-xs mt-4">
              Candidates are ranked by our AI model using this formula.
            </p>
          </div>

          {/* Active Jobs */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm">
              <BarChart2
                className="w-4 h-4 text-indigo-500"
                aria-hidden="true"
              />
              Active Jobs
            </h3>
            {Array.isArray(data?.jobs) && data.jobs.length > 0 ? (
              <ul role="list" className="space-y-2">
                {data.jobs.map((job, i) => (
                  <li
                    key={job._id ?? i}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-indigo-50 transition-colors group"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 truncate">
                        {job.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {liveApplicantCounts[job._id] ??
                          job.applicantsCount ??
                          0}{" "}
                        applicants
                      </p>
                    </div>
                    <ChevronRight
                      className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 shrink-0 ml-2"
                      aria-hidden="true"
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">No active jobs yet.</p>
            )}
          </div>
        </aside>
      </div>

      {/* Status Change Confirmation Modal */}
      <StatusChangeModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        applicant={statusChangeData.applicant}
        newStatus={statusChangeData.newStatus}
        onConfirm={confirmStatusChange}
      />
    </div>
  );
}
