"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/AuthContext";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import api from "../lib/apiClient";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Building2,
  CheckCircle,
  DollarSign,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import { buildResumeSkillSet, rankJobsForResume } from "../lib/jobMatch";
import MatchScoreRing from "../components/FitMap/MatchScoreRing";

const MATCHES_PER_PAGE = 8;

function Pagination({ current, total, onChange }) {
  if (total <= 1) return null;
  const pages = Array.from({ length: total }, (_, index) => index + 1);

  return (
    <nav className="flex items-center justify-center gap-1.5 pt-4" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((page) => {
        const ellipsis = total > 7 && page !== 1 && page !== total &&
          (page < current - 2 || page > current + 2);
        if (ellipsis) {
          if (page === current - 3 || page === current + 3) {
            return <span key={page} className="px-1 text-slate-400">…</span>;
          }
          return null;
        }
        return (
          <button
            type="button"
            key={page}
            onClick={() => onChange(page)}
            className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold transition-colors ${
              page === current
                ? "bg-indigo-600 text-white shadow-sm"
                : "border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
            aria-current={page === current ? "page" : undefined}
          >
            {page}
          </button>
        );
      })}
      <button
        type="button"
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

function ResumeMatchDetails({ match, onClose }) {
  if (!match) return null;
  const { job, matchScore, directDisplay, adjacentDisplay, missingDisplay, totalRequired } = match;
  const sections = [
    { title: "Direct matches", skills: directDisplay, icon: <CheckCircle className="h-4 w-4 text-emerald-500" /> },
    { title: "Adjacent skills", skills: adjacentDisplay, icon: <ArrowRight className="h-4 w-4 text-indigo-500" /> },
    { title: "Missing required skills", skills: missingDisplay, icon: <XCircle className="h-4 w-4 text-rose-500" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        aria-label="Close resume match breakdown"
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="resume-match-dialog-title"
        className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close resume match breakdown"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
        >
          <X className="h-5 w-5" />
        </button>
        <p className="text-xs font-black uppercase tracking-widest text-indigo-600">Resume Match</p>
        <h2 id="resume-match-dialog-title" className="mt-1 pr-10 text-xl font-black text-slate-900">
          {job.title}
        </h2>
        <p className="mt-1 text-sm text-slate-500">{job.company}</p>
        <div className="mt-5 rounded-2xl bg-indigo-50 p-4">
          <p className="text-2xl font-black text-indigo-700">{matchScore}% match</p>
          <p className="mt-1 text-sm text-slate-600">
            {totalRequired > 0
              ? `${directDisplay.length} of ${totalRequired} required skills matched`
              : "No required skills were listed for this job"}
          </p>
        </div>
        <div className="mt-6 space-y-5">
          {sections.map(({ title, skills, icon }) => (
            <div key={title}>
              <h3 className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-600">
                {icon}{title}
              </h3>
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  {title === "Missing required skills" ? "All listed required skills matched." : "None"}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/** Small pill listing one of the skills detected in the resume. */
function SkillChip({ children }) {
  return (
    <span className="px-2.5 py-1 bg-slate-50 border border-slate-100 text-slate-600 text-[11px] font-bold uppercase tracking-wider rounded-lg">
      {children}
    </span>
  );
}

export default function ResumePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [matching, setMatching] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [result, setResult] = useState(null);
  const [matches, setMatches] = useState([]);
  const [matchError, setMatchError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMatch, setSelectedMatch] = useState(null);

  const isAuthenticated = useMemo(() => !!user?.uid, [user]);

  /** Everything locally detected, normalized once for matching and display. */
  const resumeSkills = useMemo(
    () =>
      Array.from(
        new Set(
          [
            ...(Array.isArray(result?.skills) ? result.skills : []),
            ...(Array.isArray(result?.technologies) ? result.technologies : []),
          ].map((skill) => String(skill).trim()).filter(Boolean),
        ),
      ),
    [result],
  );

  const totalPages = Math.max(1, Math.ceil(matches.length / MATCHES_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const visibleMatches = matches.slice(
    (safePage - 1) * MATCHES_PER_PAGE,
    safePage * MATCHES_PER_PAGE,
  );
  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0] || null;
    setError("");
    setSuccess("");

    if (!nextFile) {
      setFile(null);
      return;
    }

    if (nextFile.size > 4 * 1024 * 1024) {
      setError("File size must be 4 MiB or less.");
      setFile(null);
      return;
    }

    if (!/\.(pdf|docx|txt)$/i.test(nextFile.name)) {
      setError("Please upload a text-based PDF, DOCX, or TXT file.");
      setFile(null);
      return;
    }

    setFile(nextFile);

    // Re-uploading from the results/empty state: analyse straight away.
    if (result) {
      handleUpload(nextFile);
    }
  };

  /** Rank every open job against the skills extracted from the resume. */
  const findMatches = async (resumeData) => {
    const skills = buildResumeSkillSet(resumeData);
    setMatching(true);
    setMatchError("");

    try {
      const response = await api.get("/api/jobs");
      const jobs = Array.isArray(response.data?.data) ? response.data.data : [];
      const ranked = rankJobsForResume(jobs, skills);
      setMatches(ranked);
      setCurrentPage(1);
      return ranked;
    } catch {
      setMatches([]);
      setCurrentPage(1);
      setSelectedMatch(null);
      setMatchError("Could not load jobs to match against your resume.");
      return null;
    } finally {
      setMatching(false);
    }
  };

  const handleUpload = async (fileOverride) => {
    const resumeFile = fileOverride || file;

    if (!isAuthenticated) {
      setError("Please sign in first to upload your resume.");
      return;
    }

    if (!resumeFile) {
      setError("Please select a resume file first.");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");
    setMatches([]);
    setMatchError("");
    setCurrentPage(1);
    setSelectedMatch(null);

    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("candidateId", user.uid);

      // The shared axios instance defaults to JSON, which would serialize this
      // FormData and break multer on the server. Clear it for this one request
      // so the browser can send multipart/form-data with its own boundary.
      // Parsing larger documents can exceed the shared API client's timeout.
      const response = await api.post("/api/resume/upload", formData, {
        headers: { "Content-Type": undefined },
        timeout: 120000,
      });

      const payload = response.data;
      const data = payload?.data || null;
      setResult(data);

      const baseMessage = payload?.warning
        ? `Resume uploaded with limited parsing: ${payload.warning}`
        : "Resume uploaded and analyzed successfully.";

      setUploading(false);

      // Match jobs against the skills detected in the resume.
      const ranked = await findMatches(data);
      setSuccess(
        ranked && ranked.length > 0
          ? `${baseMessage} Found ${ranked.length} matching job${ranked.length === 1 ? "" : "s"}.`
          : baseMessage,
      );
    } catch (uploadError) {
      setError(
        uploadError?.response?.data?.message ||
          uploadError?.message ||
          "Resume upload failed.",
      );
    } finally {
      setUploading(false);
      setMatching(false);
    }
  };

  const retryMatching = () => {
    if (result) findMatches(result);
  };

  const pickAnotherResume = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-slate-50 px-4 py-24">
          <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-slate-700 shadow-sm">
            Loading...
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const busy = uploading || matching;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl space-y-6">
        {/* ── Back to Find Jobs (top right) ── */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => router.push("/jobs")}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Jobs
          </button>
        </div>

        {/* ── Upload card ── */}
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Find jobs with your resume
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Upload your resume — local parsing detects your skills and matches
                them against every open job on JobMatch AI.
              </p>
            </div>
          </div>

          {!isAuthenticated && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              You need to sign in before uploading your resume.
            </div>
          )}

          <div className="mt-6 space-y-4">
            <label className="block text-sm font-semibold text-slate-700">
              Resume file (PDF / DOCX / TXT)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
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
                onClick={() => handleUpload()}
                disabled={busy || !isAuthenticated}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploading
                  ? "Uploading..."
                  : matching
                    ? "Finding jobs..."
                    : "Upload & Find Jobs"}
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

        {/* ── What the local parser detected ── */}
        {result && (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Extracted from your resume
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

            <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Skills &amp; technologies used for matching
              </p>
              {resumeSkills.length > 0 ? (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {resumeSkills.map((skill) => (
                    <SkillChip key={skill}>{skill}</SkillChip>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-500">
                  No skills could be detected — try uploading a clearer resume.
                </p>
              )}
            </div>
          </section>
        )}

        {/* ── Matching in progress ── */}
        {matching && (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-4">
            <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
              Comparing your skills against open jobs…
            </p>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </section>
        )}

        {/* ── Matching failed ── */}
        {!matching && matchError && (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
            <p className="text-sm font-semibold text-rose-700">{matchError}</p>
            <button
              type="button"
              onClick={retryMatching}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-rose-700"
            >
              <RefreshCw className="w-4 h-4" /> Retry matching
            </button>
          </section>
        )}

        {/* ── Matches found ── */}
        {!matching && !matchError && matches.length > 0 && (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {matches.length} job{matches.length === 1 ? "" : "s"} matched
                  your resume
                </h2>
                <p className="text-sm text-slate-500">
                  Ranked by how well their skills line up with yours.
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/jobs")}
                className="text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Browse all jobs
              </button>
            </div>

            <div className="space-y-4">
              {visibleMatches.map(
                ({ job, matchScore, directDisplay, adjacentDisplay, missingDisplay, totalRequired }) => (
                  <div
                    key={job._id}
                    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-indigo-200 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-indigo-600 border border-slate-100 shrink-0">
                          {job.logo || <Building2 className="w-5 h-5" />}
                        </div>
                        <div
                          className="cursor-pointer"
                          onClick={() => router.push(`/jobs/${job._id}`)}
                        >
                          <h3 className="font-black text-slate-900 hover:text-indigo-600 transition-colors">
                            {job.title}
                          </h3>
                          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-slate-500 text-sm font-medium">
                            <span className="flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5" />{" "}
                              {job.company}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5" /> {job.location}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Briefcase className="w-3.5 h-3.5" />
                              {job.employmentType || job.type || "—"}
                            </span>
                            <span className="flex items-center gap-1.5 text-indigo-600 font-bold">
                              <DollarSign className="w-3.5 h-3.5" />
                              {job.salary || job.salaryRange || "Competitive"}
                            </span>
                          </div>

                          {/* Why it matched */}
                          <div className="mt-3 flex flex-wrap items-center gap-1.5">
                            <span className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-emerald-600 mr-1">
                              <CheckCircle className="w-3.5 h-3.5" /> Matched:
                            </span>
                            {[...directDisplay, ...adjacentDisplay]
                              .slice(0, 5)
                              .map((skill) => (
                                <span
                                  key={skill}
                                  className="px-2 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-bold rounded-lg"
                                >
                                  {skill}
                                </span>
                              ))}
                            {[...directDisplay, ...adjacentDisplay].length >
                              5 && (
                              <span className="text-[11px] font-bold text-slate-400">
                                +
                                {[...directDisplay, ...adjacentDisplay].length -
                                  5}{" "}
                                more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-center">
                        <button
                          type="button"
                          onClick={() => setSelectedMatch({
                            job,
                            matchScore,
                            directDisplay,
                            adjacentDisplay,
                            missingDisplay,
                            totalRequired,
                          })}
                          aria-label={`Resume match ${matchScore} percent for ${job.title}. Open skill breakdown.`}
                          title="Open resume match breakdown"
                          className="flex min-w-[72px] flex-col items-center rounded-xl px-1.5 py-1 text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                          <MatchScoreRing score={matchScore} />
                          <span className="mt-1 text-[9px] font-semibold leading-tight text-slate-500 sm:text-[10px]">
                            Resume Match
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => router.push(`/jobs/${job._id}`)}
                          className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-indigo-600 transition-all active:scale-95"
                        >
                          View Job
                        </button>
                      </div>
                    </div>

                    {/* Job skill tags */}
                    {(job.skills || job.tags || []).length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5 pt-4 border-t border-slate-50">
                        {(job.skills || job.tags || []).slice(0, 8).map((tag) => (
                          <SkillChip key={tag}>{tag}</SkillChip>
                        ))}
                      </div>
                    )}
                  </div>
                ),
              )}
            </div>
            <Pagination
              current={safePage}
              total={totalPages}
              onChange={handlePageChange}
            />
            {totalPages > 1 && (
              <p className="text-center text-xs text-slate-400" aria-live="polite">
                Showing {(safePage - 1) * MATCHES_PER_PAGE + 1}–
                {Math.min(safePage * MATCHES_PER_PAGE, matches.length)} of {matches.length} matched jobs
              </p>
            )}
          </section>
        )}

        {/* ── No matches ── */}
        {!uploading && !matching && !matchError && result && matches.length === 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-5">
              <Search className="w-7 h-7 text-slate-400" />
            </div>
            <h2 className="text-xl font-black text-slate-900">
              No match jobs found based on your resume.
            </h2>
            <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              {resumeSkills.length > 0
                ? "We checked every open job on JobMatch AI and none of them require the skills we found in your resume."
                : "We couldn't detect any skills in your resume, so there was nothing to match against."}
            </p>

            {resumeSkills.length > 0 && (
              <div className="mt-4 flex flex-wrap justify-center gap-1.5 max-w-lg mx-auto">
                {resumeSkills.slice(0, 12).map((skill) => (
                  <SkillChip key={skill}>{skill}</SkillChip>
                ))}
              </div>
            )}

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={pickAnotherResume}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Upload a different resume
              </button>
              <button
                type="button"
                onClick={() => router.push("/jobs")}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back to Find Jobs
              </button>
            </div>
          </section>
        )}
        <ResumeMatchDetails
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
        />
        </div>
      </main>
      <Footer />
    </>
  );
}
