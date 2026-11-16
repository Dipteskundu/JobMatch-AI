"use client";

/**
 * Feature Spotlight — alternating detail blocks that explain a real
 * platform feature and deep-link into it. Guests clicking a CTA are sent
 * to /signin?redirect=<feature>, so after authenticating they land on
 * the feature itself (via the existing postLoginPath() round-trip).
 */
import { CheckCircle2 } from "lucide-react";
import FeatureLink from "./FeatureLink";
import ScoreRing from "./ScoreRing";
import { useAuth } from "../../lib/AuthContext";

/* ── Mini visuals (CSS-only, theme-safe) ─────────────────────────────── */

function TrackingVisual() {
  const stages = ["Submitted", "Seen", "Shortlisted", "Task", "Interview", "Hired"];
  const active = 3;
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl shadow-slate-200/40">
      <div className="relative">
        <div className="absolute top-[15px] left-0 right-0 h-0.5 bg-slate-200" />
        <div className="absolute top-[15px] left-0 h-0.5 bg-gradient-to-r from-indigo-500 to-emerald-500" style={{ width: "60%" }} />
        <div className="relative grid grid-cols-6">
          {stages.map((s, i) => (
            <div key={s} className="flex flex-col items-center gap-1.5">
              <span className={`w-8 h-8 rounded-full border-2 ${i <= active ? "bg-indigo-600 border-transparent" : "bg-white border-slate-200"} ${i === active ? "ring-4 ring-indigo-100" : ""}`} />
              <span className={`text-[8px] font-black uppercase tracking-wider text-center ${i === active ? "text-slate-900" : i < active ? "text-slate-500" : "text-slate-300"}`}>{s}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-5 bg-slate-50 border border-slate-100 rounded-xl p-3.5">
        <p className="text-xs font-black text-slate-900">Task received from TechFlow AI</p>
        <p className="text-[11px] text-slate-500 mt-1">Complete the practical task before the deadline to stay in the running.</p>
      </div>
    </div>
  );
}

function ScoreVisual() {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl shadow-slate-200/40">
      <div className="flex items-center gap-5">
        <ScoreRing score={87} size={104} label="Fit" />
        <div className="min-w-0">
          <p className="text-sm font-black text-slate-900">Senior React Developer</p>
          <p className="text-xs text-slate-400 mb-2.5">Ranked #1 of 24 applicants</p>
          <div className="flex flex-wrap gap-1.5">
            {["React.js", "TypeScript", "Node.js"].map((s) => (
              <span key={s} className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-2 py-1">{s}</span>
            ))}
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1">Next.js</span>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 rounded-md px-2 py-1">GraphQL</span>
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {[{ f: "Skill match", w: 45 }, { f: "Assessment performance", w: 25 }, { f: "Relevant experience", w: 15 }].map((r) => (
          <div key={r.f}>
            <div className="flex justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-600">{r.f}</span>
              <span className="text-[10px] font-black text-indigo-600">{r.w}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" style={{ width: `${(r.w / 45) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LearningVisual() {
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
                <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black ${m.pct === 100 ? "bg-emerald-500 text-white" : "bg-indigo-50 text-indigo-600 border border-indigo-100"}`}>{i + 1}</span>
                {m.name}
              </span>
              <span className="text-[10px] font-black text-slate-400">{m.pct}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${m.pct === 100 ? "bg-emerald-500" : "bg-indigo-500"}`} style={{ width: `${m.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PipelineVisual() {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl shadow-slate-200/40">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Ranked applicants</p>
        <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">24 total</span>
      </div>
      <div className="space-y-2.5">
        {[
          { name: "Aisha Rahman", role: "Frontend Engineer", fit: 91, chip: "bg-emerald-50 text-emerald-700", stage: "Shortlisted" },
          { name: "Marco Silva", role: "Backend Engineer", fit: 87, chip: "bg-indigo-50 text-indigo-700", stage: "Interview" },
          { name: "Priya Nair", role: "Full-Stack Developer", fit: 84, chip: "bg-slate-100 text-slate-500", stage: "Applied" },
        ].map((c) => (
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
      <div className="mt-4 bg-indigo-50/60 border border-indigo-100 rounded-xl px-3.5 py-2.5 flex items-center gap-2">
        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
        <p className="text-[11px] font-bold text-indigo-700">Every score arrives with its full skill breakdown</p>
      </div>
    </div>
  );
}

const VISUALS = {
  tracking: TrackingVisual,
  score: ScoreVisual,
  learning: LearningVisual,
  pipeline: PipelineVisual,
};

/* ── Data ─────────────────────────────────────────────────────────────── */

const SPOTLIGHTS = [
  {
    eyebrow: "For candidates",
    title: "Track every application, stage by stage",
    desc: "No more black-hole applications. Each one gets a live timeline — submitted, seen, shortlisted, task, interview, hired — so you always know where you stand and what comes next.",
    bullets: [
      "Real-time status updates the moment a recruiter acts",
      "Practical tasks delivered and submitted in-platform",
      "Transparent outcomes — even rejections come with feedback",
    ],
    cta: { label: "Open my applications", feature: "/applications" },
    visual: "tracking",
  },
  {
    eyebrow: "For candidates",
    title: "A fit score you can actually trust",
    desc: "Every job is scored against your verified skills with five openly weighted factors — skill match, assessments, experience, education and role criteria. You see the exact same breakdown recruiters see.",
    bullets: [
      "Upload your resume once — every job scores against it",
      "Matched, partial and missing skills listed per job",
      "Skill-gap analysis tells you exactly what to learn next",
    ],
    cta: { label: "Score my resume", feature: "/resume" },
    visual: "score",
  },
  {
    eyebrow: "For candidates",
    title: "Close your gaps with custom learning paths",
    desc: "When a skill is missing, the platform doesn't just tell you — it builds the plan. AI-generated paths from the Learning Hub take you from gap to interview-ready, module by module.",
    bullets: [
      "AI plans built from your target role and current level",
      "Bite-sized modules with progress tracking",
      "Certificates that feed back into your fit score",
    ],
    cta: { label: "Build my learning plan", feature: "/learning-hub/create-plan" },
    visual: "learning",
  },
  {
    eyebrow: "For recruiters",
    title: "A hiring pipeline that ranks itself",
    desc: "Applicants arrive ranked by verified fit, not arrival time. Shortlist with one click, schedule interviews in-app, score them on structured criteria, and hire with a complete evidence trail.",
    bullets: [
      "AI ranking with matched / partial / missing skills per applicant",
      "Built-in interview scheduling, video calls and scorecards",
      "Every decision logged — auditable and fair by design",
    ],
    cta: { label: "Open my pipeline", feature: "/applicants" },
    visual: "pipeline",
  },
];

/* ── Section ──────────────────────────────────────────────────────────── */

export default function FeatureSpotlight() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="py-20 sm:py-28 bg-white" aria-label="Feature spotlight">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16 reveal">
          <p className="text-[10px] font-black tracking-[0.3em] text-indigo-500 uppercase mb-3">Feature spotlight</p>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Go straight to the real thing</h2>
          <p className="text-slate-500 mt-3 text-base max-w-xl mx-auto">
            Each link below opens the actual feature. Not signed in yet? You&apos;ll be asked to
            sign in first — then dropped right where you were heading.
          </p>
        </div>

        <div className="space-y-16 sm:space-y-20">
          {SPOTLIGHTS.map((spot) => {
            const Visual = VISUALS[spot.visual];
            const flip = spot.visual === "score" || spot.visual === "pipeline";
            return (
              <div key={spot.title} className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center reveal">
                {/* Copy */}
                <div className={flip ? "lg:order-2" : ""}>
                  <span className="inline-block text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full mb-4">
                    {spot.eyebrow}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mb-4">
                    {spot.title}
                  </h3>
                  <p className="text-slate-500 text-base leading-relaxed mb-5">{spot.desc}</p>
                  <ul className="space-y-2.5 mb-7">
                    {spot.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <FeatureLink
                    feature={spot.cta.feature}
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-full font-black text-sm shadow-md shadow-indigo-200 hover:bg-indigo-700 btn-press transition-colors"
                  >
                    {spot.cta.label}
                    <span className="text-indigo-200 text-xs font-bold hidden sm:inline">
                      {isAuthenticated ? "" : "· sign in first"}
                    </span>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </FeatureLink>
                </div>

                {/* Visual */}
                <div className={flip ? "lg:order-1" : ""}>
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-br from-indigo-100/70 via-violet-100/50 to-transparent rounded-[2rem] blur-xl" />
                    <div className="relative">
                      <Visual />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
