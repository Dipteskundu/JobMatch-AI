"use client";

/**
 * Tab C of the "Try it live" product tour — a full simulated recruiter
 * pipeline. Visitors filter sample candidates by fit score, move them
 * through stages, schedule a demo interview, score it, and hire them.
 * Every action mirrors a real platform action and explains what happens
 * in the real app.
 */
import { useMemo, useRef, useState } from "react";
import {
  Award,
  BriefcaseBusiness,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  Filter,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  UserRound,
  Users,
  X,
} from "lucide-react";
import ScoreRing from "./ScoreRing";
import FeatureLink from "./FeatureLink";

const SEED = [
  { id: "s1", name: "Aisha Rahman", title: "Frontend Engineer", fit: 91, level: "Senior", skills: ["React", "TypeScript", "Next.js"], stage: "applied", interview: null, score: null },
  { id: "s2", name: "Marco Silva", title: "Backend Engineer", fit: 87, level: "Mid", skills: ["Node.js", "PostgreSQL", "Docker"], stage: "shortlisted", interview: null, score: null },
  { id: "s3", name: "Priya Nair", title: "Full-Stack Developer", fit: 84, level: "Mid", skills: ["React", "Node.js", "GraphQL"], stage: "applied", interview: null, score: null },
  { id: "s4", name: "Daniel Kim", title: "DevOps Engineer", fit: 78, level: "Senior", skills: ["AWS", "CI/CD", "Kubernetes"], stage: "applied", interview: null, score: null },
  { id: "s5", name: "Lucia Moreno", title: "Junior Developer", fit: 64, level: "Junior", skills: ["JavaScript", "Git", "REST APIs"], stage: "applied", interview: null, score: null },
];

const STAGE_META = {
  applied: { label: "Applied", chip: "bg-slate-100 text-slate-500", bar: "bg-slate-200" },
  shortlisted: { label: "Shortlisted", chip: "bg-violet-50 text-violet-700", bar: "bg-violet-500" },
  interview: { label: "Interview", chip: "bg-indigo-50 text-indigo-700", bar: "bg-indigo-500" },
  hired: { label: "Hired", chip: "bg-emerald-50 text-emerald-700", bar: "bg-emerald-500" },
};
const LEVELS = ["All", "Junior", "Mid", "Senior"];

export default function PipelineDemo() {
  const [candidates, setCandidates] = useState(SEED);
  const [selectedId, setSelectedId] = useState(SEED[0].id);
  const [query, setQuery] = useState("");
  const [highFit, setHighFit] = useState(false);
  const [level, setLevel] = useState("All");
  const [schedOpen, setSchedOpen] = useState(false);
  const [schedDate, setSchedDate] = useState("");
  const [schedTime, setSchedTime] = useState("");
  const [scoring, setScoring] = useState(false);
  const [scores, setScores] = useState({ tech: 7, comm: 8, culture: 8 });
  const [lastAction, setLastAction] = useState(
    "This is a live demo — try the full recruiter flow with sample data. Nothing here affects real candidates."
  );
  const [hireBurst, setHireBurst] = useState(null);
  const burstTimer = useRef(null);

  const patch = (id, fields) => {
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, ...fields } : c)));
  };

  const filtered = useMemo(() => {
    return candidates
      .filter((c) => {
        if (highFit && c.fit < 85) return false;
        if (level !== "All" && c.level !== level) return false;
        if (query.trim()) {
          const t = query.toLowerCase();
          return (
            c.name.toLowerCase().includes(t) ||
            c.title.toLowerCase().includes(t) ||
            c.skills.some((s) => s.toLowerCase().includes(t))
          );
        }
        return true;
      })
      .sort((a, b) => b.fit - a.fit);
  }, [candidates, highFit, level, query]);

  const selected = candidates.find((c) => c.id === selectedId) || filtered[0] || null;

  const shortlist = (c) => {
    patch(c.id, { stage: "shortlisted" });
    setLastAction(`${c.name} was shortlisted. In the real app, this moves them into your Shortlisted pipeline and they're notified instantly.`);
  };

  const openScheduler = (c) => {
    setSelectedId(c.id);
    setSchedOpen(true);
    setSchedDate("");
    setSchedTime("");
  };

  const confirmSchedule = (c) => {
    if (!schedDate || !schedTime) return;
    patch(c.id, { stage: "interview", interview: { date: schedDate, time: schedTime } });
    setSchedOpen(false);
    setLastAction(`Interview scheduled with ${c.name} on ${schedDate} at ${schedTime}. In the real app, this creates a calendar event, sends the invite, and both of you get a join link.`);
  };

  const submitScore = (c) => {
    const avg = Math.round(((scores.tech + scores.comm + scores.culture) / 3) * 10) / 10;
    patch(c.id, { score: avg, interview: { ...(c.interview || {}), completed: true } });
    setScoring(false);
    setLastAction(`You scored ${c.name}'s interview ${avg}/10. In the real app, the score is recorded on their application timeline and visible in Interview Completed.`);
  };

  const hire = (c) => {
    patch(c.id, { stage: "hired" });
    setLastAction(`🎉 ${c.name} is hired! In the real app, their status becomes Final Selected and the candidate sees the full journey in their dashboard.`);
    setHireBurst(c.id);
    clearTimeout(burstTimer.current);
    burstTimer.current = setTimeout(() => setHireBurst(null), 1400);
  };

  const reset = () => {
    setCandidates(SEED);
    setSelectedId(SEED[0].id);
    setQuery("");
    setHighFit(false);
    setLevel("All");
    setSchedOpen(false);
    setScoring(false);
    setLastAction("Demo reset — start the recruiter flow again from the top.");
  };

  const stageCount = (st) => candidates.filter((c) => c.stage === st).length;

  return (
    <div>
      {/* ── Filter bar ── */}
      <div className="flex flex-wrap items-center gap-2.5 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search candidates or skills…"
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400"
          />
        </div>
        <button
          onClick={() => setHighFit((v) => !v)}
          aria-pressed={highFit}
          className={`inline-flex items-center gap-1.5 text-xs font-black px-3.5 py-2.5 rounded-xl border transition-all btn-press ${
            highFit
              ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-200"
              : "bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
          }`}
        >
          <Filter className="w-3.5 h-3.5" /> High fit (85%+)
        </button>
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${level === l ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              {l}
            </button>
          ))}
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-indigo-600 px-2 py-2.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* ── Stage counters ── */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {Object.entries(STAGE_META).map(([st, meta]) => (
          <div key={st} className="bg-white border border-slate-100 rounded-xl px-3 py-2.5 text-center">
            <p className="text-lg font-black text-slate-900 leading-none">{stageCount(st)}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">{meta.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* ── Candidate list ── */}
        <div className="space-y-2.5 min-h-[280px]">
          {filtered.length === 0 && (
            <div className="h-full min-h-[280px] flex flex-col items-center justify-center text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6">
              <Users className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-500">No candidates match your filters</p>
              <p className="text-xs text-slate-400 mt-1">Try turning off “High fit” or widening the level.</p>
            </div>
          )}
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => { setSelectedId(c.id); setScoring(false); setSchedOpen(false); }}
              className={`relative w-full text-left bg-white border rounded-2xl p-4 transition-all hover:shadow-md ${
                selected?.id === c.id
                  ? "border-indigo-300 ring-2 ring-indigo-100 shadow-md shadow-indigo-100/60"
                  : "border-slate-100 hover:border-indigo-100"
              }`}
            >
              {/* Hire confetti burst */}
              {hireBurst === c.id && (
                <span className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl" aria-hidden="true">
                  {[...Array(8)].map((_, i) => (
                    <span
                      key={i}
                      className="absolute w-2 h-2 rounded-sm home-confetti"
                      style={{
                        left: `${10 + (i * 11) % 80}%`,
                        top: "60%",
                        backgroundColor: ["#6366f1", "#10b981", "#f59e0b", "#8b5cf6"][i % 4],
                        animationDelay: `${i * 70}ms`,
                      }}
                    />
                  ))}
                </span>
              )}

              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${c.stage === "hired" ? "bg-emerald-600 text-white" : "bg-indigo-600 text-white"}`}>
                  {c.name.split(" ").map((w) => w[0]).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-slate-900 truncate">{c.name}</p>
                  <p className="text-xs text-slate-400 truncate">{c.title} · {c.level}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-black ${c.fit >= 85 ? "text-emerald-600" : "text-slate-900"}`}>{c.fit}%</p>
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${STAGE_META[c.stage].chip}`}>
                    {STAGE_META[c.stage].label}
                  </span>
                </div>
              </div>
            </button>
          ))}
          <p className="text-[11px] text-slate-400 pt-1">{filtered.length} of {candidates.length} sample candidates shown</p>
        </div>

        {/* ── Detail / action panel ── */}
        <div>
          {selected ? (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 h-full flex flex-col">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 ${selected.stage === "hired" ? "bg-emerald-600 text-white" : "bg-indigo-600 text-white"}`}>
                  {selected.name.split(" ").map((w) => w[0]).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-black text-slate-900 truncate">{selected.name}</p>
                  <p className="text-xs text-slate-400">{selected.title} · {selected.level}</p>
                </div>
                <ScoreRing score={selected.fit} size={64} label="Fit" />
              </div>

              <div className="flex flex-wrap gap-1.5 mt-4">
                {selected.skills.map((s) => (
                  <span key={s} className="text-[11px] font-bold text-slate-600 bg-white border border-slate-200 rounded-lg px-2 py-1">{s}</span>
                ))}
              </div>

              {/* Interview info / scheduling form */}
              {selected.interview && !schedOpen && (
                <div className="mt-4 bg-indigo-50/60 border border-indigo-100 rounded-xl px-3.5 py-2.5 flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                  <p className="text-xs font-bold text-indigo-700">
                    Interview {selected.interview.completed ? "completed" : "on"} {selected.interview.completed ? "· scored " + selected.score + "/10" : `${selected.interview.date} · ${selected.interview.time}`}
                  </p>
                </div>
              )}

              {schedOpen ? (
                <div className="mt-4 bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Schedule demo interview</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={schedDate}
                      onChange={(e) => setSchedDate(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    />
                    <input
                      type="time"
                      value={schedTime}
                      onChange={(e) => setSchedTime(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => confirmSchedule(selected)}
                      disabled={!schedDate || !schedTime}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 bg-indigo-600 text-white rounded-lg px-3 py-2 text-xs font-black disabled:opacity-40 enabled:hover:bg-indigo-700 transition-colors"
                    >
                      <CalendarCheck className="w-3.5 h-3.5" /> Send invite
                    </button>
                    <button
                      onClick={() => setSchedOpen(false)}
                      className="inline-flex items-center justify-center gap-1.5 bg-slate-100 text-slate-500 rounded-lg px-3 py-2 text-xs font-black hover:text-slate-700 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </div>
                </div>
              ) : scoring ? (
                /* ── Interview scoring form ── */
                <div className="mt-4 bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Score the interview</p>
                  {[
                    { key: "tech", label: "Technical depth" },
                    { key: "comm", label: "Communication" },
                    { key: "culture", label: "Problem solving & fit" },
                  ].map((row) => (
                    <div key={row.key}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-bold text-slate-600">{row.label}</span>
                        <span className="text-xs font-black text-indigo-600">{scores[row.key]}/10</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={scores[row.key]}
                        onChange={(e) => setScores((prev) => ({ ...prev, [row.key]: Number(e.target.value) }))}
                        className="w-full accent-indigo-600"
                      />
                    </div>
                  ))}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => submitScore(selected)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 bg-indigo-600 text-white rounded-lg px-3 py-2 text-xs font-black hover:bg-indigo-700 transition-colors"
                    >
                      <ClipboardCheck className="w-3.5 h-3.5" /> Submit score
                    </button>
                    <button
                      onClick={() => setScoring(false)}
                      className="inline-flex items-center justify-center gap-1.5 bg-slate-100 text-slate-500 rounded-lg px-3 py-2 text-xs font-black hover:text-slate-700 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Action buttons ── */
                <div className="mt-auto pt-5">
                  {selected.stage === "applied" && (
                    <button
                      onClick={() => shortlist(selected)}
                      className="w-full inline-flex items-center justify-center gap-2 bg-violet-600 text-white rounded-xl px-4 py-3 text-sm font-black shadow-md shadow-violet-200 hover:bg-violet-700 transition-colors"
                    >
                      <Sparkles className="w-4 h-4" /> Shortlist {selected.name.split(" ")[0]}
                    </button>
                  )}
                  {selected.stage === "shortlisted" && (
                    <button
                      onClick={() => openScheduler(selected)}
                      className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-xl px-4 py-3 text-sm font-black shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-colors"
                    >
                      <CalendarCheck className="w-4 h-4" /> Schedule interview
                    </button>
                  )}
                  {selected.stage === "interview" && !selected.interview?.completed && (
                    <button
                      onClick={() => setScoring(true)}
                      className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-xl px-4 py-3 text-sm font-black shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-colors"
                    >
                      <ClipboardCheck className="w-4 h-4" /> Score the interview
                    </button>
                  )}
                  {selected.stage === "interview" && selected.interview?.completed && (
                    <div className="space-y-2">
                      <div className={`rounded-xl px-4 py-2.5 text-xs font-black text-center ${selected.score >= 7 ? "bg-emerald-50 text-emerald-700" : selected.score >= 5 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-600"}`}>
                        {selected.score >= 7 ? "Recommendation: Strong hire 🟢" : selected.score >= 5 ? "Recommendation: Maybe 🟡" : "Recommendation: No hire 🔴"}
                      </div>
                      <button
                        onClick={() => hire(selected)}
                        className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 text-white rounded-xl px-4 py-3 text-sm font-black shadow-md shadow-emerald-200 hover:bg-emerald-700 transition-colors"
                      >
                        <Award className="w-4 h-4" /> Hire {selected.name.split(" ")[0]}
                      </button>
                    </div>
                  )}
                  {selected.stage === "hired" && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3.5 text-center">
                      <p className="inline-flex items-center gap-2 text-sm font-black text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" /> {selected.name.split(" ")[0]} is hired!
                      </p>
                      <p className="text-[11px] text-emerald-600/80 mt-1">Journey: Applied → Shortlisted → Interview → Hired</p>
                    </div>
                  )}

                  {/* Stage progress */}
                  <div className="mt-4 grid grid-cols-4 gap-1.5">
                    {["applied", "shortlisted", "interview", "hired"].map((st, i) => {
                      const order = ["applied", "shortlisted", "interview", "hired"];
                      const reached = order.indexOf(selected.stage) >= i;
                      return (
                        <div key={st} className="text-center">
                          <div className={`h-1.5 rounded-full transition-colors duration-500 ${reached ? STAGE_META[st].bar : "bg-slate-200"}`} />
                          <p className={`text-[8px] font-black uppercase tracking-wider mt-1 ${reached ? "text-slate-500" : "text-slate-300"}`}>
                            {STAGE_META[st].label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[280px] flex flex-col items-center justify-center text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6">
              <UserRound className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-500">Select a candidate to act</p>
            </div>
          )}
        </div>
      </div>

      {/* Real-app explainer */}
      <div className="mt-5 bg-indigo-50/60 border border-indigo-100 rounded-xl px-4 py-3 flex items-start gap-2">
        <Send className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <p className="text-xs text-indigo-900/80 font-semibold leading-relaxed">{lastAction}</p>
      </div>

      <p className="text-xs text-slate-400 mt-4 text-center">
        Recruiters:{" "}
        <FeatureLink feature="/post-job" className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:underline">
          <BriefcaseBusiness className="w-3 h-3" /> post a job
        </FeatureLink>{" "}
        and this exact pipeline runs on your real applicants.
      </p>
    </div>
  );
}
