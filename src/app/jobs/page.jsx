"use client";

import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import ApplyModal from "../components/form/ApplyModal";
import FitMapModal from "../components/FitMap/FitMapModal";
import ProfileMatchButton from "../components/FitMap/ProfileMatchButton";
import ShareJobButton from "../components/jobs/ShareJobButton";
import { useAuth } from "../lib/AuthContext";
import {
  Search,
  MapPin,
  Building2,
  Briefcase,
  DollarSign,
  Filter,
  Star,
  Lock,
  ChevronLeft,
  ChevronRight,
  X,
  SlidersHorizontal,
  AlertCircle,
  LogIn,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageWrapper from "../components/common/PageWrapper";
import api, { API_BASE } from "../lib/apiClient";
import { signInUrlWithReturn } from "../lib/redirect";

const JOBS_PER_PAGE = 9;

const JOB_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Remote",
  "Internship",
];
const SALARY_RANGES = [
  { label: "Any salary", min: 0, max: Infinity },
  { label: "$0 – $50k", min: 0, max: 50000 },
  { label: "$50k – $80k", min: 50000, max: 80000 },
  { label: "$80k – $120k", min: 80000, max: 120000 },
  { label: "$120k – $160k", min: 120000, max: 160000 },
  { label: "$160k+", min: 160000, max: Infinity },
];

/** Parse "$80k – $120k" or "80000 - 120000" into a mid-point number for comparison */
function parseSalaryMid(salaryStr = "") {
  const nums = salaryStr.replace(/[$k,]/gi, "").match(/\d+/g);
  if (!nums) return null;
  const values = nums.map(
    (n) => parseFloat(n) * (salaryStr.toLowerCase().includes("k") ? 1000 : 1),
  );
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** Auth-gate overlay card shown over locked filters */
function LockOverlay() {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-white/80 backdrop-blur-[3px] border border-slate-100">
      <div className="flex flex-col items-center gap-3 text-center px-4">
        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
          <Lock className="w-5 h-5 text-indigo-600" />
        </div>
        <p className="text-sm font-bold text-slate-800">
          Sign in to use filters
        </p>
        <p className="text-xs text-slate-400">
          Unlock smart search, salary ranges &amp; more
        </p>
        <Link
          href={signInUrlWithReturn("/jobs")}
          className="mt-1 inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <LogIn className="w-4 h-4" /> Sign In
        </Link>
      </div>
    </div>
  );
}

/** Pagination row */
function Pagination({ current, total, onChange }) {
  if (total <= 1) return null;
  const pages = Array.from({ length: total }, (_, i) => i + 1);
  return (
    <nav
      className="flex items-center justify-center gap-1.5 mt-12"
      aria-label="Pagination"
    >
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((p) => {
        const isEllipsis =
          total > 7 &&
          p !== 1 &&
          p !== total &&
          (p < current - 2 || p > current + 2);
        if (isEllipsis) {
          if (p === current - 3 || p === current + 3)
            return (
              <span key={p} className="px-1 text-slate-400">
                …
              </span>
            );
          return null;
        }
        return (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold transition-colors ${
              p === current
                ? "bg-indigo-600 text-white shadow-sm"
                : "border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
            aria-current={p === current ? "page" : undefined}
          >
            {p}
          </button>
        );
      })}

      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}

function AiMatchedPromo({ onUploadResume }) {
  return (
    <div className="p-6 bg-slate-900 rounded-2xl text-white relative overflow-hidden group">
      <div className="relative z-10">
        <h4 className="text-base font-bold mb-1">Get AI-Matched</h4>
        <p className="text-slate-400 text-xs mb-4 leading-relaxed">
          Upload your resume and let our AI find perfect roles for you.
        </p>
        <button
          onClick={onUploadResume}
          className="w-full py-2.5 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors"
        >
          Upload Resume
        </button>
      </div>
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-600/20 rounded-full blur-2xl group-hover:bg-indigo-600/40 transition-all duration-500" />
    </div>
  );
}

export default function JobsPage() {
  const { user, role, isAuthenticated } = useAuth();
  const router = useRouter();
  const apiBase = API_BASE;

  /* ── Data ─────────────────────────────────────── */
  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState("");

  /* ── Filters (only active when authenticated) ─── */
  const [searchTerm, setSearchTerm] = useState("");
  const [locationTerm, setLocationTerm] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [salaryRange, setSalaryRange] = useState(0); // index into SALARY_RANGES
  const [sortBy, setSortBy] = useState("newest");
  const [filtersOpen, setFiltersOpen] = useState(false); // mobile

  /* ── Recruiter apply guard ────────────────────── */
  const [showRecruiterModal, setShowRecruiterModal] = useState(false);

  const isRecruiter = role === "recruiter";

  /* ── Fit Map ──────────────────────────────────── */
  const [fitJob, setFitJob] = useState(null);

  /* ── Modal ────────────────────────────────────── */
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /* ── Pagination ───────────────────────────────── */
  const [currentPage, setCurrentPage] = useState(1);

  /* ── Fetch ────────────────────────────────────── */
  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await api.get("/api/jobs");
        if (!Array.isArray(res.data?.data)) {
          throw new Error("Unexpected response from the jobs API");
        }
        setJobs(res.data.data);
        // If user is authenticated, also fetch their applications to hide applied jobs
        if (isAuthenticated && user?.uid) {
          try {
            const dashRes = await api.get(`/api/dashboard/candidate/${user.uid}`);
            const apps = dashRes.data.data?.applications || [];
              const ids = new Set();
              const normalize = (val) => {
                if (!val) return "";
                if (typeof val === "string") return val;
                if (val.$oid) return val.$oid;
                try {
                  const s = String(val);
                  const m = s.match(/([a-f0-9]{24})/i);
                  if (m) return m[1];
                  return s;
                } catch (e) {
                  return "";
                }
              };
              apps.forEach((a) => {
                const jid = normalize(a.jobId);
                if (jid) ids.add(jid);
              });
              setAppliedJobIds(ids);
          } catch (err) {
            console.error("Failed to fetch candidate applications:", err);
          }
        }
      } catch (err) {
        console.error("Failed to fetch jobs", err);
        setError("Could not load jobs. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, [apiBase, isAuthenticated, user]);

  /* ── Auto-Open Modal from Notification Link ───── */
  useEffect(() => {
    if (jobs.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const applyJobId = params.get("applyJobId");
      if (applyJobId) {
        const jobToApply = jobs.find((j) => j._id === applyJobId);
        if (jobToApply) {
          setSelectedJob(jobToApply);
          setIsModalOpen(true);

          // Clean up URL without reloading page
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }
      }
    }
  }, [jobs]);

  /* ── Toggle job type filter ───────────────────── */
  const toggleType = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
    setCurrentPage(1);
  };

  /* ── Clear all filters ────────────────────────── */
  const clearFilters = () => {
    setSearchTerm("");
    setLocationTerm("");
    setSelectedTypes([]);
    setSalaryRange(0);
    setSortBy("newest");
    setCurrentPage(1);
  };

  /* ── Derived: filtered + sorted list ─────────── */
  const filtered = (() => {
    let list = [...jobs];

    if (isAuthenticated) {
      if (searchTerm.trim()) {
        const t = searchTerm.toLowerCase();
        list = list.filter(
          (j) =>
            (j.title && j.title.toLowerCase().includes(t)) ||
            (j.company && j.company.toLowerCase().includes(t)) ||
            (j.skills && j.skills.join(" ").toLowerCase().includes(t)) ||
            (j.tags && j.tags.join(" ").toLowerCase().includes(t)),
        );
      }

      if (locationTerm.trim()) {
        const l = locationTerm.toLowerCase();
        list = list.filter(
          (j) => j.location && j.location.toLowerCase().includes(l),
        );
      }

      if (selectedTypes.length > 0) {
        list = list.filter((j) =>
          selectedTypes.some((t) =>
            (j.employmentType || j.type || "")
              .toLowerCase()
              .includes(t.toLowerCase()),
          ),
        );
      }

      const { min, max } = SALARY_RANGES[salaryRange];
      if (min > 0 || max !== Infinity) {
        list = list.filter((j) => {
          const mid = parseSalaryMid(j.salary || j.salaryRange);
          if (mid === null) return true; // keep jobs with unknown salary
          return mid >= min && mid <= max;
        });
      }

      if (sortBy === "salary-high") {
        list.sort(
          (a, b) =>
            (parseSalaryMid(b.salary || b.salaryRange) || 0) -
            (parseSalaryMid(a.salary || a.salaryRange) || 0),
        );
      } else if (sortBy === "salary-low") {
        list.sort(
          (a, b) =>
            (parseSalaryMid(a.salary || a.salaryRange) || 0) -
            (parseSalaryMid(b.salary || b.salaryRange) || 0),
        );
      }
      // Remove jobs the candidate already applied to
      if (appliedJobIds && appliedJobIds.size > 0) {
        list = list.filter((j) => !appliedJobIds.has(String(j._id)));
      }
      // "newest" keeps server order
    }

    return list;
  })();

  /* ── Pagination math ──────────────────────────── */
  const totalPages = Math.max(1, Math.ceil(filtered.length / JOBS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * JOBS_PER_PAGE,
    safePage * JOBS_PER_PAGE,
  );
  const activeFilters =
    selectedTypes.length +
    (salaryRange > 0 ? 1 : 0) +
    (searchTerm ? 1 : 0) +
    (locationTerm ? 1 : 0);

  const handlePageChange = (p) => {
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ── Actions ─────────────────────────────────── */
  const handleApply = async (job) => {
    if (!isAuthenticated) {
      router.push(signInUrlWithReturn(
                    typeof window !== "undefined"
                      ? `${window.location.pathname}${window.location.search || ""}`
                      : "/jobs"
                  ));
      return;
    }
    // Recruiters cannot apply to jobs
    if (isRecruiter) {
      setShowRecruiterModal(true);
      return;
    }

    try {
      // Check verification first
      const res = await api.post(`/api/jobs/${job._id}/pre-apply-check`, { uid: user.uid });
      const data = res.data;

      if (data.allowed) {
        // Verified: proceed to Skill Gap Analysis page
        router.push(`/skill-gap-analysis/${job._id}`);
      } else if (data.redirectTo) {
        // Not verified: go to intro page
        router.push(data.redirectTo);
      } else {
        setError(data.message || "Cannot apply at this time.");
      }
    } catch (err) {
      console.error("Verification check failed:", err);
      router.push(`/skill-gap-analysis/${job._id}`); // fallback
    }
  };

  const handleSave = async (job) => {
    if (!isAuthenticated) {
      router.push(signInUrlWithReturn(
                    typeof window !== "undefined"
                      ? `${window.location.pathname}${window.location.search || ""}`
                      : "/jobs"
                  ));
      return;
    }
    try {
      const res = await api.post(`/api/jobs/${job._id}/save`, { uid: user.uid, email: user.email });
      if (res.status === 200 || res.data.success) {
        setInfoMessage("Job saved to your account ✓");
        setTimeout(() => setInfoMessage(""), 3000);
      }
    } catch (err) {
      console.error("Failed to save job", err);
    }
  };

  const handleUploadResumeClick = () => {
    if (!isAuthenticated) {
      router.push(signInUrlWithReturn(
                    typeof window !== "undefined"
                      ? `${window.location.pathname}${window.location.search || ""}`
                      : "/jobs"
                  ));
      return;
    }
    router.push("/resume");
  };

  const handleOpenJob = (job) => {
    if (isAuthenticated) {
      router.push(`/jobs/${job._id}`);
      return;
    }

    router.push(signInUrlWithReturn(
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search || ""}`
        : "/jobs"
    ));
  };

  /* ── Sidebar filter panel (shared desktop + mobile) ── */
  const SidebarFilters = () => (
    <div className="space-y-8">
      {/* Job Type */}
      <div>
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 block">
          Job Type
        </label>
        <div className="space-y-2.5">
          {JOB_TYPES.map((type) => (
            <label
              key={type}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedTypes.includes(type)}
                onChange={() => toggleType(type)}
                className="w-4.5 h-4.5 w-[18px] h-[18px] rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-600 text-sm font-semibold group-hover:text-slate-900 transition-colors">
                {type}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Salary Range */}
      <div className="pt-6 border-t border-slate-100">
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 block">
          Salary Range
        </label>
        <div className="space-y-2.5">
          {SALARY_RANGES.map((range, idx) => (
            <label
              key={range.label}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="radio"
                name="salary"
                checked={salaryRange === idx}
                onChange={() => {
                  setSalaryRange(idx);
                  setCurrentPage(1);
                }}
                className="w-[18px] h-[18px] border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-600 text-sm font-semibold group-hover:text-slate-900 transition-colors">
                {range.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear filters */}
      {activeFilters > 0 && (
        <button
          onClick={clearFilters}
          className="w-full py-2.5 text-sm font-bold text-red-500 border border-red-100 rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
        >
          <X className="w-4 h-4" /> Clear all filters
        </button>
      )}

      {/* Keep the promo in the desktop sidebar; mobile renders it below results. */}
      <div className="hidden lg:block">
        <AiMatchedPromo onUploadResume={handleUploadResumeClick} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen theme-page">
      <Navbar />

      <main className="pt-8 sm:pt-12 pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PageWrapper>
            {/* ── Page Header ── */}
            <div className="mb-10 animate-fade-up">
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                Find your dream <span className="text-indigo-600">career</span>
              </h1>
              <p className="mt-3 text-slate-500 text-lg max-w-xl">
                Browse thousands of opportunities and find the one that
                perfectly matches your skills and ambitions.
              </p>
            </div>

            {/* ── Search + Location Bar ── */}
            <div
              className={`bg-white p-1.5 rounded-3xl border mb-10 flex flex-col md:flex-row items-center gap-1.5 transition-all ${
                isAuthenticated
                  ? "border-slate-100 premium-shadow"
                  : "border-slate-100 opacity-70"
              }`}
            >
              {/* Search */}
              <div className="flex-1 w-full relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder={
                    isAuthenticated
                      ? "Job title, skills, or company…"
                      : "Sign in to search jobs…"
                  }
                  className="w-full pl-12 pr-5 py-3.5 sm:py-4 bg-transparent border-none focus:ring-0 text-slate-900 font-medium placeholder:text-slate-400 outline-none text-sm sm:text-base"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  disabled={!isAuthenticated}
                />
              </div>
              <div className="h-8 w-px bg-slate-100 hidden md:block" />
              {/* Location */}
              <div className="flex-1 w-full relative">
                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder={
                    isAuthenticated
                      ? "City, State, or Remote…"
                      : "Sign in to filter by location…"
                  }
                  className="w-full pl-12 pr-5 py-3.5 sm:py-4 bg-transparent border-none focus:ring-0 text-slate-900 font-medium placeholder:text-slate-400 outline-none text-sm sm:text-base"
                  value={locationTerm}
                  onChange={(e) => {
                    setLocationTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  disabled={!isAuthenticated}
                />
              </div>
              <button
                onClick={() => setCurrentPage(1)}
                disabled={!isAuthenticated}
                className="w-full md:w-auto px-8 py-3.5 sm:py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                Search Jobs
              </button>
            </div>

            {/* ── Guest banner ── */}
            {!isAuthenticated && (
              <div className="mb-8 flex items-center gap-3 px-5 py-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-sm text-amber-800 font-medium">
                  <Link
                    href={signInUrlWithReturn("/jobs")}
                    className="font-bold underline underline-offset-2"
                  >
                    Sign in
                  </Link>{" "}
                  to use smart search, salary filters, and job type filtering.
                </p>
              </div>
            )}

            {/* ── Mobile Filter Toggle ── */}
            {isAuthenticated && (
              <div className="lg:hidden mb-6 flex items-center gap-3">
                <button
                  onClick={() => setFiltersOpen((v) => !v)}
                  className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters{" "}
                  {activeFilters > 0 && (
                    <span className="ml-1 w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center">
                      {activeFilters}
                    </span>
                  )}
                </button>
                {activeFilters > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-red-500 font-semibold hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
            )}

            {/* ── Mobile Filters Drawer ── */}
            {isAuthenticated && filtersOpen && (
              <div className="lg:hidden mb-6 bg-white border border-slate-100 rounded-2xl p-6 premium-shadow animate-fade-in">
                <SidebarFilters />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
              {/* ── Sidebar ── */}
              <aside className="hidden lg:block lg:col-span-1">
                <div className="sticky top-20">
                  <h3 className="text-base font-black text-slate-900 mb-6 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-indigo-600" /> Filters
                    {activeFilters > 0 && isAuthenticated && (
                      <span className="ml-auto text-xs font-bold text-white bg-indigo-600 rounded-full w-5 h-5 flex items-center justify-center">
                        {activeFilters}
                      </span>
                    )}
                  </h3>

                  {/* Relative wrapper for lock overlay */}
                  <div className="relative">
                    {!isAuthenticated && <LockOverlay />}
                    <div
                      className={
                        !isAuthenticated
                          ? "pointer-events-none select-none opacity-40"
                          : ""
                      }
                    >
                      <SidebarFilters />
                    </div>
                  </div>
                </div>
              </aside>

              {/* ── Job Listings ── */}
              <div className="lg:col-span-3">
                {/* Results header */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <p className="text-slate-500 font-medium text-sm">
                    Showing{" "}
                    <span className="text-slate-900 font-black">
                      {filtered.length}
                    </span>{" "}
                    job{filtered.length !== 1 ? "s" : ""}
                    {isAuthenticated && activeFilters > 0 && (
                      <span className="text-indigo-600"> (filtered)</span>
                    )}
                  </p>
                  {isAuthenticated && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Sort:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => {
                          setSortBy(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="bg-transparent border border-slate-200 text-sm font-bold text-slate-700 rounded-lg px-3 py-1.5 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="newest">Newest First</option>
                        <option value="salary-high">Salary: High → Low</option>
                        <option value="salary-low">Salary: Low → High</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Info / success toast */}
                {infoMessage && (
                  <div className="mb-5 flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium animate-fade-in">
                    {infoMessage}
                  </div>
                )}

                {/* States */}
                {loading && (
                  <div className="space-y-5">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-40 bg-slate-100 rounded-[2rem] animate-pulse"
                      />
                    ))}
                  </div>
                )}
                {error && !loading && (
                  <div className="flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 font-medium text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" /> {error}
                  </div>
                )}
                {!loading && !error && filtered.length === 0 && (
                  <div className="text-center py-20">
                    <p className="text-2xl font-black text-slate-200 mb-2">
                      No jobs found
                    </p>
                    <p className="text-slate-400 text-sm">
                      Try adjusting your filters or search term.
                    </p>
                    {activeFilters > 0 && (
                      <button
                        onClick={clearFilters}
                        className="mt-4 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                )}

                {/* Job Cards */}
                {!loading && !error && paginated.length > 0 && (
                  <div className="space-y-5">
                    {paginated.map((job) => (
                      <div
                        key={job._id}
                        className="bg-white p-4 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl border border-slate-100 premium-shadow hover:border-indigo-200 hover:shadow-indigo-50/50 transition-all group relative overflow-hidden"
                      >
                        <div className="relative z-10 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-0 md:grid-cols-[56px_minmax(0,1fr)_auto] md:gap-x-5 md:gap-y-0">
                          {/* Logo and job identity */}
                          <div className="col-start-1 row-start-1 flex min-w-0 items-start gap-2.5 md:contents">
                            <div className="col-start-1 row-span-2 row-start-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-base font-black text-indigo-600 transition-colors group-hover:bg-indigo-50 sm:h-14 sm:w-14 sm:rounded-2xl sm:text-lg md:h-14 md:w-14">
                              {job.logo || <Building2 className="w-6 h-6" />}
                            </div>
                            <div
                              className="col-start-2 row-start-1 min-w-0 cursor-pointer md:col-start-2"
                              onClick={() => handleOpenJob(job)}
                            >
                              <h3 className="mb-1 text-base font-black leading-snug text-slate-900 transition-colors group-hover:text-indigo-600 sm:text-lg md:mb-1.5">
                                {job.title}
                              </h3>
                            </div>
                          </div>

                          {/* Metadata */}
                          <div
                            className="col-span-2 row-start-2 flex cursor-pointer flex-wrap items-center gap-1.5 text-[11px] font-medium text-slate-500 md:col-start-2 md:col-span-1 md:row-start-2 md:gap-x-4 md:gap-y-1.5 md:text-sm"
                            onClick={() => handleOpenJob(job)}
                          >
                              <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1 md:bg-transparent md:px-0 md:py-0">
                                <Building2 className="h-3 w-3 shrink-0 md:h-3.5 md:w-3.5" />
                                {job.company}
                              </span>
                              <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1 md:bg-transparent md:px-0 md:py-0">
                                <MapPin className="h-3 w-3 shrink-0 md:h-3.5 md:w-3.5" />
                                {job.location}
                              </span>
                              <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1 md:bg-transparent md:px-0 md:py-0">
                                <Briefcase className="h-3 w-3 shrink-0 md:h-3.5 md:w-3.5" />
                                {job.employmentType || job.type || "—"}
                              </span>
                              <span className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2 py-1 font-bold text-indigo-600 md:bg-transparent md:px-0 md:py-0">
                                <DollarSign className="h-3 w-3 shrink-0 md:h-3.5 md:w-3.5" />
                                {job.salary || job.salaryRange || "Competitive"}
                              </span>
                              {job.vacancies && (
                                <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 font-semibold text-emerald-600 md:bg-transparent md:px-0 md:py-0">
                                  <Filter className="h-3 w-3 shrink-0 md:h-3.5 md:w-3.5" />
                                  {job.vacancies} open
                                </span>
                              )}
                              {job.deadline && (() => {
                                const isPast = new Date(job.deadline) < new Date();
                                const days = Math.ceil((new Date(job.deadline) - new Date()) / (1000*60*60*24));
                                return (
                                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-semibold md:text-xs ${isPast ? "bg-red-50 text-red-600" : days <= 7 ? "bg-orange-50 text-orange-600" : "bg-slate-100 text-slate-500"}`}>
                                    ⏰ {isPast ? "Closed" : days <= 0 ? "Today!" : `${days}d left`}
                                  </span>
                                );
                              })()}
                          </div>

                          {/* Fit score, application status, and save controls */}
                          <div className="col-start-2 row-start-1 flex shrink-0 flex-col items-center justify-center gap-1.5 md:col-start-3 md:row-span-2 md:flex-row md:gap-2">
                            {isAuthenticated &&
                              (isRecruiter ? (
                                <button
                                  type="button"
                                  disabled
                                  className="cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-300"
                                  title="Only candidates can use Check Fit"
                                >
                                  Check Fit
                                </button>
                              ) : (
                                <ProfileMatchButton
                                  jobId={job._id}
                                  jobTitle={job.title}
                                  uid={user.uid}
                                  onClick={() => setFitJob(job)}
                                />
                              ))}
                            {(() => {
                              const isPastDeadline = job.deadline && new Date(job.deadline) < new Date();
                              const isClosed = job.status === "closed" || isPastDeadline;
                              if (appliedJobIds && appliedJobIds.has(String(job._id))) {
                                return (
                                  <button disabled className="px-6 py-2.5 bg-slate-200 text-slate-500 rounded-xl font-bold text-sm cursor-default">
                                    Applied
                                  </button>
                                );
                              }
                              if (isClosed) {
                                return (
                                  <button disabled className="px-6 py-2.5 bg-red-50 text-red-400 rounded-xl font-bold text-sm cursor-not-allowed border border-red-100">
                                    Closed
                                  </button>
                                );
                              }
                              return null;
                            })()}
                            <button
                              onClick={() => handleSave(job)}
                              className="rounded-lg border border-slate-100 p-2 transition-colors group/star hover:border-amber-200 hover:bg-amber-50 sm:rounded-xl sm:p-2.5"
                              aria-label="Save job"
                            >
                              <Star className="w-4.5 w-[18px] h-[18px] text-slate-300 group-hover/star:text-amber-400 transition-colors" />
                            </button>
                          </div>
                        </div>

                        {/* Tags + date */}
                        <div className="mt-0 flex flex-col gap-3 border-t border-slate-100 pt-3 md:mt-5 md:flex-row md:items-center md:justify-between md:gap-3 md:pt-5">
                          <div className="flex flex-wrap gap-1.5">
                            {(job.skills || job.tags || [])
                              .slice(0, 6)
                              .map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-md bg-slate-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-600 sm:rounded-lg sm:px-2.5 sm:text-[11px]"
                                >
                                  {tag}
                                </span>
                              ))}
                          </div>
                          <div className="flex w-full flex-wrap items-center justify-between gap-2 md:w-auto md:justify-end">
                            <span className="text-[11px] italic text-slate-400 sm:text-xs">
                              Posted {job.posted || "Recently"}
                            </span>
                            <ShareJobButton job={job} />
                          </div>
                        </div>

                        {/* Decorative glow */}
                        <div className="absolute -right-16 -top-16 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Pagination ── */}
                <Pagination
                  current={safePage}
                  total={totalPages}
                  onChange={handlePageChange}
                />

                {/* Page info */}
                {!loading && filtered.length > 0 && (
                  <p className="text-center text-xs text-slate-400 mt-4">
                    Page {safePage} of {totalPages} · {filtered.length} total
                    results
                  </p>
                )}

                <div className="mt-8 lg:hidden">
                  <AiMatchedPromo onUploadResume={handleUploadResumeClick} />
                </div>
              </div>
            </div>
          </PageWrapper>
        </div>
      </main>

      <Footer />

      <ApplyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        jobTitle={selectedJob?.title}
        companyName={selectedJob?.company}
      />

      {/* Fit Map Modal */}
      {fitJob && isAuthenticated && (
        <FitMapModal
          job={fitJob}
          uid={user?.uid}
          onClose={() => setFitJob(null)}
          onApply={handleApply}
        />
      )}

      {/* Recruiter apply guard modal */}
      {showRecruiterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowRecruiterModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center"
            onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Recruiter Account Detected</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Applying to jobs requires a <span className="font-bold text-slate-700">candidate account</span>. Your current account is registered as a recruiter.
            </p>
            <div className="space-y-2">
              <a href="/signup?role=candidate"
                className="block w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl transition-colors">
                Create a Candidate Account
              </a>
              <button onClick={() => setShowRecruiterModal(false)}
                className="block w-full py-3 border border-slate-200 text-slate-500 font-semibold text-sm rounded-2xl hover:bg-slate-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
