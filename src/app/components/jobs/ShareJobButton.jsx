"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";

export default function ShareJobButton({ job }) {
  const [feedback, setFeedback] = useState("");
  const jobTitle = job.title || "Job opportunity";

  const handleShare = async () => {
    setFeedback("");
    const url = new URL(`/jobs/${job._id}`, window.location.origin).toString();
    const shareData = {
      title: jobTitle,
      text: job.company ? `${jobTitle} at ${job.company}` : jobTitle,
      url,
    };

    if (typeof navigator.share === "function") {
      try {
        await navigator.share(shareData);
        setFeedback("Shared");
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
      }
    }

    if (typeof navigator.clipboard?.writeText !== "function") {
      setFeedback("Sharing is unavailable");
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setFeedback("Link copied");
    } catch {
      setFeedback("Could not copy link");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleShare}
        aria-label={`Share ${jobTitle}`}
        title="Share this job"
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold not-italic text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <Share2 className="h-3.5 w-3.5" />
        Share
      </button>
      {feedback && (
        <span className="text-[11px] font-medium text-slate-500" role="status">
          {feedback}
        </span>
      )}
    </>
  );
}
