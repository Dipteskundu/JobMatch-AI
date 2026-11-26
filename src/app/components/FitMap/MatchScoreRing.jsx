"use client";

const RADIUS = 23;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function MatchScoreRing({ score, loading = false, error = false }) {
  const validScore = Number.isFinite(score);
  const progress = validScore
    ? (Math.max(0, Math.min(100, score)) / 100) * CIRCUMFERENCE
    : 0;
  const value = validScore ? `${score}%` : error ? "—" : "…";

  return (
    <span
      aria-hidden="true"
      className="relative flex h-12 w-12 items-center justify-center sm:h-14 sm:w-14"
    >
      <svg viewBox="0 0 56 56" className="absolute inset-0 h-full w-full -rotate-90">
        <circle
          cx="28"
          cy="28"
          r={RADIUS}
          fill="none"
          stroke="#ede9fe"
          strokeWidth="7"
        />
        <circle
          cx="28"
          cy="28"
          r={RADIUS}
          fill="none"
          stroke="#6338f5"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${CIRCUMFERENCE}`}
          className={loading ? "animate-pulse" : ""}
        />
      </svg>
      <span className="absolute text-[10px] font-black text-slate-800 sm:text-[11px]">
        {value}
      </span>
    </span>
  );
}
