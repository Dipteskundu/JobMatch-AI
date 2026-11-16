"use client";

/**
 * Tab A of the "Try it live" product tour — an interactive application
 * tracking demo mirroring the real ApplicationPulseTracker stages.
 * Visitors click/auto-play through each stage and see what happens
 * at that point in the real product.
 */
import { useEffect, useState } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  Eye,
  PartyPopper,
  Play,
  Pause,
  Send,
  Sparkles,
  ThumbsUp,
} from "lucide-react";
import FeatureLink from "./FeatureLink";

const STAGES = [
  {
    id: "submitted",
    label: "Submitted",
    icon: Send,
    dot: "bg-indigo-600",
    chip: "bg-indigo-50 text-indigo-700",
    title: "Your application is in",
    desc: "Your profile and fit score land in the recruiter's ranked list — candidates are ordered by proven ability, not arrival time.",
    real: "In the real app: you can follow this exact timeline for every job you apply to.",
  },
  {
    id: "seen",
    label: "Seen",
    icon: Eye,
    dot: "bg-blue-600",
    chip: "bg-blue-50 text-blue-700",
    title: "The recruiter opened your profile",
    desc: "Recruiters review the AI-ranked breakdown of your matched, partial and missing skills — all verified by your assessments.",
    real: "In the real app: the status flips to “Seen” the moment your application is opened.",
  },
  {
    id: "shortlisted",
    label: "Shortlisted",
    icon: ThumbsUp,
    dot: "bg-violet-600",
    chip: "bg-violet-50 text-violet-700",
    title: "You made the shortlist",
    desc: "Your fit score and verified skills stood out. Recruiters shortlist from the ranked pipeline with one click.",
    real: "In the real app: shortlisting moves you one step closer and is always recruiter-owned — the AI only ranks.",
  },
  {
    id: "task_sent",
    label: "Task sent",
    icon: ClipboardList,
    dot: "bg-amber-500",
    chip: "bg-amber-50 text-amber-700",
    title: "A practical task arrives",
    desc: "Recruiters can send a real work task to test how you think — not trivia. Accept it, complete it, and submit right inside the platform.",
    real: "In the real app: tasks are tracked with accept/submit states and deadlines.",
  },
  {
    id: "interview_selected",
    label: "Interview",
    icon: CalendarCheck,
    dot: "bg-purple-600",
    chip: "bg-purple-50 text-purple-700",
    title: "Interview scheduled",
    desc: "Pick a slot, join the video interview, and get scored on skills, communication and problem solving.",
    real: "In the real app: interviews sync to your calendar and run over built-in video.",
  },
  {
    id: "hired",
    label: "Hired",
    icon: PartyPopper,
    dot: "bg-emerald-600",
    chip: "bg-emerald-50 text-emerald-700",
    title: "Offer — you're hired! 🎉",
    desc: "Every stage of the journey is recorded, so the offer arrives with a full, transparent history of why you were chosen.",
    real: "In the real app: the final status lands in your applications dashboard with the complete timeline.",
  },
];

export default function TrackerDemo() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setActive((a) => {
        if (a >= STAGES.length - 1) {
          setPlaying(false);
          return a;
        }
        return a + 1;
      });
    }, 2000);
    return () => clearInterval(t);
  }, [playing]);

  const stage = STAGES[active];
  const pct = Math.round(((active + 1) / STAGES.length) * 100);

  return (
    <div>
      {/* Job context bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-7">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-md shadow-indigo-200">
            TA
          </div>
          <div>
            <p className="text-sm font-black text-slate-900">Senior React Developer</p>
            <p className="text-xs text-slate-400">TechFlow AI · Remote</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (active >= STAGES.length - 1) setActive(0);
              setPlaying((p) => !p);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-black text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-full transition-colors"
          >
            {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {playing ? "Pause" : "Auto-play"}
          </button>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Demo application</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute top-[18px] left-0 right-0 h-0.5 bg-slate-200" />
        <div
          className="absolute top-[18px] left-0 h-0.5 bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
          style={{ width: `${(active / (STAGES.length - 1)) * 100}%` }}
        />
        <div className="relative grid grid-cols-6 gap-1">
          {STAGES.map((s, i) => {
            const Icon = s.icon;
            const done = i <= active;
            return (
              <button
                key={s.id}
                onClick={() => { setPlaying(false); setActive(i); }}
                className="group flex flex-col items-center gap-2 focus:outline-none"
                aria-pressed={i === active}
                aria-label={`Stage ${i + 1}: ${s.label}`}
              >
                <span
                  className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    done
                      ? `${s.dot} border-transparent text-white shadow-md`
                      : "bg-white border-slate-200 text-slate-300"
                  } ${i === active ? "scale-110 ring-4 ring-indigo-100" : "group-hover:scale-105"}`}
                >
                  {done ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </span>
                <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-center transition-colors ${i === active ? "text-slate-900" : done ? "text-slate-500" : "text-slate-300"}`}>
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail card */}
      <div key={stage.id} className="mt-8 bg-slate-50 border border-slate-100 rounded-2xl p-5 sm:p-6 animate-fade-up">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-2 ${stage.chip}`}>
              Stage {active + 1} of {STAGES.length}
            </span>
            <h4 className="text-lg font-black text-slate-900">{stage.title}</h4>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black shimmer-text">{pct}%</p>
            <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Journey</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed mt-3">{stage.desc}</p>
        <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-200 flex items-start gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
          {stage.real}
        </p>
      </div>

      <p className="text-xs text-slate-400 mt-5 text-center">
        Click any stage above, or hit <span className="font-bold text-indigo-600">Auto-play</span> — then{" "}
        <FeatureLink feature="/applications" className="font-bold text-indigo-600 hover:underline">
          see your real applications
        </FeatureLink>.
      </p>
    </div>
  );
}
