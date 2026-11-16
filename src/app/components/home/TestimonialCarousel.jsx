"use client";

/**
 * Rotating testimonial / success-story carousel with arrows, dots and
 * auto-advance (pauses on hover). Structured "proof" chips make the
 * outcomes concrete instead of vague praise.
 */
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star, TrendingUp } from "lucide-react";
import { useScrollReveal } from "../../lib/useScrollReveal";

const STORIES = [
  {
    name: "Jamie Williams",
    role: "Engineering Manager",
    company: "Midwest Tech",
    avatar: "JW",
    avatarBg: "bg-indigo-100 text-indigo-600",
    text: "JobMatch's skill verification helped us identify candidates with actual practical experience. The ranked pipeline replaced our spreadsheet chaos entirely.",
    stars: 4,
    proof: ["Screening time −40%", "12 hires in 6 months"],
  },
  {
    name: "Rohit Patel",
    role: "HR Director",
    company: "Global Enterprises",
    avatar: "RP",
    avatarBg: "bg-emerald-100 text-emerald-600",
    text: "The skill gap detection is spot-on. Our recruiters now have clear, actionable feedback for every applicant — even the ones we don't move forward.",
    stars: 5,
    proof: ["100% scored interviews", "Fairer shortlists"],
  },
  {
    name: "Sofia Laurent",
    role: "Frontend Developer",
    company: "Hired via JobMatch",
    avatar: "SL",
    avatarBg: "bg-violet-100 text-violet-600",
    text: "I could see exactly why I ranked 87 for a role — and exactly which two skills to learn. Two weeks later I re-applied and got shortlisted.",
    stars: 5,
    proof: ["Fit 64% → 87%", "Shortlisted in 2 weeks"],
  },
  {
    name: "Elena Torres",
    role: "Founder",
    company: "StartUp Labs",
    avatar: "ET",
    avatarBg: "bg-amber-100 text-amber-600",
    text: "As a bootstrapped founder, the free tier is perfect. We've hired 3 great developers through the platform already.",
    stars: 5,
    proof: ["3 hires on free tier", "Time-to-hire 9 days"],
  },
  {
    name: "Omar Haddad",
    role: "Backend Engineer",
    company: "Hired via JobMatch",
    avatar: "OH",
    avatarBg: "bg-cyan-100 text-cyan-600",
    text: "The interview was scheduled through the app, I joined the video call from the same dashboard, and got structured feedback after. Felt respectful end to end.",
    stars: 5,
    proof: ["Built-in video interview", "Scored feedback received"],
  },
];

export default function TestimonialCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const revealRef = useScrollReveal({ stagger: 120 });

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % STORIES.length), 5000);
    return () => clearInterval(t);
  }, [paused]);

  const go = (delta) => setIndex((i) => (i + delta + STORIES.length) % STORIES.length);
  const story = STORIES[index];

  return (
    <section
      className="home-theme-section py-20 sm:py-28"
      ref={revealRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Success stories"
    >
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12 reveal">
          <p className="text-[10px] font-black tracking-[0.3em] text-indigo-500 uppercase mb-3">Success stories</p>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Real people, real outcomes</h2>
        </div>

        <div className="relative reveal">
          <div className="card-hover bg-white border border-slate-100 rounded-3xl p-8 sm:p-10">
            <Quote className="w-8 h-8 text-indigo-100 mb-5" aria-hidden="true" />

            <div key={index} className="animate-fade-up">
              {/* Stars */}
              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: story.stars }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-lg sm:text-xl text-slate-700 leading-relaxed font-medium">
                &ldquo;{story.text}&rdquo;
              </p>

              {/* Proof chips */}
              <div className="flex flex-wrap gap-2 mt-6">
                {story.proof.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center gap-1.5 text-[11px] font-black text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full"
                  >
                    <TrendingUp className="w-3 h-3" /> {p}
                  </span>
                ))}
              </div>

              <div className="mt-7 flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full text-sm font-black flex items-center justify-center ${story.avatarBg}`}>
                  {story.avatar}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">{story.name}</p>
                  <p className="text-xs text-slate-400">{story.role} · {story.company}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Arrows */}
          <button
            onClick={() => go(-1)}
            aria-label="Previous story"
            className="absolute top-1/2 -translate-y-1/2 -left-3 sm:-left-6 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Next story"
            className="absolute top-1/2 -translate-y-1/2 -right-3 sm:-right-6 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-7 reveal">
          {STORIES.map((s, i) => (
            <button
              key={s.name}
              onClick={() => setIndex(i)}
              aria-label={`Show story ${i + 1}`}
              className={`h-2 rounded-full transition-all ${i === index ? "w-7 bg-indigo-600" : "w-2 bg-slate-300 hover:bg-slate-400"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
