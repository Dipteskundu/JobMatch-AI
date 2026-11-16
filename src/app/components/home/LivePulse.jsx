"use client";

/**
 * "Live on the platform" — an auto-scrolling ticker of REAL approved jobs
 * from the public GET /api/jobs endpoint. Each card deep-links into the
 * actual job page. Pauses on hover; hides gracefully if the API is down.
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BriefcaseBusiness, MapPin } from "lucide-react";
import api from "../../lib/apiClient";

export default function LivePulse() {
  const [jobs, setJobs] = useState(null); // null = loading

  useEffect(() => {
    let cancelled = false;
    api
      .get("/api/jobs")
      .then((res) => {
        const list = res.data?.data;
        if (!cancelled && Array.isArray(list)) {
          setJobs(list.filter((j) => j?.title && j?._id).slice(0, 14));
        }
      })
      .catch(() => {
        if (!cancelled) setJobs([]);
      });
    return () => { cancelled = true; };
  }, []);

  if (jobs === null) {
    return (
      <section className="py-14 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="h-4 w-56 bg-slate-100 rounded-full animate-pulse mb-6" />
          <div className="h-24 bg-slate-50 rounded-2xl animate-pulse" />
        </div>
      </section>
    );
  }

  if (jobs.length === 0) return null;

  const doubled = [...jobs, ...jobs];

  return (
    <section className="py-14 bg-white border-y border-slate-100 overflow-hidden" aria-label="Live job listings">
      <div className="max-w-6xl mx-auto px-6 mb-6 flex flex-wrap items-center justify-between gap-3 animate-fade-up">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <p className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">
            Live on the platform · {jobs.length} open roles
          </p>
        </div>
        <Link href="/jobs" className="inline-flex items-center gap-1 text-xs font-black text-indigo-600 hover:text-indigo-700">
          View all jobs <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Marquee — duplicated track, pauses on hover */}
      <div className="group relative">
        <div className="flex w-max gap-4 home-marquee group-hover:[animation-play-state:paused] px-6">
          {doubled.map((job, i) => (
            <Link
              key={`${job._id}-${i}`}
              href={`/jobs/${job._id}`}
              className="w-[270px] shrink-0 bg-white border border-slate-100 rounded-2xl p-4 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/50 card-hover transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BriefcaseBusiness className="w-4 h-4" />
                </span>
                {job.experienceLevel && (
                  <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {job.experienceLevel}
                  </span>
                )}
              </div>
              <p className="text-sm font-black text-slate-900 leading-snug line-clamp-2">{job.title}</p>
              <p className="text-xs text-slate-400 mt-1 truncate">{job.company}</p>
              <div className="mt-2.5 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-semibold">
                  <MapPin className="w-3 h-3" /> {job.location || "Remote"}
                </span>
                {job.salary && (
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full line-clamp-1 max-w-[110px]">
                    {job.salary}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
        {/* Edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent" />
      </div>
    </section>
  );
}
