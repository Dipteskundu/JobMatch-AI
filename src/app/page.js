"use client";

import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import HomeHero from "./components/Hero/HomeHero";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Brain,
  BriefcaseBusiness,
  ChevronDown,
  ClipboardList,
  PartyPopper,
  Search,
  Send,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "./lib/AuthContext";
import { useScrollReveal } from "./lib/useScrollReveal";

/* ── Home page sections ── */
import ProductTour from "./components/home/ProductTour";
import FeatureSpotlight from "./components/home/FeatureSpotlight";
import LivePulse from "./components/home/LivePulse";
import LearningPathPreview from "./components/home/LearningPathPreview";
import CompanySpotlight from "./components/home/CompanySpotlight";
import TestimonialCarousel from "./components/home/TestimonialCarousel";
import FaqAccordion from "./components/home/FaqAccordion";
import HomeChatLauncher from "./components/home/HomeChatLauncher";
import FeatureLink from "./components/home/FeatureLink";

/* ─── Animated counter hook ───────────────────────────────────────────── */
function useCountUp(target, duration = 1800, startOnView = true) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(!startOnView);
  const ref = useRef(null);

  useEffect(() => {
    if (!startOnView) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [startOnView]);

  useEffect(() => {
    if (!started) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - prog, 3);
      setCount(Math.floor(ease * target));
      if (prog < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);

  return { count, ref };
}

/* ─── Static data ──────────────────────────────────────────────────────── */
const HOW_STEPS = [
  {
    num: "01",
    icon: <Search className="w-5 h-5" />,
    title: "Post a Role",
    desc: "Define the skills that matter — not just job titles. Our AI auto-generates relevant assessment templates.",
  },
  {
    num: "02",
    icon: <Brain className="w-5 h-5" />,
    title: "Assess Candidates",
    desc: "Candidates complete structured skill tests. Cognitive depth, not just syntax — evaluated in real time.",
  },
  {
    num: "03",
    icon: <Target className="w-5 h-5" />,
    title: "Hire with Confidence",
    desc: "Get ranked matches backed by verified performance data, skill heatmaps, and AI-powered insights.",
  },
];

const FEATURES = [
  {
    id: "bias",
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "Bias-Free Screening",
    desc: "Evaluate purely on skill signals and real performance data — fully anonymised until shortlisting.",
    accent: "bg-blue-50",
    iconColor: "text-blue-600",
    link: "/skill-test",
  },
  {
    id: "pulse",
    icon: <Activity className="w-6 h-6" />,
    title: "Real-time Pulse",
    desc: "Live evaluation tracking as candidates complete each assessment module.",
    accent: "bg-violet-50",
    iconColor: "text-violet-600",
    link: "/applications",
  },
  {
    id: "cognitive",
    icon: <Brain className="w-6 h-6" />,
    title: "Cognitive Analysis",
    desc: "Understand problem-solving depth, not just code output or buzzword frequency.",
    accent: "bg-indigo-50",
    iconColor: "text-indigo-600",
    link: "/skill-test",
  },
  {
    id: "gap",
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Skill Gap Detection",
    desc: "Pinpoint exactly where a candidate falls short and suggest targeted learning paths.",
    accent: "bg-emerald-50",
    iconColor: "text-emerald-600",
    link: "/skill-gap-detection",
  },
  {
    id: "ai",
    icon: <Zap className="w-6 h-6" />,
    title: "AI Matching Engine",
    desc: "Our proprietary model ranks candidates by verified ability, not keyword density.",
    accent: "bg-amber-50",
    iconColor: "text-amber-600",
    link: "/jobs",
  },
  {
    id: "targeted",
    icon: <Target className="w-6 h-6" />,
    title: "Role-to-Skill Mapping",
    desc: "Define exactly what each role requires and let assessments map candidates against it.",
    accent: "bg-rose-50",
    iconColor: "text-rose-600",
    link: "/post-job",
  },
  {
    id: "pool",
    icon: <Users className="w-6 h-6" />,
    title: "Rich Talent Pool",
    desc: "Every completed assessment adds a verified profile to your searchable talent pool.",
    accent: "bg-cyan-50",
    iconColor: "text-cyan-600",
    link: "/applicants",
  },
];

const STATS = [
  { label: "Developers", value: 150, suffix: "+", display: "150+" },
  { label: "Tech Companies", value: 25, suffix: "+", display: "25+" },
  { label: "Match Accuracy", value: 85, suffix: "%", display: "85%" },
  { label: "Hours Saved", value: 8, suffix: "m", display: "8m" },
];

const RECRUITER_STEPS = [
  {
    step: "01",
    icon: <Send className="w-5 h-5" />,
    title: "Post a job",
    desc: "Publish a role with required skills, salary and deadlines. Admin-approved so quality stays high.",
    href: "/post-job",
    cta: "Post a job",
  },
  {
    step: "02",
    icon: <Target className="w-5 h-5" />,
    title: "Review ranked applicants",
    desc: "Applicants arrive ranked by fit score with matched, partial and missing skills on every card.",
    href: "/applicants",
    cta: "Open my pipeline",
  },
  {
    step: "03",
    icon: <ClipboardList className="w-5 h-5" />,
    title: "Schedule & score interviews",
    desc: "Send interview invites, run video interviews in-app, and record structured scorecards.",
    href: "/interviews",
    cta: "Go to interviews",
  },
  {
    step: "04",
    icon: <PartyPopper className="w-5 h-5" />,
    title: "Hire with evidence",
    desc: "Promote your best candidate to Final Selected — the whole decision trail is documented.",
    href: "/final-selected",
    cta: "Review final selections",
  },
];

/* ─── Component ────────────────────────────────────────────────────────── */
export default function Home() {
  /* Welcome Popup */
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeLeaving, setWelcomeLeaving] = useState(false);
  const { user } = useAuth();

  /* Smooth scroll-reveal for every section below the hero */
  const revealRef = useScrollReveal({ stagger: 90 });

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("showWelcome") === "1") {
      sessionStorage.removeItem("showWelcome");

      const show = setTimeout(() => setShowWelcome(true), 400);
      return () => clearTimeout(show);
    }
  }, []);

  const dismissWelcome = () => {
    setWelcomeLeaving(true);
    setTimeout(() => { setShowWelcome(false); setWelcomeLeaving(false); }, 400);
  };

  useEffect(() => {
    if (!showWelcome) return;
    const hide = setTimeout(() => dismissWelcome(), 4000);
    return () => clearTimeout(hide);
  }, [showWelcome]);

  const displayName = user?.displayName
    ? user.displayName.split(" ")[0]
    : user?.email?.split("@")[0] ?? "there";

  return (
    <div className="min-h-screen bg-white selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      <Navbar />

      {/* ── Welcome Back Popup ─────────────────────────────────────────── */}
      {showWelcome && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] transition-all duration-400 ${welcomeLeaving ? "opacity-0 translate-y-4 scale-95" : "opacity-100 translate-y-0 scale-100"}`}
          style={{ transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)" }}
          role="status"
          aria-live="polite"
        >
          <div className="absolute bottom-0 left-0 h-[3px] bg-indigo-500/20 w-full rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full animate-welcome-bar" />
          </div>
          <div className="flex items-center gap-4 bg-white border border-slate-100 shadow-xl shadow-slate-200/60 rounded-2xl px-5 py-4 min-w-[300px] max-w-[420px]">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
              <PartyPopper className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">Welcome back</p>
              <p className="text-[16px] font-black text-slate-900 truncate">{displayName}!</p>
            </div>
            <button onClick={dismissWelcome} className="shrink-0 p-1.5 rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}

      <main ref={revealRef}>
        {/* ══════════════════════════════════════════════════════════════
            1. ORIGINAL HERO
        ══════════════════════════════════════════════════════════════ */}
        <HomeHero stats={STATS} />

        {/* ══════════════════════════════════════════════════════════════
            2. LIVE PLATFORM PULSE — real approved jobs ticker
        ══════════════════════════════════════════════════════════════ */}
        <LivePulse />

        {/* ══════════════════════════════════════════════════════════════
            3. HOW IT WORKS
        ══════════════════════════════════════════════════════════════ */}
        <section id="how-it-works" className="py-5 sm:py-25 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16 reveal">
              <p className="text-[10px] font-black tracking-[0.3em] text-indigo-500 uppercase mb-3">Process</p>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Three steps to smarter hiring</h2>
              <p className="text-slate-500 mt-3 text-base max-w-xl mx-auto">
                From job post to verified candidate in a fraction of traditional hiring time.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* Connector line on desktop */}
              <div className="hidden md:block absolute top-12 left-[calc(16.66%+1.5rem)] right-[calc(16.66%+1.5rem)] h-[2px] bg-gradient-to-r from-indigo-200 via-violet-200 to-indigo-200" />

              {HOW_STEPS.map((step, idx) => (
                <div key={step.num} className="reveal card-hover relative bg-white border border-slate-100 rounded-2xl p-7 text-left hover:border-indigo-100 group">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-indigo-200 relative z-10">
                      {step.icon}
                    </div>
                    <span className="text-[10px] font-black tracking-widest text-slate-300 uppercase">{step.num}</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-2 group-hover:text-indigo-700 transition-colors">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center reveal">
              <FeatureLink
                feature="/jobs"
                className="inline-flex items-center gap-2 text-sm font-black text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                See it live — browse open jobs ranked by skills <ArrowRight className="w-4 h-4" />
              </FeatureLink>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            4. FOR RECRUITERS — HIRE IN 4 STEPS
        ══════════════════════════════════════════════════════════════ */}
        <section id="hiring-flow" className="py-20 sm:py-28 bg-slate-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14 reveal">
              <p className="text-[10px] font-black tracking-[0.3em] text-indigo-500 uppercase mb-3">For recruiters</p>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Hire in four steps</h2>
              <p className="text-slate-500 mt-3 text-base max-w-xl mx-auto">
                The exact flow you&apos;ll run inside the platform — click any step to see it in action.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              {RECRUITER_STEPS.map((s) => (
                <StepLink key={s.step} step={s} />
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            5. TRY IT LIVE — INTERACTIVE PRODUCT TOUR
        ══════════════════════════════════════════════════════════════ */}
        <ProductTour />

        {/* ══════════════════════════════════════════════════════════════
            6. FEATURE SPOTLIGHT — detail + gated deep links
        ══════════════════════════════════════════════════════════════ */}
        <FeatureSpotlight />

        {/* ══════════════════════════════════════════════════════════════
            6. FEATURES — BENTO GRID
        ══════════════════════════════════════════════════════════════ */}
        <section className="home-theme-section py-20 sm:py-28">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16 reveal">
              <p className="text-[10px] font-black tracking-[0.3em] text-indigo-500 uppercase mb-3">Capabilities</p>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Everything you need to hire smarter</h2>
              <p className="text-slate-500 mt-3 text-base max-w-xl mx-auto">
                Modern, measurable hiring tools designed for engineering-driven teams.
              </p>
            </div>

            {/* Bento grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-auto">
              <FeatureCard f={FEATURES[0]} className="sm:col-span-2" />
              <FeatureCard f={FEATURES[1]} />
              <FeatureCard f={FEATURES[2]} />
              <FeatureCard f={FEATURES[3]} />
              <FeatureCard f={FEATURES[5]} />
              <FeatureCard f={FEATURES[4]} className="sm:col-span-2" />
              <FeatureCard f={FEATURES[6]} />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            7. LEARNING PATHS — real public catalog
        ══════════════════════════════════════════════════════════════ */}
        <LearningPathPreview />

        {/* ══════════════════════════════════════════════════════════════
            8. COMPANY SPOTLIGHT — real companies
        ══════════════════════════════════════════════════════════════ */}
        <CompanySpotlight />

        {/* ══════════════════════════════════════════════════════════════
            9. STATS
        ══════════════════════════════════════════════════════════════ */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12 reveal">
              <p className="text-[10px] font-black tracking-[0.3em] text-indigo-500 uppercase mb-3">Impact</p>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Numbers that speak for themselves</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {STATS.map((s) => (
                <StatCard key={s.label} stat={s} />
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            10. SUCCESS STORIES CAROUSEL
        ══════════════════════════════════════════════════════════════ */}
        <TestimonialCarousel />

        {/* ══════════════════════════════════════════════════════════════
            11. RESPONSIBLE AI — expandable explainability
        ══════════════════════════════════════════════════════════════ */}
        <section className="py-20 sm:py-28 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14 reveal">
              <p className="text-[10px] font-black tracking-[0.3em] text-indigo-500 uppercase mb-3">Human in the loop</p>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900">AI assists. Recruiters decide.</h2>
              <p className="text-slate-500 mt-3 text-base max-w-xl mx-auto">
                The platform is decision support, not decision authority — every recommendation is transparent and reviewable.
              </p>
            </div>
            <AICards />
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            12. FOR CANDIDATES — SKILL GAP TO GROWTH
        ══════════════════════════════════════════════════════════════ */}
        <section className="py-20 sm:py-28 bg-slate-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14 reveal">
              <p className="text-[10px] font-black tracking-[0.3em] text-indigo-500 uppercase mb-3">For candidates</p>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Turn every application into growth</h2>
              <p className="text-slate-500 mt-3 text-base max-w-xl mx-auto">
                Assessments do more than prove skills — they show you exactly what to learn next.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              {[
                { step: "01", icon: <Users className="w-5 h-5" />, title: "Upload your resume", desc: "Skills and experience are extracted automatically — review and confirm them." },
                { step: "02", icon: <Target className="w-5 h-5" />, title: "Take the assessment", desc: "Role-specific tests verify practical ability, not buzzwords." },
                { step: "03", icon: <TrendingUp className="w-5 h-5" />, title: "See your skill gaps", desc: "Get a clear list of what is missing or weak for each target job." },
                { step: "04", icon: <Zap className="w-5 h-5" />, title: "Close the gap", desc: "Follow suggested learning paths, re-test, and rank higher next time." },
              ].map((s) => (
                <div key={s.step} className="reveal card-hover bg-white border border-slate-100 rounded-2xl p-7 hover:border-indigo-100 group">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
                      {s.icon}
                    </div>
                    <span className="text-[10px] font-black tracking-widest text-slate-300 uppercase">{s.step}</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mb-2 group-hover:text-indigo-700 transition-colors">{s.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                href="/resume"
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-full font-black text-sm shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-colors"
              >
                Upload your resume <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            13. TRUST & SECURITY — clickable policies
        ══════════════════════════════════════════════════════════════ */}
        <section className="py-16 bg-white border-y border-slate-100">
          <div className="max-w-6xl mx-auto px-6 text-center reveal">
            <p className="text-[10px] font-black tracking-[0.3em] text-indigo-500 uppercase mb-3">Trust &amp; safety</p>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Built with security defaults</h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {[
                "Firebase-secured authentication",
                "Role-based access control",
                "Verified recruiter & candidate roles",
                "Data access limited by role",
                "Validated API inputs",
              ].map((chip) => (
                <span key={chip} className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm font-semibold text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" /> {chip}
                </span>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {[
                { label: "Privacy policy", href: "/privacy" },
                { label: "Terms of service", href: "/terms" },
                { label: "Cookie policy", href: "/cookies" },
              ].map((chip) => (
                <Link
                  key={chip.href}
                  href={chip.href}
                  className="inline-flex items-center gap-1.5 text-sm font-black text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-2 hover:bg-indigo-100 transition-colors"
                >
                  {chip.label} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ))}
            </div>
            <p className="text-sm text-slate-500 mt-6 max-w-xl mx-auto">
              Candidates control their own profile data. Recruiters only see candidate information their role requires.
            </p>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            14. FAQ
        ══════════════════════════════════════════════════════════════ */}
        <FaqAccordion />

        {/* ══════════════════════════════════════════════════════════════
            15. MEET THE AI — chat launcher
        ══════════════════════════════════════════════════════════════ */}
        <HomeChatLauncher />

        {/* ══════════════════════════════════════════════════════════════
            16. FINAL CTA — dual path
        ══════════════════════════════════════════════════════════════ */}
        <section className="py-16 sm:py-20">
          <div className="max-w-5xl mx-auto px-6">
            <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 rounded-3xl p-10 sm:p-16 text-center text-white overflow-hidden reveal-scale">
              {/* Grid overlay */}
              <div className="absolute inset-0 opacity-10 bg-[linear-gradient(90deg,rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:20px_20px]" />
              {/* Orbs */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-56 h-56 bg-violet-400/20 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-bold tracking-wide mb-6">
                  <Users className="w-3.5 h-3.5" /> One platform for candidates &amp; recruiters
                </div>
                <h2 className="text-2xl sm:text-4xl font-black leading-tight">
                  Ready to make your next move?
                </h2>
                <p className="text-indigo-200 text-sm sm:text-base mt-3 max-w-lg mx-auto">
                  Find a role that values what you can actually do — or build a team that does the same.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/jobs"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-indigo-700 px-8 py-3.5 rounded-full font-black text-sm shadow-lg shadow-black/10 hover:bg-indigo-50 transition-colors"
                  >
                    <BriefcaseBusiness className="w-4 h-4" /> Find my job
                  </Link>
                  <Link
                    href="/signup"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-800/60 border border-indigo-500/50 text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-indigo-800 transition-colors"
                  >
                    Hire talent <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <p className="mt-5 text-indigo-300 text-xs">No credit card required · Free plan available · Cancel anytime</p>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

/* ─── Feature Card sub-component ──────────────────────────────────────── */
function FeatureCard({ f, className = "" }) {
  return (
    <div
      className={`reveal card-hover bg-white border border-slate-100 rounded-2xl p-7 flex flex-col hover:border-indigo-100 group ${className}`}
    >
      <div className={`w-11 h-11 rounded-2xl ${f.accent} flex items-center justify-center mb-5 ${f.iconColor} group-hover:scale-110 transition-transform duration-200`}>
        {f.icon}
      </div>
      <h3 className="text-base font-black text-slate-900 mb-2 group-hover:text-indigo-700 transition-colors">{f.title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
      {f.link && (
        <FeatureLink
          feature={f.link}
          className="mt-auto pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-black text-indigo-600 group-hover:gap-2.5 transition-all"
        >
          Explore this feature <ArrowRight className="w-3.5 h-3.5" />
        </FeatureLink>
      )}
    </div>
  );
}

/* ─── Stat Card sub-component ─────────────────────────────────────────── */
function StatCard({ stat }) {
  const { count, ref } = useCountUp(stat.value);

  return (
    <div ref={ref} className="reveal-scale card-hover bg-white border border-slate-100 rounded-2xl py-8 px-4 text-center hover:border-indigo-100">
      <div className="text-3xl sm:text-4xl font-black text-slate-900">
        <span className="shimmer-text">
          {count}{stat.suffix}
        </span>
      </div>
      <div className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400 mt-2">
        {stat.label}
      </div>
    </div>
  );
}

/* ─── Recruiter step card (gated deep link → real feature) ────────────── */
function StepLink({ step }) {
  return (
    <div className="reveal card-hover bg-white border border-slate-100 rounded-2xl p-7 flex flex-col hover:border-indigo-100 group text-left">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
          {step.icon}
        </div>
        <span className="text-[10px] font-black tracking-widest text-slate-300 uppercase">{step.step}</span>
      </div>
      <h3 className="text-base font-black text-slate-900 mb-2 group-hover:text-indigo-700 transition-colors">{step.title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed flex-1">{step.desc}</p>
      <FeatureLink
        feature={step.href}
        className="mt-4 inline-flex items-center gap-1.5 text-xs font-black text-indigo-600 group-hover:gap-2.5 transition-all"
      >
        {step.cta} <ArrowRight className="w-3.5 h-3.5" />
      </FeatureLink>
    </div>
  );
}

/* ─── Responsible AI expandable cards ─────────────────────────────────── */
const AI_CARDS = [
  {
    icon: <Activity className="w-6 h-6" />,
    accent: "bg-indigo-50",
    iconColor: "text-indigo-600",
    title: "Decision support only",
    short: "Scores and rankings assist review — nothing is auto-rejected or auto-hired.",
    detail: "Every ranking is a suggestion for the recruiter, never a verdict. Even the lowest-scored applicant remains fully visible, reviewable, and shortlistable — the AI has no power to remove anyone from your pipeline.",
  },
  {
    icon: <Users className="w-6 h-6" />,
    accent: "bg-emerald-50",
    iconColor: "text-emerald-600",
    title: "Humans make the call",
    short: "Recruiters own every shortlist, interview, and hiring decision.",
    detail: "Shortlisting, interview scheduling, scoring and hiring all require explicit recruiter actions. The platform records who did what and when, so accountability stays with people — not the model.",
  },
  {
    icon: <Brain className="w-6 h-6" />,
    accent: "bg-violet-50",
    iconColor: "text-violet-600",
    title: "Explainable by default",
    short: "Matched, partial, and missing skills are listed with every score.",
    detail: "No score is ever just a number: the exact skill breakdown and the five open weights behind it are shown to recruiters and candidates alike. You can always ask \u201cwhy this score\u201d and get a real answer.",
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    accent: "bg-amber-50",
    iconColor: "text-amber-600",
    title: "Configurations are logged",
    short: "Scoring weights and AI outputs are recorded so behavior can be audited.",
    detail: "Every AI interaction and scoring configuration is stored and reviewable. If a result ever looks wrong, there is a complete audit trail to investigate — and to correct.",
  },
];

function AICards() {
  const [open, setOpen] = useState(-1);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {AI_CARDS.map((c, i) => {
        const isOpen = open === i;
        return (
          <div key={c.title} className="reveal h-full">
            <button
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              className={`card-hover h-full w-full text-left bg-white border rounded-2xl p-7 group transition-colors ${isOpen ? "border-indigo-200 shadow-md shadow-indigo-100/40" : "border-slate-100 hover:border-indigo-100"}`}
            >
              <div className="flex items-center justify-between mb-5">
                <div className={`w-11 h-11 rounded-2xl ${c.accent} flex items-center justify-center ${c.iconColor} group-hover:scale-110 transition-transform duration-200`}>
                  {c.icon}
                </div>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${isOpen ? "bg-indigo-600 text-white rotate-180" : "bg-slate-100 text-slate-400"}`}>
                  <ChevronDown className="w-3.5 h-3.5" />
                </span>
              </div>
              <h3 className={`text-base font-black mb-2 transition-colors ${isOpen ? "text-indigo-700" : "text-slate-900 group-hover:text-indigo-700"}`}>{c.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{isOpen ? c.detail : c.short}</p>
              <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-indigo-400 transition-colors">
                {isOpen ? "Click to collapse" : "Click for details"}
              </p>
            </button>
          </div>
        );
      })}
    </div>
  );
}
