"use client";

import { useEffect, useState } from "react";
import api from "../../lib/apiClient";

const RADIUS = 23;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ProfileMatchButton({ jobId, jobTitle, uid, onClick }) {
  const [fit, setFit] = useState({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function fetchFitScore() {
      setFit({ status: "loading" });
      try {
        const response = await api.get(`/api/jobs/${jobId}/fit`, {
          params: { uid },
        });
        const score = response.data?.data?.matchScore;
        if (!response.data?.success || !Number.isFinite(score)) {
          throw new Error("Fit score response was invalid.");
        }

        if (!cancelled) {
          setFit({
            status: "loaded",
            score: Math.max(0, Math.min(100, score)),
          });
        }
      } catch {
        if (!cancelled) setFit({ status: "error" });
      }
    }

    fetchFitScore();
    return () => {
      cancelled = true;
    };
  }, [jobId, uid]);

  const score = fit.status === "loaded" ? fit.score : null;
  const progress = score === null ? 0 : (score / 100) * CIRCUMFERENCE;
  const label =
    fit.status === "loading"
      ? "Loading profile match"
      : fit.status === "error"
        ? "Profile match unavailable"
        : "Profile Match";
  const accessibleLabel =
    fit.status === "loaded"
      ? `Profile match ${score} percent for ${jobTitle}. Open fit breakdown.`
      : `${label} for ${jobTitle}. Open fit breakdown.`;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={accessibleLabel}
      aria-busy={fit.status === "loading"}
      title={
        fit.status === "error"
          ? "Fit score unavailable. Open the fit map to retry."
          : "Open your profile match breakdown"
      }
      className="flex min-w-[60px] flex-col items-center rounded-xl px-1 py-1 text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:min-w-[72px] sm:px-1.5"
    >
      <span className="relative flex h-12 w-12 items-center justify-center sm:h-14 sm:w-14">
        <svg
          viewBox="0 0 56 56"
          className="-rotate-90"
          role="img"
          aria-hidden="true"
        >
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
            className={fit.status === "loading" ? "animate-pulse" : ""}
          />
        </svg>
        <span className="absolute text-[10px] font-black text-slate-800 sm:text-[11px]">
          {score === null ? (fit.status === "error" ? "—" : "…") : `${score}%`}
        </span>
      </span>
      <span
        className={`mt-1 text-[9px] font-semibold leading-tight sm:text-[10px] ${
          fit.status === "error" ? "text-rose-600" : "text-slate-500"
        }`}
      >
        {label}
      </span>
    </button>
  );
}
