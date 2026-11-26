"use client";

import { useEffect, useState } from "react";
import api from "../../lib/apiClient";
import MatchScoreRing from "./MatchScoreRing";

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
      <MatchScoreRing
        score={score}
        loading={fit.status === "loading"}
        error={fit.status === "error"}
      />
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
