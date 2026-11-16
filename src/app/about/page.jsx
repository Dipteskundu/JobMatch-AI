"use client";

/**
 * About page — the storytelling page for JobMatch AI.
 *
 * Purely informational: explains the mission, the problem with traditional
 * hiring, how the platform increases the success of skillful hiring, what it
 * does for recruiters/agencies and candidates, and who it is for.
 *
 * Deliberately contains ZERO links, buttons or CTAs — nothing redirects the
 * reader away from this page. Animations reuse the home-page system:
 * useScrollReveal({ stagger }) + .reveal / .reveal-left / .reveal-right /
 * .reveal-scale classes.
 */

import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import {
  Award,
  Building2,
  CalendarCheck,
  Check,
  ClipboardCheck,
  FileSearch,
  Gauge,
  GraduationCap,
  Heart,
  History,
  PartyPopper,
  Repeat,
  Shield,
  Target,
  TrendingUp,
  UserRound,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useScrollReveal } from "../lib/useScrollReveal";

/* ═══════════════════════════════════════════════════════════════════════
   1. HERO — the story of a fair hire
═══════════════════════════════════════════════════════════════════════ */
function Hero() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-16 sm:pb-24">
      {/* decorative gradient */}
      <div className="pointer-events-none absolute -top-24 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-100/60 via-violet-100/40 to-transparent rounded-full blur-3xl" />

      <div className="relative grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14 items-center">
        <div className="lg:col-span-3 animate-fade-up">
          <span className="inline-flex items-center gap-2 text-[10px] font-black tracking-[0.3em] uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 px-3.5 py-1.5 rounded-full mb-6">
            <Target className="w-3 h-3" /> About JobMatch AI
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.05] mb-6">
            The story of a{" "}
            <span className="text-indigo-600">fair hire.</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-500 leading-relaxed max-w-2xl mb-5">
            Somewhere along the way, hiring stopped being about people.
            Resumes became keyword puzzles, and strong candidates were
            filtered out by software before a human ever read a single line.
          </p>
          <p className="text-lg sm:text-xl text-slate-500 leading-relaxed max-w-2xl">
            JobMatch AI exists to change that — to make every application
            understood, every skill verified, and every hire explainable.
          </p>
        </div>

        {/* mini visual: resume → fit score → hire */}
        <div className="lg:col-span-2 reveal-scale">
          <div className="bg-white border border-slate-100 rounded-3xl p-7 shadow-2xl shadow-indigo-100/60">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-5">
              One application&apos;s journey
            </p>
            <div className="space-y-3">
              {[
                { label: "Resume uploaded", note: "Skills parsed & verified", chip: "bg-slate-50 text-slate-600" },
                { label: "Fit score computed", note: "5 openly weighted factors", chip: "bg-indigo-50 text-indigo-700" },
                { label: "Interviewed & scored", note: "Structured, same criteria for all", chip: "bg-violet-50 text-violet-700" },
                { label: "Hired — with evidence", note: "Every step logged & auditable", chip: "bg-emerald-50 text-emerald-700" },
              ].map((s, i) => (
                <div key={s.label}>
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center text-[11px] font-black ${s.chip}`}>
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-900 truncate">{s.label}</p>
                      <p className="text-[11px] text-slate-400 truncate">{s.note}</p>
                    </div>
                  </div>
                  {i < 3 && <div className="ml-[13px] w-px h-3.5 bg-slate-200" />}
                </div>
              ))}
            </div>
            <div className="mt-5 bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-xl px-4 py-3">
              <p className="text-xs font-bold text-indigo-700">
                No keywords. No black holes. Just evidence.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   2. MOTTO & WHAT WE WANT TO ACHIEVE
═══════════════════════════════════════════════════════════════════════ */
function Motto() {
  const goals = [
    {
      icon: <Gauge className="w-5 h-5" />,
      title: "Make hiring evidence-based",
      desc: "Scores come from verified skills, assessments and real experience — never from keyword density or a recruiter's mood on a Monday morning.",
      chip: "bg-indigo-50 text-indigo-600",
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: "Make growth part of every application",
      desc: "A missing skill shouldn't end a candidacy. Every gap is named, and the platform builds the learning plan to close it.",
      chip: "bg-emerald-50 text-emerald-600",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Make the process transparent",
      desc: "Candidates see the exact same score breakdown recruiters see. AI ranks and explains — the human always makes the final call.",
      chip: "bg-violet-50 text-violet-600",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* dark motto card */}
        <div className="lg:col-span-2 relative overflow-hidden bg-slate-900 rounded-3xl sm:rounded-[2.5rem] p-8 sm:p-14 text-white reveal-left">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-600/15 to-transparent" />
          <div className="pointer-events-none absolute -bottom-32 -right-32 w-[420px] h-[420px] border border-white/10 rounded-full" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 w-[300px] h-[300px] border border-white/10 rounded-full" />

          <div className="relative">
            <p className="text-[10px] font-black tracking-[0.3em] uppercase text-indigo-300 mb-6">Our motto</p>
            <h2 className="text-3xl sm:text-5xl font-black leading-tight mb-6">
              The right skill should always find{" "}
              <span className="text-indigo-300">the right seat.</span>
            </h2>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl">
              We measure people by what they can actually do — and we tell them
              exactly what they need to do next. That one idea shapes every
              feature we build, for candidates and recruiters alike.
            </p>
          </div>
        </div>

        {/* what we want to achieve */}
        <div className="flex flex-col gap-6 reveal-right">
          <div className="bg-white border border-slate-100 rounded-3xl sm:rounded-[2.5rem] p-8 shadow-xl shadow-slate-100 flex-1">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 mb-6">
              <Target className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-3">What we want to achieve</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              A hiring world where potential beats pedigree — where the
              candidate who&apos;s willing to learn is never invisible, and the
              recruiter never has to guess.
            </p>
          </div>
          <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl shadow-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Repeat className="w-4 h-4 text-indigo-500" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">The loop</p>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Apply → get scored → learn what&apos;s missing → come back
              stronger. The platform is designed to be worth returning to,
              win or lose.
            </p>
          </div>
        </div>
      </div>

      {/* three goals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 lg:mt-8">
        {goals.map((g) => (
          <div key={g.title} className="reveal bg-white border border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-lg hover:border-indigo-100 transition-all card-hover">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-5 ${g.chip}`}>
              {g.icon}
            </div>
            <h3 className="text-base font-black text-slate-900 mb-2">{g.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{g.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   3. TRADITIONAL HIRING vs JOBMATCH AI
═══════════════════════════════════════════════════════════════════════ */
function Compare() {
  const then = [
    "Keyword scanners reject strong candidates before a human ever reads them",
    "Applications vanish into silent black holes for weeks",
    "Interview decisions rest on gut feeling — everyone judged by a different ruler",
    "Skills are taken on faith; nobody actually verifies them",
    "Rejections arrive with no explanation and no path forward",
  ];
  const now = [
    "Every application is scored on five openly weighted factors — the same breakdown for candidate and recruiter",
    "A live timeline: submitted → seen → shortlisted → task → interview → hired",
    "Structured interviews with identical criteria for every candidate — a human makes the final call",
    "Skill tests generate real evidence, verified before anyone is ranked",
    "Fit scores show exactly what's missing — and the platform builds the plan to learn it",
  ];

  return (
    <section className="bg-slate-50 border-y border-slate-100 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 reveal">
          <p className="text-[10px] font-black tracking-[0.3em] text-indigo-500 uppercase mb-3">The problem we solve</p>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
            Traditional hiring was built for a paper world
          </h2>
          <p className="text-slate-500 mt-3 text-base">
            Here&apos;s what typically happens — and what happens instead on JobMatch AI.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {/* Then */}
          <div className="reveal-left bg-white border border-slate-100 rounded-3xl sm:rounded-[2.5rem] p-8 sm:p-10 shadow-sm">
            <div className="flex items-center gap-3 mb-7">
              <span className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <History className="w-5 h-5 text-slate-400" />
              </span>
              <div>
                <h3 className="text-lg font-black text-slate-900">Traditional hiring</h3>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Then</p>
              </div>
            </div>
            <ul className="space-y-4">
              {then.map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="w-5 h-5 mt-0.5 shrink-0 rounded-full bg-slate-100 flex items-center justify-center">
                    <X className="w-3 h-3 text-slate-400" />
                  </span>
                  <span className="text-sm text-slate-500 leading-relaxed">{t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Now */}
          <div className="reveal-right relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl sm:rounded-[2.5rem] p-8 sm:p-10 text-white shadow-2xl shadow-indigo-200/60">
            <div className="pointer-events-none absolute -top-24 -right-24 w-[320px] h-[320px] border border-white/15 rounded-full" />
            <div className="flex items-center gap-3 mb-7 relative">
              <span className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </span>
              <div>
                <h3 className="text-lg font-black">With JobMatch AI</h3>
                <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-200">Now</p>
              </div>
            </div>
            <ul className="space-y-4 relative">
              {now.map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="w-5 h-5 mt-0.5 shrink-0 rounded-full bg-white/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </span>
                  <span className="text-sm text-indigo-50 leading-relaxed">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* weights strip */}
        <div className="mt-10 reveal bg-white border border-slate-100 rounded-2xl p-6 sm:p-7 shadow-sm max-w-4xl mx-auto">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 text-center">
            The fit score — five openly weighted factors
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { f: "Skill match", w: 45 },
              { f: "Assessments", w: 25 },
              { f: "Experience", w: 15 },
              { f: "Education", w: 10 },
              { f: "Role criteria", w: 5 },
            ].map((r) => (
              <div key={r.f} className="text-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-3.5">
                <p className="text-lg font-black text-indigo-600">{r.w}%</p>
                <p className="text-[10px] font-bold text-slate-500 mt-0.5">{r.f}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   4. HOW WE INCREASE THE SUCCESS OF SKILLFUL HIRING
═══════════════════════════════════════════════════════════════════════ */
function EvidenceChain() {
  const steps = [
    {
      icon: <FileSearch className="w-5 h-5" />,
      chip: "bg-blue-50 text-blue-600",
      title: "Verify",
      desc: "Skill tests and assessments generate real performance evidence — proof of what a candidate can do, not what a resume claims.",
    },
    {
      icon: <Gauge className="w-5 h-5" />,
      chip: "bg-indigo-50 text-indigo-600",
      title: "Score",
      desc: "The fit score weighs skill match, assessment performance, experience, education and role criteria — with the full breakdown visible to everyone.",
    },
    {
      icon: <ClipboardCheck className="w-5 h-5" />,
      chip: "bg-violet-50 text-violet-600",
      title: "Structure",
      desc: "Interviews follow the same scorecard for every candidate. AI ranks and explains; people decide. Bias in, bias out — so we remove the guessing.",
    },
    {
      icon: <History className="w-5 h-5" />,
      chip: "bg-emerald-50 text-emerald-600",
      title: "Track",
      desc: "Every shortlist, score and hire is logged. Each decision has a complete, auditable evidence trail behind it.",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      <div className="text-center max-w-2xl mx-auto mb-14 reveal">
        <p className="text-[10px] font-black tracking-[0.3em] text-indigo-500 uppercase mb-3">Skillful hiring</p>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
          How we raise the odds of hiring the right person
        </h2>
        <p className="text-slate-500 mt-3 text-base">
          Great hiring isn&apos;t luck — it&apos;s an evidence chain. Every link removes a way to be wrong.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
        {steps.map((s, i) => (
          <div key={s.title} className="relative reveal bg-white border border-slate-100 rounded-3xl p-7 shadow-sm hover:shadow-lg hover:border-indigo-100 transition-all card-hover">
            <span className="absolute top-6 right-7 text-[10px] font-black tracking-widest text-slate-300 uppercase">
              Step {i + 1}
            </span>
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-5 ${s.chip}`}>
              {s.icon}
            </div>
            <h3 className="text-base font-black text-slate-900 mb-2">{s.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
            {i < steps.length - 1 && (
              <div className="hidden lg:block absolute top-1/2 -right-[15px] w-3.5 h-3.5 rotate-45 bg-white border-t border-r border-slate-100" />
            )}
          </div>
        ))}
      </div>

      <div className="mt-10 reveal max-w-3xl mx-auto bg-slate-900 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-600/20 to-transparent" />
        <p className="relative text-base sm:text-lg leading-relaxed text-slate-200">
          <span className="text-indigo-300 font-black">AI assists — humans decide.</span>{" "}
          The engine ranks, explains and surfaces evidence, but no one is hired or
          rejected by an algorithm. Every final call belongs to a person who can
          see exactly why the recommendation was made.
        </p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   5. FOR RECRUITERS & AGENCIES
═══════════════════════════════════════════════════════════════════════ */
function RankedVisual() {
  const cands = [
    { name: "Aisha Rahman", role: "Frontend Engineer", fit: 91, chip: "bg-emerald-50 text-emerald-700", stage: "Shortlisted" },
    { name: "Marco Silva", role: "Backend Engineer", fit: 87, chip: "bg-indigo-50 text-indigo-700", stage: "Interview" },
    { name: "Priya Nair", role: "Full-Stack Developer", fit: 84, chip: "bg-slate-100 text-slate-500", stage: "Applied" },
  ];
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl shadow-slate-200/40">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Ranked applicants</p>
        <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">24 total</span>
      </div>
      <div className="space-y-2.5">
        {cands.map((c) => (
          <div key={c.name} className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">
              {c.name.split(" ").map((w) => w[0]).join("")}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-slate-900 truncate">{c.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{c.role}</p>
            </div>
            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${c.chip}`}>{c.stage}</span>
            <span className={`text-xs font-black shrink-0 ${c.fit >= 85 ? "text-emerald-600" : "text-slate-700"}`}>{c.fit}%</span>
          </div>
        ))}
      </div>
      <div className="mt-4 bg-indigo-50/60 border border-indigo-100 rounded-xl px-3.5 py-2.5">
        <p className="text-[11px] font-bold text-indigo-700">Matched, partial and missing skills on every card</p>
      </div>
    </div>
  );
}

function PipelineVisual() {
  const stages = [
    { label: "Shortlist", note: "One click, ranked by fit", done: true },
    { label: "Schedule", note: "Interview invites in-app", done: true },
    { label: "Score", note: "Structured scorecards", done: true },
    { label: "Final Selected", note: "Hired — full evidence trail", done: false },
  ];
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl shadow-slate-200/40">
      <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">From shortlist to hire</p>
      <div className="space-y-3">
        {stages.map((s, i) => (
          <div key={s.label}>
            <div className="flex items-center gap-3">
              <span className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center text-[11px] font-black ${s.done ? "bg-indigo-50 text-indigo-700" : "bg-emerald-50 text-emerald-700"}`}>
                {s.done ? <Check className="w-3.5 h-3.5" /> : <PartyPopper className="w-3.5 h-3.5" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-slate-900">{s.label}</p>
                <p className="text-[11px] text-slate-400">{s.note}</p>
              </div>
            </div>
            {i < stages.length - 1 && <div className="ml-[13px] w-px h-3.5 bg-slate-200" />}
          </div>
        ))}
      </div>
      <div className="mt-4 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5">
        <p className="text-[11px] font-bold text-slate-500">Every decision logged — auditable and fair by design</p>
      </div>
    </div>
  );
}

function ForRecruiters() {
  return (
    <section className="bg-slate-50 border-y border-slate-100 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 reveal">
          <p className="text-[10px] font-black tracking-[0.3em] text-indigo-500 uppercase mb-3">For recruiters &amp; agencies</p>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
            Find skilled candidates without drowning in resumes
          </h2>
          <p className="text-slate-500 mt-3 text-base">
            Instead of reading 200 resumes to find 5, read a ranked list — and see why it&apos;s ranked.
          </p>
        </div>

        <div className="space-y-14 sm:space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="reveal-left">
              <span className="inline-block text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full mb-4">
                Screening
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mb-4">
                Applicants arrive ranked by verified fit
              </h3>
              <p className="text-slate-500 text-base leading-relaxed mb-5">
                Every applicant is scored against the exact skills the role
                requires — with matched, partial and missing skills broken out
                on every card. Every completed assessment also feeds a
                searchable talent pool of verified profiles for future roles.
              </p>
              <ul className="space-y-2.5">
                {[
                  "One-click shortlisting from the ranked list",
                  "Skill evidence — not self-reported claims — behind every score",
                  "A talent pool that grows more valuable with each assessment",
                ].map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="reveal-right">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-indigo-100/70 via-violet-100/50 to-transparent rounded-[2rem] blur-xl" />
                <div className="relative"><RankedVisual /></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="reveal-left lg:order-1">
              <span className="inline-block text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full mb-4">
                Decide &amp; hire
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mb-4">
                A complete hiring pipeline in one place
              </h3>
              <p className="text-slate-500 text-base leading-relaxed mb-5">
                Shortlist, schedule interviews, run video calls in-app, record
                structured scorecards, and promote the winner to Final Selected —
                with the whole decision trail documented. Agencies managing
                pipelines across multiple client roles get the same auditable
                records on every hire.
              </p>
              <ul className="space-y-2.5">
                {[
                  "Built-in interview scheduling and video interviews",
                  "Same criteria scored for every candidate — fair by default",
                  "Admin-approved job postings keep the marketplace quality high",
                ].map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="reveal-right lg:order-2">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-violet-100/70 via-indigo-100/50 to-transparent rounded-[2rem] blur-xl" />
                <div className="relative"><PipelineVisual /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   6. FOR CANDIDATES — LEARNING NEW TECHNOLOGIES
═══════════════════════════════════════════════════════════════════════ */
function LearningPathVisual() {
  const modules = [
    { name: "React fundamentals refresher", pct: 100 },
    { name: "Advanced state & data fetching", pct: 65 },
    { name: "Testing & performance patterns", pct: 20 },
    { name: "Capstone: production build", pct: 0 },
  ];
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl shadow-slate-200/40">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Your custom plan</p>
        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">3 weeks</span>
      </div>
      <div className="space-y-3.5">
        {modules.map((m, i) => (
          <div key={m.name}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black ${m.pct === 100 ? "bg-emerald-500 text-white" : "bg-indigo-50 text-indigo-600 border border-indigo-100"}`}>
                  {i + 1}
                </span>
                {m.name}
              </span>
              <span className="text-[10px] font-black text-slate-400">{m.pct}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${m.pct === 100 ? "bg-emerald-500" : "bg-indigo-500"}`}
                style={{ width: `${m.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 bg-emerald-50/60 border border-emerald-100 rounded-xl px-3.5 py-2.5">
        <p className="text-[11px] font-bold text-emerald-700">Certificates feed back into your fit score</p>
      </div>
    </div>
  );
}

function ForCandidates() {
  const loop = [
    { step: "01", title: "Apply and see exactly where you stand", desc: "Not a silent rejection — a real score with a full breakdown of matched and missing skills." },
    { step: "02", title: "Skill gaps, named", desc: "The platform tells you precisely which technologies stand between you and the role." },
    { step: "03", title: "A custom learning path is generated", desc: "AI builds a plan from your target role and current level — via the Learning Hub, not a generic course dump." },
    { step: "04", title: "Learn in bite-sized modules", desc: "Focused lessons with progress tracking, built around the actual job requirements." },
    { step: "05", title: "Come back stronger", desc: "Certificates feed back into your fit score, so the next application is measurably better." },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      <div className="text-center max-w-2xl mx-auto mb-14 reveal">
        <p className="text-[10px] font-black tracking-[0.3em] text-indigo-500 uppercase mb-3">For candidates</p>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
          A rejection that teaches you something
        </h2>
        <p className="text-slate-500 mt-3 text-base">
          Most platforms end the story at &quot;not selected.&quot; JobMatch AI turns it into a plan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
        {/* loop steps */}
        <div className="space-y-2">
          {loop.map((s, i) => (
            <div key={s.step} className={`reveal relative flex gap-4 ${i > 0 ? "pt-2" : ""}`}>
              {/* connector line */}
              {i < loop.length - 1 && (
                <div className="absolute left-[19px] top-12 bottom-0 w-px bg-slate-100" />
              )}
              <span className="relative z-10 w-10 h-10 shrink-0 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-[11px] font-black text-indigo-600 shadow-sm">
                {s.step}
              </span>
              <div className="pb-5">
                <h3 className="text-sm sm:text-base font-black text-slate-900 mb-1">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
          <div className="reveal inline-flex items-center gap-2 mt-2 text-xs font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-4 py-2.5 rounded-full">
            <Repeat className="w-3.5 h-3.5" />
            Then the loop repeats — stronger every time
          </div>
        </div>

        {/* visual */}
        <div className="reveal-scale">
          <div className="relative lg:sticky lg:top-10">
            <div className="absolute -inset-4 bg-gradient-to-br from-emerald-100/60 via-indigo-100/50 to-transparent rounded-[2rem] blur-xl" />
            <div className="relative"><LearningPathVisual /></div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   7. WHO SHOULD USE IT — TARGET AUDIENCE
═══════════════════════════════════════════════════════════════════════ */
function Audience() {
  const personas = [
    {
      icon: <UserRound className="w-5 h-5" />,
      chip: "bg-indigo-50 text-indigo-600",
      title: "Candidates",
      who: "Fresh graduates, career-switchers and working professionals",
      why: "Anyone who wants skills — not pedigree or keyword luck — to decide their next job, and who'd rather hear what to improve than get a silent rejection.",
    },
    {
      icon: <Building2 className="w-5 h-5" />,
      chip: "bg-violet-50 text-violet-600",
      title: "Recruiters & hiring teams",
      who: "Startups and growing companies hiring for specific skill sets",
      why: "Teams that need ranked, evidence-backed shortlists instead of a pile of unranked resumes — and a pipeline that runs from posting to Final Selected in one place.",
    },
    {
      icon: <Users className="w-5 h-5" />,
      chip: "bg-emerald-50 text-emerald-600",
      title: "Recruiting agencies",
      who: "Agencies managing pipelines across many clients and roles",
      why: "Faster screening with auditable records for every placement decision — the evidence trail becomes part of the service you offer clients.",
    },
    {
      icon: <GraduationCap className="w-5 h-5" />,
      chip: "bg-amber-50 text-amber-600",
      title: "Learners & upskillers",
      who: "Anyone closing a skill gap toward a target role",
      why: "Even if you're not hired yet, the platform tells you exactly what to learn and builds the path — turning &quot;not yet qualified&quot; into a plan.",
    },
  ];

  return (
    <section className="bg-slate-50 border-y border-slate-100 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 reveal">
          <p className="text-[10px] font-black tracking-[0.3em] text-indigo-500 uppercase mb-3">Target audience</p>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Who JobMatch AI is built for</h2>
          <p className="text-slate-500 mt-3 text-base">
            Two sides, one principle: decisions made on evidence, not keywords.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
          {personas.map((p) => (
            <div key={p.title} className="reveal bg-white border border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-lg hover:border-indigo-100 transition-all card-hover">
              <div className="flex items-center gap-3 mb-5">
                <span className={`w-11 h-11 rounded-2xl flex items-center justify-center ${p.chip}`}>
                  {p.icon}
                </span>
                <h3 className="text-lg font-black text-slate-900">{p.title}</h3>
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">Who</p>
              <p className="text-sm font-semibold text-slate-700 mb-4">{p.who}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">Why it fits</p>
              <p className="text-sm text-slate-500 leading-relaxed">{p.why}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   8. VALUES
═══════════════════════════════════════════════════════════════════════ */
function Values() {
  const values = [
    {
      title: "Intelligence First",
      desc: "We leverage data to provide insights that traditional hiring misses.",
      icon: <Zap className="w-6 h-6" />,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Radical Integrity",
      desc: "Transparency and fairness are at the heart of our matching engine.",
      icon: <Shield className="w-6 h-6" />,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Human Centric",
      desc: "AI is the tool, but people are the priority. Always.",
      icon: <Heart className="w-6 h-6" />,
      color: "bg-pink-50 text-pink-600",
    },
    {
      title: "Relentless Support",
      desc: "We grow as you grow. Our team is with you at every step.",
      icon: <Award className="w-6 h-6" />,
      color: "bg-indigo-50 text-indigo-600",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      <div className="text-center max-w-2xl mx-auto mb-14 reveal">
        <p className="text-[10px] font-black tracking-[0.3em] text-indigo-500 uppercase mb-3">Our values</p>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Values that drive us</h2>
        <p className="text-slate-500 mt-3 text-base">
          Behind every line of code and every match are the principles that guide our decisions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {values.map((v) => (
          <div key={v.title} className="reveal bg-white border border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-lg hover:border-indigo-100 transition-all card-hover group">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${v.color} group-hover:scale-110 transition-transform`}>
              {v.icon}
            </div>
            <h3 className="text-base font-black text-slate-900 mb-2">{v.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{v.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   9. CLOSING STATEMENT — text only, no buttons, no links
═══════════════════════════════════════════════════════════════════════ */
function Closing() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24 sm:pb-32">
      <div className="reveal relative overflow-hidden bg-slate-900 rounded-3xl sm:rounded-[3rem] px-8 py-14 sm:p-20 text-center">
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-white/10 rounded-full" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] border border-white/10 rounded-full" />
        <div className="pointer-events-none absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-600/20 to-transparent" />

        <div className="relative max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight mb-6">
            Hiring should reward{" "}
            <span className="text-indigo-300">potential, not keywords.</span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            JobMatch AI is built so that every application is understood, every
            skill is verified, and every hire can be explained — for the
            candidate who took the shot and the recruiter who made the call.
            That&apos;s the future we&apos;re building. One fair hire at a time.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════════ */
export default function AboutPage() {
  const revealRef = useScrollReveal({ stagger: 90 });

  return (
    <div className="min-h-screen theme-page">
      <Navbar />

      <main ref={revealRef} className="pb-4">
        <Hero />
        <Motto />
        <Compare />
        <EvidenceChain />
        <ForRecruiters />
        <ForCandidates />
        <Audience />
        <Values />
        <Closing />
      </main>

      <Footer />
    </div>
  );
}
