"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/AuthContext";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import api from "../lib/apiClient";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CheckCircle,
  DollarSign,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";
import { buildResumeSkillSet, rankJobsForResume } from "../lib/jobMatch";

const acceptedTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

/** Colour-coded match percentage badge. */
function MatchBadge({ score }) {
  const tone =
    score >= 75
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : score >= 50
        ? "bg-indigo-50 text-indigo-700 border-indigo-200"
        : "bg-amber-50 text-amber-700 border-amber-200";
  const label =
    score >= 75 ? "Strong Match" : score >= 50 ? "Good Fit" : "Partial Match";

  return (
    <div className={`text-center rounded-2xl border px-4 py-2.5 ${tone}`}>
      <p className="text-xl font-black leading-none">{score}%</p>
      <p className="text-[10px] font-black uppercase tracking-wider mt-1">
        {label}
      </p>
    </div>
  );
}

/** Small pill listing one of the skills the AI read from the resume. */
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

  const isAuthenticated = useMemo(() => !!user?.uid, [user]);

  /** Everything the AI extracted, normalized once for matching + display. */
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
      return ranked;
    } catch {
      setMatches([]);
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

    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("candidateId", user.uid);

      // The shared axios instance defaults to JSON, which would serialize this
      // FormData and break multer on the server. Clear it for this one request
      // so the browser can send multipart/form-data with its own boundary.
      // Timeout is raised for this call only: AI extraction of a full PDF can
      // take ~70s, well past the global 30s default.
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

      // Now find the jobs that match what the AI read from the resume.
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
                Upload your resume — our AI extracts your skills and matches
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
              Resume file (PDF / DOC / DOCX / TXT)
            </label>
            <input
              ref={fileInputRef}
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

        {/* ── What the AI extracted ── */}
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
              {matches.map(
                ({ job, matchScore, directDisplay, adjacentDisplay }) => (
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

                      <div className="flex sm:flex-col items-center sm:items-end gap-3 shrink-0">
                        <MatchBadge score={matchScore} />
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
        </div>
      </main>
      <Footer />
    </>
  );
}
