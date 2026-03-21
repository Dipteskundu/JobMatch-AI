"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  Briefcase,
  Building2,
  ChevronRight,
  FileText,
  LayoutDashboard,
  MessageCircle,
  Send,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { useAuth } from "../../lib/AuthContext";
import { API_BASE } from "../../lib/apiClient";
import {
  assistantPrompts,
  assistantQuickActions,
  assistantQuickActionsByRole,
  determineRole,
} from "../../lib/siteNavigation";

const actionIconMap = {
  "/jobs": Briefcase,
  "/resume": FileText,
  "/skill-gap-detection": Sparkles,
  "/skill-test": Sparkles,
  "/dashboard": LayoutDashboard,
  "/companies": Building2,
  "/profile": UserRound,
};

const defaultReply = {
  text: "I can help you move around SkillMatch AI. Ask about jobs, resume upload, tests, dashboard, companies, or profile settings.",
  actions: assistantQuickActions.slice(0, 4),
};

function getFallbackReply(input) {
  const normalizedInput = String(input || "").toLowerCase();

  if (
    normalizedInput.includes("hello") ||
    normalizedInput.includes("hi") ||
    normalizedInput.includes("hey")
  ) {
    return {
      text: "Hey! I can help with jobs, resume upload, recruiter actions, and platform navigation. What do you want to do first?",
      actions: assistantQuickActions.slice(0, 4),
    };
  }

  if (
    normalizedInput.includes("how are you") ||
    normalizedInput.includes("how r u") ||
    normalizedInput.includes("how you")
  ) {
    return {
      text: "I’m good and ready to help. Ask me about finding jobs, skill-gap checks, profile updates, or recruiter workflows.",
      actions: assistantQuickActions.slice(0, 4),
    };
  }

  if (normalizedInput.includes("thank") || normalizedInput.includes("thanks")) {
    return {
      text: "You’re welcome. I can guide your next action step-by-step.",
      actions: assistantQuickActions.slice(0, 3),
    };
  }

  if (
    normalizedInput.includes("job") ||
    normalizedInput.includes("role") ||
    normalizedInput.includes("search")
  ) {
    return {
      text: "Start from the jobs page to browse openings and compare role requirements.",
      actions: assistantQuickActions.filter((action) =>
        ["/jobs", "/skill-gap-detection"].includes(action.href),
      ),
    };
  }

  if (
    normalizedInput.includes("resume") ||
    normalizedInput.includes("cv") ||
    normalizedInput.includes("upload")
  ) {
    return {
      text: "Use the resume page to upload your file, then continue to skill-gap detection for a role-focused plan.",
      actions: assistantQuickActions.filter((action) =>
        ["/resume", "/skill-gap-detection", "/profile"].includes(action.href),
      ),
    };
  }

  if (
    normalizedInput.includes("test") ||
    normalizedInput.includes("assessment") ||
    normalizedInput.includes("prepare")
  ) {
    return {
      text: "Use skill test to evaluate your current level, then check skill-gap detection for what to improve next.",
      actions: assistantQuickActions.filter((action) =>
        ["/skill-test", "/skill-gap-detection", "/dashboard"].includes(
          action.href,
        ),
      ),
    };
  }

  if (
    normalizedInput.includes("company") ||
    normalizedInput.includes("employer") ||
    normalizedInput.includes("recruiter")
  ) {
    return {
      text: "You can browse companies or jump into dashboard workflows for hiring and candidate activity.",
      actions: assistantQuickActions.filter((action) =>
        ["/companies", "/dashboard", "/jobs"].includes(action.href),
      ),
    };
  }

  if (
    normalizedInput.includes("profile") ||
    normalizedInput.includes("account") ||
    normalizedInput.includes("dashboard")
  ) {
    return {
      text: "Your profile manages account details while dashboard is the main hub for activity and progress.",
      actions: assistantQuickActions.filter((action) =>
        ["/profile", "/dashboard"].includes(action.href),
      ),
    };
  }

  return defaultReply;
}

export default function Chatbot() {
  const router = useRouter();
  const { user } = useAuth();
  const role = determineRole(user);
  const roleActions =
    assistantQuickActionsByRole[role] || assistantQuickActionsByRole.guest;

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isResponding, setIsResponding] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      text: "Hi, I’m SkillMatch AI assistant. I can answer quick questions and take you to the right page anywhere in the app.",
      actions: assistantQuickActions.slice(0, 3),
    },
  ]);

  const scrollRef = useRef(null);
  const messageIdRef = useRef(1);

  useEffect(() => {
    setMessages((current) => {
      if (!current.length || current[0].id !== "welcome") {
        return current;
      }
      const next = [...current];
      next[0] = { ...next[0], actions: roleActions.slice(0, 3) };
      return next;
    });
  }, [roleActions]);

  useEffect(() => {
    if (!open || !scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  const askAssistantApi = useCallback(async (prompt) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch(`/api/assistant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
        signal: controller.signal,
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          payload?.error || payload?.message || "Assistant request failed",
        );
      }

      const assistantText = String(payload?.assistant || "").trim();
      if (!assistantText) {
        throw new Error("Assistant returned empty answer");
      }

      return assistantText;
    } finally {
      clearTimeout(timeoutId);
    }
  }, []);

  const submitPrompt = useCallback(
    async (rawPrompt) => {
      const prompt = String(rawPrompt || "").trim();
      if (!prompt || isResponding) return;

      const nextId = messageIdRef.current++;
      setMessages((current) => [
        ...current,
        { id: `${nextId}-user`, role: "user", text: prompt },
      ]);
      setInput("");
      setOpen(true);
      setIsResponding(true);

      try {
        const assistantText = await askAssistantApi(prompt);
        setMessages((current) => [
          ...current,
          {
            id: `${nextId}-assistant`,
            role: "assistant",
            text: assistantText,
            actions: roleActions,
          },
        ]);
      } catch {
        const fallback = getFallbackReply(prompt);
        setMessages((current) => [
          ...current,
          {
            id: `${nextId}-assistant`,
            role: "assistant",
            text: `${fallback.text}\n\n(Using fallback mode right now — check server AI key config for best answers.)`,
            actions: fallback.actions || roleActions,
          },
        ]);
      } finally {
        setIsResponding(false);
      }
    },
    [askAssistantApi, isResponding, roleActions],
  );

  useEffect(() => {
    function handleAssistantOpen(event) {
      setOpen(true);
      const prompt = String(event.detail?.prompt || "").trim();
      if (!prompt) return;
      submitPrompt(prompt);
    }

    window.addEventListener("skillmatch:assistant-open", handleAssistantOpen);
    return () => {
      window.removeEventListener(
        "skillmatch:assistant-open",
        handleAssistantOpen,
      );
    };
  }, [submitPrompt]);

  const visibleQuickPrompts = useMemo(() => assistantPrompts.slice(0, 4), []);

  const handleActionClick = (href) => {
    router.push(href);
    setOpen(false);
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-end px-4 pb-3 sm:px-6 sm:pb-4">
      <div className="pointer-events-auto flex max-w-md flex-col items-end gap-3">
        {open && (
          <section
            className="relative flex w-[min(95vw,26rem)] max-w-full flex-col overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/80 shadow-[0_40px_120px_-30px_rgba(15,23,42,0.45)] ring-1 ring-slate-200/80 backdrop-blur-xl animate-float-in"
            style={{ maxHeight: "calc(100dvh - 7rem)" }}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-indigo-100/70 via-fuchsia-50/60 to-transparent" />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 z-10 rounded-full border border-white/90 bg-white/85 p-2 text-slate-500 shadow-sm transition-all hover:text-slate-700"
              aria-label="Close assistant"
            >
              <X className="h-4 w-4" />
            </button>

            <div
              ref={scrollRef}
              className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-4 pt-12"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-3xl px-4 py-3.5 shadow-sm backdrop-blur ${
                      message.role === "assistant"
                        ? "border border-slate-200/70 bg-white/90 text-slate-800"
                        : "bg-linear-to-br from-slate-900 via-indigo-700 to-indigo-600 text-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {message.role === "assistant" && (
                        <span className="mt-0.5 rounded-full border border-indigo-100 bg-linear-to-br from-indigo-50 to-white p-1.5 text-indigo-600">
                          <Bot className="h-4 w-4" />
                        </span>
                      )}

                      <div className="space-y-3">
                        <p className="text-sm leading-6 whitespace-pre-line">
                          {message.text}
                        </p>
                        {message.actions?.length ? (
                          <div className="space-y-2">
                            {message.actions.map((action) => {
                              const Icon =
                                actionIconMap[action.href] || ChevronRight;

                              return (
                                <button
                                  key={`${message.id}-${action.href}`}
                                  type="button"
                                  onClick={() => handleActionClick(action.href)}
                                  className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 px-3 py-2 text-left text-slate-700 shadow-[0_8px_24px_-16px_rgba(15,23,42,0.45)] transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50/60 hover:text-indigo-700"
                                >
                                  <span className="flex items-center gap-3">
                                    <span className="rounded-xl border border-slate-200 bg-slate-50/90 p-2 text-slate-700">
                                      <Icon className="h-4 w-4" />
                                    </span>
                                    <span>
                                      <span className="block text-sm font-semibold">
                                        {action.label}
                                      </span>
                                      <span className="block text-xs text-slate-500">
                                        {action.description}
                                      </span>
                                    </span>
                                  </span>
                                  <ChevronRight className="h-4 w-4" />
                                </button>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isResponding && (
                <div className="flex justify-start">
                  <div className="max-w-[88%] rounded-3xl border border-slate-200/70 bg-white/90 px-4 py-3.5 text-sm text-slate-600 shadow-sm">
                    Assistant is thinking...
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200/80 bg-white/80 px-4 py-4 backdrop-blur">
              <div className="mb-3 flex flex-wrap gap-2">
                {visibleQuickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => submitPrompt(prompt)}
                    className="rounded-full border border-slate-200/90 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 transition-all hover:border-indigo-200 hover:bg-indigo-50/80 hover:text-indigo-700"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  submitPrompt(input);
                }}
                className="flex items-center gap-2 rounded-[1.25rem] border border-slate-200/90 bg-white/85 p-2 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.45)] focus-within:border-indigo-300 focus-within:bg-white"
              >
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask where to go, what to use, or what to do next"
                  disabled={isResponding}
                  className="min-w-0 flex-1 bg-transparent px-2 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={isResponding}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm transition-all hover:scale-105 hover:bg-indigo-700 disabled:opacity-70"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </section>
        )}

        <button
          type="button"
          onClick={() => setOpen((currentState) => !currentState)}
          className="group flex items-center gap-3 rounded-full border border-slate-800 bg-slate-950 px-5 py-4 text-white shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl"
          aria-expanded={open}
          aria-label="Open SkillMatch AI assistant"
        >
          <span className="rounded-full border border-white/10 bg-white/10 p-2 text-emerald-300">
            <MessageCircle className="h-5 w-5" />
          </span>
          <span className="text-left">
            <span className="block text-sm font-bold">SkillMatch AI</span>
            <span className="block text-xs text-slate-300 group-hover:text-slate-200">
              Chat and navigate
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}
