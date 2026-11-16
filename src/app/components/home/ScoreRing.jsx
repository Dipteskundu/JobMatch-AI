"use client";

/**
 * Shared animated SVG fit-score ring, reused by the home page demos.
 * Theme-aware: the track reads the CSS `--secondary` token so it adapts
 * to light/dark mode; success colors follow the FitMapModal convention.
 */
export default function ScoreRing({ score, size = 104, label = "Fit" }) {
  const R = 42;
  const C = 2 * Math.PI * R;
  const strokeDash = ((Math.max(0, Math.min(100, score)) / 100) * C).toFixed(1);
  const color =
    score >= 75 ? "#10b981" : score >= 50 ? "#6366f1" : "#f59e0b";

  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label} score ${score} out of 100`}
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="absolute inset-0 -rotate-90"
      >
        <circle
          cx="50"
          cy="50"
          r={R}
          fill="none"
          strokeWidth="9"
          style={{ stroke: "var(--secondary)" }}
        />
        <circle
          cx="50"
          cy="50"
          r={R}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${strokeDash} ${C}`}
          style={{ transition: "stroke-dasharray 0.7s ease, stroke 0.3s ease" }}
        />
      </svg>
      <div className="flex flex-col items-center z-10">
        <span
          className="font-black leading-none"
          style={{ fontSize: size * 0.3 }}
        >
          {Math.round(score)}
        </span>
        <span
          className="font-bold uppercase tracking-wider text-slate-400 mt-0.5"
          style={{ fontSize: Math.max(8, size * 0.09) }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
