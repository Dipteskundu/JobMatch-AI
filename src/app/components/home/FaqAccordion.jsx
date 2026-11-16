"use client";

/**
 * FAQ accordion — answers the top trust questions visitors have before
 * signing up. Single-open behavior with animated expand/collapse.
 */
import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useScrollReveal } from "../../lib/useScrollReveal";

const FAQS = [
  {
    q: "Is my resume or data ever sold?",
    a: "Never. Your resume and profile data are used only to match you with jobs on the platform. You control your profile, and recruiters only ever see the information their role requires.",
    link: { label: "Read the privacy policy", href: "/privacy" },
  },
  {
    q: "Who can see my fit score and test results?",
    a: "Only recruiters with open roles you applied to (and platform admins for quality checks). Scores are never public, and you can see the exact same breakdown recruiters see — matched, partial and missing skills.",
  },
  {
    q: "How is the fit score calculated?",
    a: "It's an explainable 0–100 number built from five openly weighted factors: skill match (45%), assessment performance (25%), relevant experience (15%), education (10%) and additional role factors (5%). Nothing is a black box — every score comes with its breakdown.",
    link: { label: "Try the interactive score checker", href: "#try-it" },
  },
  {
    q: "Do recruiters pay to shortlist me?",
    a: "No. Recruiters never pay to shortlist, message, or hire you. The AI ranks candidates to assist review — but every shortlist, interview and hiring decision is made by a human recruiter.",
  },
  {
    q: "Can the AI reject or auto-hire me?",
    a: "Never. The platform is decision support, not decision authority. The AI only ranks and explains — nothing is auto-rejected or auto-hired, and all scoring configurations are logged and auditable.",
  },
  {
    q: "What do I need before applying to a job?",
    a: "One quick step: complete a skill verification for your target role. It protects everyone — recruiters trust verified profiles, and your applications rank higher because of it.",
    link: { label: "See how verification works", href: "/verification/skill-intro" },
  },
  {
    q: "Can I delete my account and data?",
    a: "Yes. You can request deletion of your profile and associated data at any time, and we honor those requests. Job posts follow a separate admin-reviewed deletion flow.",
    link: { label: "Contact us or read terms", href: "/terms" },
  },
];

export default function FaqAccordion() {
  const [open, setOpen] = useState(0);
  const revealRef = useScrollReveal({ stagger: 70 });

  return (
    <section ref={revealRef} className="py-20 sm:py-28 bg-white" aria-label="Frequently asked questions">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12 reveal">
          <p className="text-[10px] font-black tracking-[0.3em] text-indigo-500 uppercase mb-3">Straight answers</p>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Questions everyone asks first</h2>
          <p className="text-slate-500 mt-3 text-base">
            The things you should know before trusting any hiring platform — answered plainly.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className="reveal">
                <div
                  className={`bg-white border rounded-2xl overflow-hidden transition-colors ${isOpen ? "border-indigo-200 shadow-md shadow-indigo-100/40" : "border-slate-200 hover:border-indigo-100"}`}
                >
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4 text-left"
                >
                  <span className={`text-sm sm:text-base font-black transition-colors ${isOpen ? "text-indigo-700" : "text-slate-900"}`}>
                    {item.q}
                  </span>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${isOpen ? "bg-indigo-600 text-white rotate-180" : "bg-slate-100 text-slate-400"}`}>
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>
                <div
                  className="grid transition-all duration-300 ease-in-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 sm:px-6 pb-5">
                      <p className="text-sm text-slate-500 leading-relaxed">{item.a}</p>
                      {item.link && (
                        <Link
                          href={item.link.href}
                          className="mt-3 inline-flex items-center gap-1 text-xs font-black text-indigo-600 hover:text-indigo-700 hover:underline"
                        >
                          {item.link.label} →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
