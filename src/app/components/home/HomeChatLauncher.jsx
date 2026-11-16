"use client";

/**
 * "Meet the AI" launcher — lets visitors talk to the platform assistant
 * straight from the home page. The floating Chatbot (mounted globally in
 * layout.js) already listens for the `skillmatch:assistant-open` window
 * event and works for guests via the public ask endpoint — we just
 * dispatch it with a starter question.
 */
import { MessageCircleQuestion, Sparkles } from "lucide-react";
import { useScrollReveal } from "../../lib/useScrollReveal";

const STARTERS = [
  "What can I do on JobMatch?",
  "How does the fit score work?",
  "How do I apply for a job?",
];

export default function HomeChatLauncher() {
  const revealRef = useScrollReveal({ stagger: 100 });

  const openChat = (prompt) => {
    window.dispatchEvent(
      new CustomEvent("skillmatch:assistant-open", { detail: { prompt } })
    );
  };

  return (
    <section ref={revealRef} className="py-16 sm:py-20 bg-slate-50 border-y border-slate-100" aria-label="Meet the AI assistant">
      <div className="max-w-4xl mx-auto px-6 text-center reveal">
        <p className="text-[10px] font-black tracking-[0.3em] text-indigo-500 uppercase mb-3">Meet the AI</p>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
          Ask the assistant anything — no account needed
        </h2>
        <p className="text-slate-500 mt-3 text-base max-w-xl mx-auto">
          Our AI assistant works for guests too. Tap a question below and the chat
          opens with your answer ready.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row flex-wrap justify-center gap-3">
          {STARTERS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => openChat(prompt)}
              className="inline-flex items-center gap-2.5 bg-white border border-slate-200 rounded-full px-5 py-3 text-sm font-bold text-slate-700 hover:border-indigo-300 hover:text-indigo-700 hover:shadow-md hover:shadow-indigo-100/60 transition-all btn-press"
            >
              <MessageCircleQuestion className="w-4 h-4 text-indigo-500 shrink-0" />
              {prompt}
            </button>
          ))}
        </div>

        <p className="mt-6 inline-flex items-center gap-1.5 text-xs text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Sign in to unlock personal answers about your applications and learning plans.
        </p>
      </div>
    </section>
  );
}
