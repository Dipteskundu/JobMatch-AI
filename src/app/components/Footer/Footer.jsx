"use client";

import Link from "next/link";
import {
  Rocket,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Mail,
} from "lucide-react";
import { useAuth } from "../../lib/AuthContext";

export default function Footer() {
  const { user, claims } = useAuth();
  const isAdmin =
    (claims && claims.role === "admin") ||
    user?.role === "admin" ||
    (user && user.email === "admin@manager.com");
  return (
    <footer className="bg-slate-50 border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-black text-slate-900 tracking-tight">
                SkillMatch<span className="text-indigo-600">AI</span>
              </span>
            </Link>
            <p className="text-slate-500 text-[15px] leading-relaxed max-w-xs">
              Empowering the next generation of talent through AI-powered skill
              matching and career acceleration.
            </p>
            <div className="flex gap-4">
              {[Twitter, Linkedin, Facebook, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {!isAdmin ? (
            <div>
              <h4 className="text-slate-900 font-bold mb-6">For Candidates</h4>
              <ul className="space-y-4">
                {[
                  { name: "Browse Jobs", href: "/jobs" },
                  { name: "Skill Assessments", href: "#" },
                  { name: "About Us", href: "/about" },
                  { name: "Testimonials", href: "#" },
                ].map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-slate-500 hover:text-indigo-600 text-[15px] transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div>
              <h4 className="text-slate-900 font-bold mb-6">Admin</h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/dashboard"
                    className="text-slate-500 hover:text-indigo-600 text-[15px] transition-colors"
                  >
                    Admin Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="text-slate-500 hover:text-indigo-600 text-[15px] transition-colors"
                  >
                    Manage Jobs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/companies"
                    className="text-slate-500 hover:text-indigo-600 text-[15px] transition-colors"
                  >
                    Companies
                  </Link>
                </li>
              </ul>
            </div>
          )}

          <div>
            <h4 className="text-slate-900 font-bold mb-6">For Employers</h4>
            <ul className="space-y-4">
              {[
                "Post a Job",
                "Talent Search",
                "Hiring Solutions",
                "Pricing Plans",
                "Success Stories",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-slate-500 hover:text-indigo-600 text-[15px] transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 font-bold mb-6">Newsletter</h4>
            <p className="text-slate-500 text-[15px] mb-6">
              Get the latest job updates and career tips.
            </p>
            <form className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <button className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} SkillMatch AI. All rights reserved.
          </p>
          <div className="flex gap-8">
            <Link
              href="/privacy"
              className="text-slate-400 hover:text-slate-600 text-sm"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-slate-400 hover:text-slate-600 text-sm"
            >
              Terms of Service
            </Link>
            <Link
              href="/cookies"
              className="text-slate-400 hover:text-slate-600 text-sm"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
