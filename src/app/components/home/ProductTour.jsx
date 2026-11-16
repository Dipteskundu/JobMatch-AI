"use client";

/**
 * "Try it live" product tour — a tabbed interactive playground that lets
 * visitors use the core JobMatch flows with sample data before signing up.
 */
import { useState } from "react";
import { ClipboardCheck, Gauge, LayoutGrid, Milestone } from "lucide-react";
import TrackerDemo from "./TrackerDemo";
import ScoreCheckerDemo from "./ScoreCheckerDemo";
import PipelineDemo from "./PipelineDemo";
import InterviewDemo from "./InterviewDemo";
import { useScrollReveal } from "../../lib/useScrollReveal";

const TABS = [
  { id: "tracker", label: "Application tracker", icon: Milestone, hint: "Follow an application stage by stage" },
  { id: "score", label: "Fit score checker", icon: Gauge, hint: "Score yourself against a real job" },
  { id: "pipeline", label: "Recruiter pipeline", icon: LayoutGrid, hint: "Filter, interview & hire a candidate" },
  { id: "interview", label: "Interview scorecard", icon: ClipboardCheck, hint: "Score an interview like a recruiter" },
];

export default function ProductTour() {
  const [tab, setTab] = useState("tracker");
  const revealRef = useScrollReveal({ stagger: 110 });

  return (
    <section id="try-it" ref={revealRef} className="home-theme-section py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12 reveal">
          <p className="text-[10px] font-black tracking-[0.3em] text-indigo-500 uppercase mb-3">Interactive demo</p>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Don&apos;t just read about it — try it</h2>
          <p className="text-slate-500 mt-3 text-base max-w-xl mx-auto">
            Every tab below is fully clickable. Play with the real workflows using sample data, then
            sign up to run them on your own jobs and applications.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-6 sm:justify-center reveal">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              aria-pressed={tab === id}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold whitespace-nowrap border transition-all btn-press ${
                tab === id
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200"
                  : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* Panel */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-xl shadow-slate-200/40 reveal">
          <div key={tab} className="animate-fade-up">
            {tab === "tracker" && <TrackerDemo />}
            {tab === "score" && <ScoreCheckerDemo />}
            {tab === "pipeline" && <PipelineDemo />}
            {tab === "interview" && <InterviewDemo />}
          </div>
        </div>
      </div>
    </section>
  );
}
