"use client";

/**
 * Tab B of the "Try it live" product tour — an interactive ATS-style
 * fit score checker. Visitors toggle the skills they know and watch the
 * score ring, skill pills and weight bars recalculate live using the
 * same open weights as the real Hiring Fit Score.
 */
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, PlusCircle, RotateCcw, XCircle } from "lucide-react";
import ScoreRing from "./ScoreRing";
import FeatureLink from "./FeatureLink";
import { useAuth } from "../../lib/AuthContext";

/* Demo target job — mirrors the real score explainability section */
const TARGET = {
  title: "Senior React Developer",
  skills: ["React.js", "TypeScript", "Next.js", "Node.js", "Docker", "GraphQL"],
};

const POOL = [
  "React.js", "TypeScript", "JavaScript", "Next.js",
  "Node.js", "Docker", "GraphQL", "PostgreSQL",
];

/* Knowing one of these makes the related target skill a partial match */
const ADJACENT = {
  "TypeScript": ["JavaScript"],
  "Next.js": ["React.js"],
  "Docker": ["Node.js", "PostgreSQL"],
  "GraphQL": ["Node.js", "PostgreSQL"],
  "PostgreSQL": ["Node.js"],
};

/* Fixed demo sub-scores (the interactive part is the skill-match weight) */
const FIXED_WEIGHTS = [
  { factor: "Assessment performance", weight: 25, earned: 20, chip: "bg-violet-50 text-violet-600", note: "Demo: 80% on role tests" },
  { factor: "Relevant experience", weight: 15, earned: 13, chip: "bg-emerald-50 text-emerald-600", note: "Demo: aligned level" },
  { factor: "Education & qualification", weight: 10, earned: 8, chip: "bg-amber-50 text-amber-600", note: "Demo: requirement met" },
  { factor: "Additional role factors", weight: 5, earned: 4, chip: "bg-rose-50 text-rose-600", note: "Demo: certificates" },
];

export default function ScoreCheckerDemo() {
  const { user, isAuthenticated } = useAuth();
  const [known, setKnown] = useState(new Set(["React.js", "TypeScript", "Node.js"]));

  const { matched, partial, missing, skillScore, total } = useMemo(() => {
    const matched = [];
    const partial = [];
    const missing = [];
    TARGET.skills.forEach((skill) => {
      if (known.has(skill)) matched.push(skill);
      else if ((ADJACENT[skill] || []).some((adj) => known.has(adj))) partial.push(skill);
      else missing.push(skill);
    });
    const skillScore = Math.round((45 * (matched.length + partial.length * 0.5)) / TARGET.skills.length);
    const fixed = FIXED_WEIGHTS.reduce((sum, w) => sum + w.earned, 0);
    return { matched, partial, missing, skillScore, total: skillScore + fixed };
  }, [known]);

  const toggle = (skill) => {
    setKnown((prev) => {
      const next = new Set(prev);
      if (next.has(skill)) next.delete(skill);
      else next.add(skill);
      return next;
    });
  };

  const pillStyles = {
    matched: "bg-emerald-50 text-emerald-700 border-emerald-200",
    partial: "bg-amber-50 text-amber-700 border-amber-200",
    missing: "bg-red-50 text-red-600 border-red-200",
  };
  const pillIcons = {
    matched: <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />,
    partial: <PlusCircle className="w-3.5 h-3.5 shrink-0" />,
    missing: <XCircle className="w-3.5 h-3.5 shrink-0" />,
  };

  const tone = total >= 75 ? "emerald" : total >= 50 ? "indigo" : "amber";
  const verdict = {
    emerald: "Strong match — recruiters would see you near the top of the ranked list.",
    indigo: "Good match — a couple more skills would push you into the top ranked group.",
    amber: "Emerging match — the skill-gap analyzer would suggest exactly what to learn next.",
  }[tone];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8">
      <div>
        {/* Your skills */}
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
          Tap the skills you know
        </p>
        <div className="flex flex-wrap gap-2 mb-6">
          {POOL.map((skill) => {
            const on = known.has(skill);
            return (
              <button
                key={skill}
                onClick={() => toggle(skill)}
                aria-pressed={on}
                className={`text-xs font-bold px-3 py-2 rounded-xl border transition-all btn-press ${
                  on
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200"
                    : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                }`}
              >
                {skill}
              </button>
            );
          })}
        </div>

        {/* Result pills */}
        <div className="space-y-3">
          {[
            { group: "Matched skills", items: matched, tone: "bg-emerald-50 text-emerald-700" },
            { group: "Partial matches", items: partial, tone: "bg-amber-50 text-amber-700" },
            { group: "Missing skills", items: missing, tone: "bg-slate-100 text-slate-500" },
          ].map((g) => (
            <div key={g.group} className="border border-slate-100 rounded-xl p-3.5">
              <p className={`text-[10px] font-black uppercase tracking-widest inline-block px-2 py-0.5 rounded-full mb-2 ${g.tone}`}>
                {g.group} · {g.items.length}
              </p>
              <div className="flex flex-wrap gap-2">
                {g.items.length === 0 && (
                  <span className="text-xs text-slate-400 font-semibold">None right now</span>
                )}
                {g.items.map((s) => (
                  <span key={s} className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold border ${pillStyles[g.group === "Matched skills" ? "matched" : g.group === "Partial matches" ? "partial" : "missing"]}`}>
                    {pillIcons[g.group === "Matched skills" ? "matched" : g.group === "Partial matches" ? "partial" : "missing"]}
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Weight bars */}
        <div className="mt-6 space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-bold text-slate-900">Skill match</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                {skillScore} / 45
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                style={{ width: `${(skillScore / 45) * 100}%` }}
              />
            </div>
          </div>
          {FIXED_WEIGHTS.map((w) => (
            <div key={w.factor}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-bold text-slate-900">{w.factor}</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${w.chip}`}>{w.earned} / {w.weight}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-300 rounded-full" style={{ width: `${(w.earned / w.weight) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Score card */}
      <div className="lg:w-72 flex lg:flex-col gap-5 items-center lg:items-stretch justify-center">
        <div className="glass-card rounded-3xl p-6 text-center w-full max-w-[280px]">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Sample score for</p>
          <p className="text-sm font-black text-slate-900 mb-5">{TARGET.title}</p>
          <ScoreRing score={total} size={132} label="Fit" />
          <p className="text-xs text-slate-500 leading-relaxed mt-5">{verdict}</p>
          <button
            onClick={() => setKnown(new Set(["React.js", "TypeScript", "Node.js"]))}
            className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reset demo
          </button>
        </div>

        {/* Real CTA */}
        <div className="w-full max-w-[280px]">
          {isAuthenticated ? (
            <>
              <Link
                href="/resume"
                className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl font-black text-sm shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-colors"
              >
                Score my real resume <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/skill-gap-detection"
                className="mt-2 w-full inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-xl font-bold text-sm hover:border-indigo-300 hover:text-indigo-700 transition-colors"
              >
                See skill-gap analysis
              </Link>
            </>
          ) : (
            <>
              <FeatureLink
                feature="/resume"
                className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl font-black text-sm shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-colors"
              >
                Sign in to score your resume <ArrowRight className="w-4 h-4" />
              </FeatureLink>
              <p className="text-[11px] text-slate-400 text-center mt-2 leading-relaxed">
                Not signed in yet? You&apos;ll land right here after authenticating — resume upload takes one step.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
