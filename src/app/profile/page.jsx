"use client";

import React from "react";
import Link from "next/link";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import Avatar from "../components/common/Avatar";
import PageWrapper from "../components/common/PageWrapper";
import { useAuth } from "../lib/AuthContext";
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Github,
  Linkedin,
  Globe,
  Edit,
  Calendar,
  User,
} from "lucide-react";

export default function ProfilePage() {
  const { user, isAuthenticated, loading, dbUser } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-slate-700">Please sign in to view your profile.</p>
      </div>
    );
  }

  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const profile = dbUser || {};

  const profileCompletion = Math.round(
    ([
      profile.displayName ? 8 : 0,
      profile.photoURL ? 8 : 0,
      profile.title ? 8 : 0,
      profile.location ? 4 : 0,
      profile.phone ? 4 : 0,
      profile.bio ? 12 : 0,
      profile.skills?.length > 0 ? 12 : 0,
      profile.experience?.length > 0 ? 12 : 0,
      profile.education?.length > 0 ? 8 : 0,
      profile.projects?.length > 0 ? 8 : 0,
      profile.certificates?.length > 0 ? 6 : 0,
      profile.portfolioUrl ? 4 : 0,
      profile.linkedin ? 3 : 0,
      profile.github ? 3 : 0,
    ].reduce((a, b) => a + b, 0) /
      82) *
      100,
  );

  return (
    <div className="min-h-screen bg-[#fdfdfe]">
      <Navbar />
      <main className="pt-32 pb-24">
        <PageWrapper>
          <div className="max-w-6xl mx-auto">
            {/* Profile Header */}
            <div className="bg-white rounded-2xl p-8 border border-slate-100 mb-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <Avatar
                  src={user?.photoURL}
                  alt={displayName}
                  size="w-32 h-32"
                />
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-black text-slate-900 mb-2">
                    {displayName}
                  </h1>
                  <p className="text-slate-500 mb-4">{user?.email}</p>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <Link
                      href="/profile/edit"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </Link>
                    <Link
                      href="/resume"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
                    >
                      <Briefcase className="w-4 h-4" />
                      Upload Resume
                    </Link>
                  </div>
                </div>
              </div>

              {/* Profile Completion */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Profile Completion
                  </h3>
                  <span
                    className={`text-2xl font-bold ${profileCompletion >= 80 ? "text-emerald-600" : "text-orange-600"}`}
                  >
                    {profileCompletion}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${profileCompletion >= 80 ? "bg-emerald-500" : "bg-orange-400"}`}
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
                {profileCompletion < 80 && (
                  <p className="text-sm text-orange-600 mt-2">
                    Complete your profile to increase visibility with
                    recruiters.
                  </p>
                )}
              </div>
            </div>

            {/* Profile Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Basic Info */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  Basic Information
                </h3>
                <div className="space-y-3">
                  {profile.title && (
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Title
                      </p>
                      <p className="text-slate-900">{profile.title}</p>
                    </div>
                  )}
                  {profile.location && (
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Location
                      </p>
                      <p className="text-slate-900 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {profile.location}
                      </p>
                    </div>
                  )}
                  {profile.phone && (
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Phone
                      </p>
                      <p className="text-slate-900 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {profile.phone}
                      </p>
                    </div>
                  )}
                  {profile.email && (
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Email
                      </p>
                      <p className="text-slate-900 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {profile.email}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* About */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  About
                </h3>
                {profile.bio ? (
                  <p className="text-slate-700 leading-relaxed">
                    {profile.bio}
                  </p>
                ) : (
                  <p className="text-slate-400 italic">No bio added yet</p>
                )}
              </div>

              {/* Skills & Experience */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-600" />
                  Skills & Experience
                </h3>
                <div className="space-y-4">
                  {profile.skills && profile.skills.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-2">
                        Skills
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {profile.yearsOfExperience && (
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Years of Experience
                      </p>
                      <p className="text-slate-900 font-semibold">
                        {profile.yearsOfExperience} years
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-white rounded-2xl p-6 border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <Link
                  href="/applications"
                  className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors text-slate-700 font-medium"
                >
                  <Briefcase className="w-4 h-4" />
                  My Applications
                </Link>
                <Link
                  href="/saved-jobs"
                  className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors text-slate-700 font-medium"
                >
                  <Award className="w-4 h-4" />
                  Saved Jobs
                </Link>
                <Link
                  href="/skill-test"
                  className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors text-slate-700 font-medium"
                >
                  <GraduationCap className="w-4 h-4" />
                  Skill Tests
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 p-3 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors text-indigo-700 font-medium"
                >
                  <Calendar className="w-4 h-4" />
                  Dashboard
                </Link>
              </div>
            </div>

            {/* Social Links */}
            {(profile.github || profile.linkedin || profile.portfolioUrl) && (
              <div className="mt-6 bg-white rounded-2xl p-6 border border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Connect
                </h3>
                <div className="flex flex-wrap gap-3">
                  {profile.github && (
                    <a
                      href={`https://github.com/${profile.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <Github className="w-4 h-4" />
                      GitHub
                    </a>
                  )}
                  {profile.linkedin && (
                    <a
                      href={profile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </a>
                  )}
                  {profile.portfolioUrl && (
                    <a
                      href={profile.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                      Portfolio
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </PageWrapper>
      </main>
      <Footer />
    </div>
  );
}
