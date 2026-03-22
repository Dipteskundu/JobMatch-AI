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

export default function Chatbot() {
  const router = useRouter();
  const { user, claims } = useAuth();
  const role = determineRole(user);
  const roleActions =
    assistantQuickActionsByRole[role] || assistantQuickActionsByRole.guest;

  const isAdmin =
    (claims && claims.role === "admin") ||
    user?.role === "admin" ||
    (user && user.email === "admin@manager.com");

  const filteredRoleActions = isAdmin
    ? roleActions.filter(
        (a) =>
          !["/resume", "/skill-gap-detection", "/applications"].includes(
            a.href,
          ),
      )
    : roleActions;

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isResponding, setIsResponding] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      text: "Hi, I’m SkillMatch AI assistant. I can answer quick questions and take you to the right page.",
      actions: filteredRoleActions.slice(0, 3),
    },
  ]);

  const scrollRef = useRef(null);
  const messageIdRef = useRef(1);

  useEffect(() => {
    if (!open || !scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  const askAssistantApi = useCallback(async (prompt) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
<<<<<<< HEAD
      const response = await fetch(`/api/assistant`, {
=======
      const res = await fetch(`${API_BASE}/api/assistant`, {
>>>>>>> 76c074d (Save changes)
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
        signal: controller.signal,
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(
          payload?.error || payload?.message || "Assistant failed",
        );
      return String(payload?.assistant || "").trim();
    } finally {
      clearTimeout(timeoutId);
    }
  }, []);

  const getFallbackReply = (input) => {
    const normalized = String(input || "").toLowerCase();
    if (normalized.includes("resume") || normalized.includes("upload")) {
      return {
        text: "Use the resume page to upload your file.",
        actions: filteredRoleActions.filter((a) =>
          ["/resume"].includes(a.href),
        ),
      };
    }
    return {
      text: "I can help with navigation and quick actions.",
      actions: filteredRoleActions,
    };
  };

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
        if (!assistantText) throw new Error("empty");
        setMessages((current) => [
          ...current,
          {
            id: `${nextId}-assistant`,
            role: "assistant",
            text: assistantText,
            actions: filteredRoleActions,
          },
        ]);
      } catch {
        const fallback = getFallbackReply(prompt);
        setMessages((current) => [
          ...current,
          {
            id: `${nextId}-assistant`,
            role: "assistant",
            text: `${fallback.text}\n\n(Using fallback.)`,
            actions: fallback.actions || filteredRoleActions,
          },
        ]);
      } finally {
        setIsResponding(false);
      }
    },
    [askAssistantApi, isResponding, filteredRoleActions],
  );

  const visibleQuickPrompts = useMemo(() => assistantPrompts.slice(0, 4), []);

  const handleActionClick = (href) => {
    router.push(href);
    setOpen(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-end px-4 pb-3 sm:px-6 sm:pb-4 pointer-events-none">
      <div className="pointer-events-auto max-w-md w-full flex flex-col items-end gap-3">
        {open && (
          <div className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-slate-900/5 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-800">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-indigo-50 p-2 text-indigo-600">
                  <Bot className="w-5 h-5" />
                </span>
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    SkillMatch Assistant
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-300">
                    Ask for help or quick navigation
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setOpen(false);
                  }}
                  aria-label="Close chat"
                  className="rounded-md p-2 text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  ✕
                </button>
              </div>
            </div>

            <div
              ref={scrollRef}
              className="p-4 max-h-80 overflow-y-auto space-y-4 bg-white dark:bg-transparent"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 shadow ${message.role === "assistant" ? "bg-indigo-50 text-slate-900 border border-indigo-100 dark:bg-indigo-900/20 dark:text-slate-100 dark:border-indigo-800" : "bg-slate-900 text-white"}`}
                  >
                    <div className="flex items-start gap-3">
                      {message.role === "assistant" ? (
                        <span className="mt-0.5 rounded-full bg-white/60 p-1.5 text-indigo-600">
                          <Bot className="h-4 w-4" />
                        </span>
                      ) : (
                        <span className="mt-0.5 rounded-full bg-indigo-600 p-1 text-white">
                          <UserRound className="h-4 w-4" />
                        </span>
                      )}
                      <div className="space-y-2">
                        <p className="text-sm leading-6 whitespace-pre-line text-slate-900 dark:text-slate-100">
                          {message.text}
                        </p>
                        {message.actions?.length ? (
                          <div className="grid grid-cols-1 gap-2">
                            {message.actions.map((action) => {
                              const Icon =
                                actionIconMap[action.href] || ChevronRight;
                              return (
                                <button
                                  key={`${message.id}-${action.href}`}
                                  onClick={() => handleActionClick(action.href)}
                                  className="flex items-center gap-3 rounded-lg border border-slate-100 bg-white dark:bg-slate-700 px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                >
                                  <span className="flex items-center gap-3">
                                    <span className="rounded-md bg-indigo-50 dark:bg-indigo-900/30 p-2 text-indigo-600 dark:text-indigo-200">
                                      <Icon className="h-4 w-4" />
                                    </span>
                                    <div>
                                      <div className="font-semibold">
                                        {action.label}
                                      </div>
                                      <div className="text-xs text-slate-500 dark:text-slate-300">
                                        {action.description}
                                      </div>
                                    </div>
                                  </span>
                                  <ChevronRight className="ml-auto h-4 w-4 text-slate-300" />
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
                  <div className="max-w-[88%] rounded-3xl border border-slate-200/70 bg-white/90 dark:bg-slate-700/80 px-4 py-3.5 text-sm text-slate-700 dark:text-slate-200 shadow-sm">
                    Assistant is thinking...
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 bg-white px-4 py-4">
              <div className="mb-3 flex flex-wrap gap-2">
                {visibleQuickPrompts.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => submitPrompt(p)}
                    className="flex items-center gap-2 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-900 dark:bg-indigo-900/30 dark:text-indigo-200 px-3 py-2 text-xs font-semibold hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  >
                    <Bot className="w-3 h-3" />
                    {p}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitPrompt(input);
                }}
                className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me to navigate or find help..."
                  aria-label="Chat input"
                  className="flex-1 bg-transparent outline-none text-sm text-slate-700 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 px-2 py-2"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isResponding}
                  className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-3 py-2 text-white text-sm font-semibold disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen((s) => !s)}
          className="group flex items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 text-slate-900 shadow-xl dark:border-slate-800 dark:bg-slate-950 dark:text-white"
        >
          <span className="rounded-full border border-white/10 bg-white/10 p-2 text-emerald-300">
            <MessageCircle className="h-5 w-5" />
          </span>
          <span className="text-left">
            <span className="block text-sm font-bold">SkillMatch AI</span>
            <span className="block text-xs text-slate-300">
              Chat and navigate
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}
