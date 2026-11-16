"use client";

/**
 * Custom learning-path preview — pulls the REAL public learning paths
 * and lets visitors filter them by career track. Reuses the existing
 * PathCard component so each card deep-links into the Learning Hub.
 */
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Compass, Sparkles } from "lucide-react";
import PathCard from "../learning/PathCard";
import { fetchPaths } from "../../lib/learningApi";
import { useScrollReveal } from "../../lib/useScrollReveal";

const TRACKS = [
  { id: "All", keywords: [] },
  { id: "Frontend", keywords: ["front", "react", "ui", "web", "javascript", "css"] },
  { id: "Backend", keywords: ["back", "node", "api", "server", "database", "sql"] },
  { id: "Data & AI", keywords: ["data", "ai", "ml", "python", "analytics"] },
];

function trackMatch(path, track) {
  if (track.id === "All") return true;
  const haystack = `${path?.topic || ""} ${path?.title || ""} ${path?.description || ""}`.toLowerCase();
  return track.keywords.some((kw) => haystack.includes(kw));
}

export default function LearningPathPreview() {
  const [paths, setPaths] = useState(null); // null = loading
  const [track, setTrack] = useState(TRACKS[0]);
  const revealRef = useScrollReveal({ stagger: 100 });

  useEffect(() => {
    let cancelled = false;
    fetchPaths()
      .then((list) => {
        if (!cancelled && Array.isArray(list)) setPaths(list);
      })
      .catch(() => {
        if (!cancelled) setPaths([]);
      });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(
    () => (paths || []).filter((p) => trackMatch(p, track)),
    [paths, track]
  );

  const loading = paths === null;

  return (
    <section className="py-20 sm:py-28 bg-white" ref={revealRef}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12 reveal">
          <p className="text-[10px] font-black tracking-[0.3em] text-indigo-500 uppercase mb-3">Learning Hub</p>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Close your skill gaps with real paths</h2>
          <p className="text-slate-500 mt-3 text-base max-w-xl mx-auto">
            These are live learning paths from the platform — pick a track and start one today,
            or let the AI build a custom plan for your target role.
          </p>
        </div>

        {/* Track filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-10 reveal">
          {TRACKS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTrack(t)}
              aria-pressed={track.id === t.id}
              className={`px-4 py-2 rounded-full text-sm font-bold border transition-all btn-press ${
                track.id === t.id
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200"
                  : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
              }`}
            >
              {t.id === "All" ? "All paths" : t.id}
            </button>
          ))}
        </div>

        {/* Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-slate-50 border border-slate-100 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="max-w-md mx-auto text-center bg-slate-50 border border-slate-100 rounded-2xl p-8">
            <Compass className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-600">No paths in this track yet — more are being curated.</p>
            <Link href="/learning-hub" className="mt-3 inline-flex items-center gap-1 text-xs font-black text-indigo-600 hover:underline">
              Explore the Learning Hub <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filtered.slice(0, 3).map((path, i) => (
              <PathCard key={path._id} path={path} index={i} />
            ))}
          </div>
        )}

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center reveal">
          <Link
            href="/learning-hub/create-plan"
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-full font-black text-sm shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-colors"
          >
            <Sparkles className="w-4 h-4" /> Build my custom plan
          </Link>
          <Link
            href="/learning-hub"
            className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-full font-bold text-sm hover:border-indigo-300 hover:text-indigo-700 transition-colors"
          >
            Browse the Learning Hub <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
