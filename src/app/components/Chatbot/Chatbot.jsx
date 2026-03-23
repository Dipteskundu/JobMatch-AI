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
  ChevronDown,
  ArrowRight,
  Compass,
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
      text: "Hello! I'm your SkillMatch AI Assistant. I can help you navigate the platform, find jobs, or answer any questions you have.",
      actions: filteredRoleActions.slice(0, 3),
    },
  ]);

  const scrollRef = useRef(null);
  const messageIdRef = useRef(1);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open || !scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  // Auto-focus input when opening
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [open]);

  const askAssistantApi = useCallback(
    async (prompt) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        const res = await fetch(`${API_BASE}/api/assistant`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            userId: user?.uid,
            userEmail: user?.email,
            userRole: role,
          }),
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
    },
    [user?.uid, user?.email, role],
  );

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
            actions: [],
          },
        ]);
      } catch {
        // Always provide a helpful response even on error
        setMessages((current) => [
          ...current,
          {
            id: `${nextId}-assistant`,
            role: "assistant",
            text: "I'm here to help! I can answer questions about jobs, your applications, interviews, resume tips, or help you navigate the platform. What would you like to know?",
            actions: [],
          },
        ]);
      } finally {
        setIsResponding(false);
      }
    },
    [askAssistantApi, isResponding],
  );

  const visibleQuickPrompts = useMemo(() => assistantPrompts.slice(0, 4), []);

  const handleActionClick = (href) => {
    router.push(href);
    setOpen(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-end px-4 pb-4 sm:px-6 sm:pb-5 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-[400px] flex flex-col items-end gap-3">
        {open && (
          <div className="w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Header - Clean and minimal */}
            <div className="bg-slate-900 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">
                    SkillMatch AI
                  </h3>
                  <p className="text-slate-400 text-xs">Online</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="h-[320px] overflow-y-auto px-4 py-4 space-y-4 bg-slate-50"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-4 py-3 ${
                      message.role === "assistant"
                        ? "bg-white border border-slate-200 text-slate-800"
                        : "bg-indigo-600 text-white"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="w-4 h-4 text-indigo-500" />
                        <span className="text-xs font-medium text-slate-500">
                          AI Assistant
                        </span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed">{message.text}</p>

                    {message.actions?.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.actions.slice(0, 2).map((action) => (
                          <button
                            key={action.href}
                            onClick={() => handleActionClick(action.href)}
                            className="w-full flex items-center justify-between px-3 py-2 bg-slate-100 hover:bg-indigo-50 rounded-lg text-left transition-colors group"
                          >
                            <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-700">
                              {action.label}
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isResponding && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
                    </div>
                    <span className="text-sm text-slate-500">Typing...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="bg-white border-t border-slate-200 p-4">
              <div className="flex flex-wrap gap-2 mb-3">
                {visibleQuickPrompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => submitPrompt(p)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 rounded-full text-xs font-medium text-slate-600 hover:text-indigo-600 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitPrompt(input);
                }}
                className="flex gap-2"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 bg-slate-100 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isResponding}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-3 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-lg transition-colors"
        >
          <div className="relative">
            {open ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <MessageCircle className="w-5 h-5" />
            )}
            {!open && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-900" />
            )}
          </div>
          <span className="font-medium text-sm">
            {open ? "Close" : "Chat with AI"}
          </span>
        </button>
      </div>
    </div>
  );
}
