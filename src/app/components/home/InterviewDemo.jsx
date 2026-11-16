"use client";

/**
 * Tab D of the "Try it live" product tour — an interactive interview
 * scorecard. Visitors drag the sliders and watch the recommendation
 * meter change, mirroring how real interviews are scored on JobMatch.
 */
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  ClipboardCheck,
  Gauge,
  MessagesSquare,
  Video,
} from "lucide-react";
import FeatureLink from "./FeatureLink";
import { useAuth } from "../../lib/AuthContext";

const CRITERIA = [
  { key: "tech", label: "Technical depth", hint: "Depth of understanding beyond syntax", icon: Gauge },
  { key: "comm", label: "Communication", hint: "Clarity of thought and explanation", icon: MessagesSquare },
  { key: "solve", label: "Problem solving", hint: "Approach to unfamiliar problems", icon: ClipboardCheck },
  { key: "culture", label: "Team & culture fit", hint: "Working style and values alignment", icon: CalendarDays },
];

function verdictFor(avg) {
  if (avg >= 8) return { label: "Strong hire", tone: "bg-emerald-50 text-emerald-700 border-emerald-200", bar: "bg-emerald-500", emoji: "🟢" };
  if (avg >= 6) return { label: "Maybe — second look", tone: "bg-amber-50 text-amber-700 border-amber-200", bar: "bg-amber-500", emoji: "🟡" };
  return { label: "Not a fit", tone: "bg-red-50 text-red-600 border-red-200", bar: "bg-red-400", emoji: "🔴" };
}

export default function InterviewDemo() {
  const { isAuthenticated, role } = useAuth();
  const [scores, setScores] = useState({ tech: 7, comm: 6, solve: 7, culture: 5 });

  const avg = Math.round((Object.values(scores).reduce((a, b) => a + b, 0) / CRITERIA.length) * 10) / 10;
  const verdict = verdictFor(avg);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Scorecard */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
          Drag the sliders — watch the verdict change
        </p>
        <div className="space-y-5">
          {CRITERIA.map(({ key, label, hint, icon: Icon }) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Icon className="w-4 h-4 text-indigo-500" /> {label}
                </span>
                <span className="text-sm font-black text-indigo-600 w-12 text-right">{scores[key]}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={scores[key]}
                onChange={(e) => setScores((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                className="w-full accent-indigo-600"
                aria-label={label}
              />
              <p className="text-[11px] text-slate-400 mt-1">{hint}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Verdict + how real interviews work */}
      <div className="flex flex-col gap-5">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Overall score</p>
              <p className="text-4xl font-black text-slate-900 mt-1">{avg}<span className="text-base text-slate-400">/10</span></p>
            </div>
            <span className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full border ${verdict.tone}`}>
              {verdict.emoji} {verdict.label}
            </span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${verdict.bar} rounded-full transition-all duration-500`}
              style={{ width: `${avg * 10}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 leading-relaxed mt-4">
            In the real app, recruiters score candidates right after the call — the score lands on the
            application timeline, drives the hire recommendation, and stays visible to the team for a
            fair, evidence-based decision.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">How real interviews run here</p>
          <ul className="space-y-2.5 text-sm text-slate-600">
            <li className="flex items-start gap-2"><Video className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" /> Built-in video interviews — no external tools needed</li>
            <li className="flex items-start gap-2"><CalendarDays className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" /> Scheduling syncs to both calendars with reminders</li>
            <li className="flex items-start gap-2"><ClipboardCheck className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" /> Structured scorecards keep every decision consistent</li>
          </ul>
          <div className="mt-5 flex flex-col sm:flex-row gap-2">
            {isAuthenticated && (role === "recruiter" || role === "employer") ? (
              <Link href="/post-job" className="flex-1 inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl font-black text-sm shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-colors">
                Post a job <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <FeatureLink feature="/post-job" className="flex-1 inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl font-black text-sm shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-colors">
                Start hiring free <ArrowRight className="w-4 h-4" />
              </FeatureLink>
            )}
            <Link href="/jobs" className="flex-1 inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-xl font-bold text-sm hover:border-indigo-300 hover:text-indigo-700 transition-colors">
              I&apos;m looking for a job
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
