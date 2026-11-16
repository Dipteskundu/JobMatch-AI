"use client";

/**
 * Company spotlight — real companies from the public companies endpoint,
 * each card linking into the companies page. Hides itself gracefully
 * when no company data is available (never shows fabricated companies).
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BriefcaseBusiness, Building, Globe } from "lucide-react";
import api from "../../lib/apiClient";

export default function CompanySpotlight() {
  const [companies, setCompanies] = useState(null); // null = loading

  useEffect(() => {
    let cancelled = false;
    api
      .get("/api/v1/companies")
      .then((res) => {
        const list = res.data?.data;
        if (!cancelled && Array.isArray(list)) setCompanies(list.filter((c) => c?.name).slice(0, 6));
      })
      .catch(() => {
        if (!cancelled) setCompanies([]);
      });
    return () => { cancelled = true; };
  }, []);

  if (companies === null) {
    return (
      <section className="home-theme-section py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="h-8 w-72 bg-slate-100 rounded-full animate-pulse mx-auto mb-10" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-white/60 border border-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (companies.length === 0) return null;

  return (
    <section className="home-theme-section py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12 animate-fade-up">
          <p className="text-[10px] font-black tracking-[0.3em] text-indigo-500 uppercase mb-3">Who&apos;s hiring</p>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Real companies, verified roles</h2>
          <p className="text-slate-500 mt-3 text-base max-w-xl mx-auto">
            Explore teams already hiring on JobMatch AI — every listing is approved by admins before it goes live.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {companies.map((company) => (
            <Link
              key={company._id}
              href="/companies"
              className="card-hover bg-white border border-slate-100 rounded-2xl p-6 hover:border-indigo-100 group"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                  {company.logo || <Building className="w-6 h-6 text-indigo-500" />}
                </div>
                {typeof company.openJobs === "number" && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                    <BriefcaseBusiness className="w-3 h-3" /> {company.openJobs} open
                  </span>
                )}
              </div>
              <h3 className="text-base font-black text-slate-900 mb-1 group-hover:text-indigo-700 transition-colors">
                {company.name}
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                {company.industry}
                {company.location ? ` · ${company.location}` : ""}
              </p>
              {company.description && (
                <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{company.description}</p>
              )}
              {company.website && (
                <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                  <Globe className="w-3 h-3" /> Website
                </span>
              )}
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/companies"
            className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-full font-bold text-sm hover:border-indigo-300 hover:text-indigo-700 transition-colors"
          >
            Explore all companies <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
