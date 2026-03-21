"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Send,
  Mail,
  Phone,
  Globe,
  Award,
  BookOpen,
  Briefcase,
  User,
  CheckCircle,
} from "lucide-react";
import { Skills } from "../lib/CandidateData";
import CareerPath from "../components/profile/candidate/CareerPath";
import FeaturedWorks from "../components/profile/candidate/FeaturedWorks";
import CompanyDetails from "../components/profile/recruiter/CompanyDetails";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import { useAuth } from "../lib/AuthContext";
import Avatar from "../components/common/Avatar";
import PageWrapper from "../components/common/PageWrapper";
import { API_BASE } from "../lib/apiClient";
import apiClient from "../lib/apiClient";

const Page = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const apiBase = API_BASE;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/signin");
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchProfile = useCallback(async () => {
    // Local admin has no backend profile — use inline data
    if (user?.isLocalAdmin) {
      setProfile({
        role: "admin",
        displayName: "Admin",
        email: "admin@admin.com",
        title: "Platform Administrator",
        location: "Platform HQ",
        bio: "Full-access platform administrator. Manages users, job posts, and platform health.",
      });
      setLoading(false);
      return;
    }
    try {
      const { data: json } = await apiClient.get(`/api/auth/profile/${user.uid}`);
      if (json.success) {
        setProfile(json.data);
      }
    } catch (err) {
      if (err.message !== "User not found") {
        console.error("Error fetching profile:", err);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.uid, user?.isLocalAdmin, apiBase]);

  useEffect(() => {
    if (user?.uid) {
      fetchProfile();
    }
  }, [user?.uid, fetchProfile]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const role = profile?.role || "candidate";
  const displayName = profile?.displayName || user?.displayName || "User";
  const title =
    profile?.title ||
    (role === "recruiter"
      ? "Recruiter"
      : role === "admin"
        ? "Administrator"
        : "Professional");
  const location = profile?.location || "Location not set";
  const bio = profile?.bio || "No professional summary provided yet.";
  const skills = Array.isArray(profile?.skills) ? profile.skills : Skills; // Fallback to CandidateData skills if none in DB

  return (
    <div className="min-h-screen bg-[#fdfdfe]">
      <Navbar />

      <main className="pt-32 pb-24">
        <PageWrapper>
          <div className="container mx-auto px-6 lg:px-24">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Left Column: Profile Card */}
              <div className="lg:col-span-1 reveal">
                <div className="bg-white rounded-[2.5rem] border border-slate-100 premium-shadow p-8 lg:sticky lg:top-32">
                  <div className="flex flex-col items-center text-center space-y-6">
                    {/* Profile Image with Rank */}
                    <div className="relative p-1.5 bg-gradient-to-tr from-indigo-500 via-purple-500 to-indigo-600 rounded-full shadow-lg">
                      <Avatar
                        src={profile?.photoURL || user?.photoURL}
                        alt={displayName}
                        size="w-32 h-32"
                        className="border-4 border-white"
                      />
                      {role === "admin" && (
                        <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full border-2 border-white shadow-sm uppercase tracking-tighter">
                          ADMIN
                        </span>
                      )}
                      {role === "candidate" && (
                        <span className="absolute -bottom-1 -right-1 bg-indigo-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full border-2 border-white shadow-sm uppercase tracking-tighter">
                          PRO
                        </span>
                      )}
                    </div>

                    <div>
                      <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        {displayName}
                      </h1>
                      <p className="text-indigo-600 font-bold mt-1 uppercase tracking-wider text-xs">
                        {title}
                      </p>
                    </div>

                    <div className="flex flex-col items-center gap-3 w-full pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>{location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span>{profile?.email || user?.email}</span>
                      </div>
                      {profile?.phone && (
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span>{profile.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-4 w-full pt-4">
                      <Link
                        href="/profile/edit"
                        className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3.5 rounded-2xl premium-shadow hover:bg-slate-800 transition-all active:scale-95"
                      >
                        <Send className="w-4 h-4" />
                        Edit Profile
                      </Link>
                      <button className="p-3.5 bg-white border border-slate-200 text-slate-900 rounded-2xl hover:bg-slate-50 transition-colors">
                        <Globe className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Content */}
              <div className="lg:col-span-2 space-y-12 reveal delay-150">
                {/* Conditional Content Based on Role */}
                {role === "admin" ? (
                  <AdminProfileView profile={profile} />
                ) : role === "candidate" ? (
                  <>
                    {/* Professional Brief */}
                    <section className="bg-white rounded-[2rem] border border-slate-100 premium-shadow p-10 space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-50 rounded-xl">
                          <Award className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">
                          Professional Summary
                        </h2>
                      </div>
                      <p className="text-slate-600 text-lg leading-relaxed font-sans whitespace-pre-line">
                        {bio}
                      </p>
                    </section>

                    {/* Skills Grid */}
                    <section className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-50 rounded-xl">
                          <Briefcase className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">
                          Core Expertise
                        </h2>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-5 py-2.5 bg-white border border-slate-100 rounded-2xl text-[15px] font-bold text-slate-700 premium-shadow hover:border-indigo-200 transition-all cursor-default"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </section>

                    {/* Career Path Component */}
                    {profile?.experience && profile.experience.length > 0 ? (
                      <section className="pt-4">
                        <div className="flex items-center gap-3 mb-8">
                          <div className="p-2.5 bg-indigo-50 rounded-xl">
                            <Briefcase className="w-6 h-6 text-indigo-600" />
                          </div>
                          <h2 className="text-2xl font-bold text-slate-900">
                            Work Experience
                          </h2>
                        </div>
                        <div className="bg-white rounded-[2rem] border border-slate-100 premium-shadow p-10">
                          <div className="border-l-2 border-indigo-100 ml-3 pl-8 space-y-10 relative">
                            {profile.experience.map((exp, index) => (
                              <div key={index} className="relative">
                                <div className="absolute -left-[37px] top-1 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white shadow-sm shadow-indigo-200" />
                                <h3 className="text-xl font-bold text-slate-900">
                                  {exp.position}
                                </h3>
                                <p className="text-indigo-600 font-bold text-sm">
                                  {exp.company} • {exp.startDate} -{" "}
                                  {exp.endDate}
                                </p>
                                {exp.description && (
                                  <p className="mt-3 text-slate-500 leading-relaxed">
                                    {exp.description}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </section>
                    ) : (
                      <section className="pt-4">
                        <div className="flex items-center gap-3 mb-8">
                          <div className="p-2.5 bg-indigo-50 rounded-xl">
                            <TrendingUpIcon className="w-6 h-6 text-indigo-600" />
                          </div>
                          <h2 className="text-2xl font-bold text-slate-900">
                            Career Journey
                          </h2>
                        </div>
                        <CareerPath />
                      </section>
                    )}

                    {/* Featured Works Component */}
                    {profile?.projects && profile.projects.length > 0 ? (
                      <section className="space-y-8">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-indigo-50 rounded-xl">
                            <Globe className="w-6 h-6 text-indigo-600" />
                          </div>
                          <h2 className="text-2xl font-bold text-slate-900">
                            Featured Projects
                          </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {profile.projects.map((project, index) => (
                            <div
                              key={index}
                              className="bg-white rounded-[2rem] border border-slate-100 premium-shadow p-8 hover:shadow-xl transition-all"
                            >
                              <h3 className="text-xl font-bold text-slate-900 mb-3">
                                {project.name}
                              </h3>
                              <p className="text-slate-600 mb-4 leading-relaxed">
                                {project.description}
                              </p>
                              {project.technologies && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {project.technologies
                                    .split(",")
                                    .map((tech, i) => (
                                      <span
                                        key={i}
                                        className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold"
                                      >
                                        {tech.trim()}
                                      </span>
                                    ))}
                                </div>
                              )}
                              {/* Location & Links */}
                              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-6 text-sm font-medium">
                                {profile.location && (
                                  <span className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl text-indigo-50 backdrop-blur-md">
                                    <MapPin className="w-4 h-4 text-indigo-300" />{" "}
                                    {profile.location}
                                  </span>
                                )}
                                {profile.isSkillVerified && (
                                  <span className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-100 rounded-xl font-bold border border-emerald-400/30 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                    <CheckCircle className="w-4 h-4 text-emerald-400" />{" "}
                                    Skill Verified
                                  </span>
                                )}
                              </div>
                              {project.link && (
                                <a
                                  href={project.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:underline"
                                >
                                  View Project <Globe className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </section>
                    ) : (
                      <section className="space-y-8">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-indigo-50 rounded-xl">
                            <Globe className="w-6 h-6 text-indigo-600" />
                          </div>
                          <h2 className="text-2xl font-bold text-slate-900">
                            Featured Projects
                          </h2>
                        </div>
                        <FeaturedWorks />
                      </section>
                    )}

                    {/* Education Section */}
                    {profile?.education && profile.education.length > 0 ? (
                      <section className="space-y-8 bg-white rounded-[2rem] border border-slate-100 premium-shadow p-10">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-indigo-50 rounded-xl">
                            <BookOpen className="w-6 h-6 text-indigo-600" />
                          </div>
                          <h2 className="text-2xl font-bold text-slate-900">
                            Education
                          </h2>
                        </div>
                        <div className="border-l-2 border-indigo-100 ml-3 pl-8 space-y-10 relative">
                          {profile.education.map((edu, index) => (
                            <div key={index} className="relative">
                              <div className="absolute -left-[37px] top-1 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white shadow-sm shadow-indigo-200" />
                              <h3 className="text-xl font-bold text-slate-900">
                                {edu.degree} {edu.field && `in ${edu.field}`}
                              </h3>
                              <p className="text-indigo-600 font-bold text-sm">
                                {edu.school} • {edu.startDate}
                              </p>
                              {edu.description && (
                                <p className="mt-3 text-slate-500 leading-relaxed italic">
                                  {edu.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </section>
                    ) : (
                      <section className="space-y-8 bg-white rounded-[2rem] border border-slate-100 premium-shadow p-10">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-indigo-50 rounded-xl">
                            <BookOpen className="w-6 h-6 text-indigo-600" />
                          </div>
                          <h2 className="text-2xl font-bold text-slate-900">
                            Education
                          </h2>
                        </div>
                        <div className="border-l-2 border-indigo-100 ml-3 pl-8 space-y-10 relative">
                          <div className="relative">
                            <div className="absolute -left-[37px] top-1 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white shadow-sm shadow-indigo-200" />
                            <h3 className="text-xl font-bold text-slate-900">
                              Master of Computer Science
                            </h3>
                            <p className="text-indigo-600 font-bold text-sm">
                              Stanford University • 2012 - 2014
                            </p>
                            <p className="mt-3 text-slate-500 leading-relaxed italic">
                              Specialized in Artificial Intelligence and
                              Distributed Systems. Graduated with honors.
                            </p>
                          </div>
                        </div>
                      </section>
                    )}
                  </>
                ) : (
                  <div className="bg-white rounded-[2rem] border border-slate-100 premium-shadow p-10">
                    <CompanyDetails />
                  </div>
                )}
              </div>
            </div>
          </div>
        </PageWrapper>
      </main>

      <Footer />
    </div>
  );
};

function AdminProfileView({ profile }) {
  return (
    <div className="space-y-8">
      <section className="bg-white rounded-[2rem] border border-slate-100 premium-shadow p-10 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 rounded-xl">
            <User className="w-6 h-6 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Admin Summary</h2>
        </div>
        <p className="text-slate-600 text-lg leading-relaxed">{profile?.bio}</p>
      </section>

      <section className="bg-white rounded-[2rem] border border-slate-100 premium-shadow p-10 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 rounded-xl">
            <Award className="w-6 h-6 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            Admin Capabilities
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {[
            "User Management",
            "Ban / Unban Users",
            "Job Post Approval",
            "Fraud Detection",
            "Platform Analytics",
            "Job Request Review",
          ].map((cap) => (
            <span
              key={cap}
              className="px-5 py-2.5 bg-amber-50 border border-amber-100 rounded-2xl text-[15px] font-bold text-amber-800"
            >
              {cap}
            </span>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-[2rem] border border-slate-100 premium-shadow p-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-amber-50 rounded-xl">
            <CheckCircle className="w-6 h-6 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Quick Links</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Go to Dashboard", href: "/dashboard" },
            { label: "Edit Profile", href: "/profile/edit" },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center justify-center py-3.5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

// Simple helper icon
function TrendingUpIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
      />
    </svg>
  );
}

export default Page;
