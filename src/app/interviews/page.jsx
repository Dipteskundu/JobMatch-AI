"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../lib/AuthContext";
import { API_BASE } from "../lib/apiClient";
import {
  Clock,
  Users,
  Calendar,
  Mail,
  Video,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Filter,
  Search,
  Phone,
  ExternalLink,
} from "lucide-react";
import InterviewScheduler from "../components/InterviewScheduler/InterviewScheduler";

export default function InterviewsPage() {
  const { user, isAuthenticated } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showInterviewScheduler, setShowInterviewScheduler] = useState(false);

  const handleScheduleInterview = () => {
    setShowInterviewScheduler(true);
  };

  const handleInterviewScheduled = async (interviewData) => {
    try {
      const interviewDataWithRecruiter = {
        ...interviewData,
        recruiterId: user.uid, // Use actual recruiter UID
      };

      const res = await fetch(`${API_BASE}/api/interviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(interviewDataWithRecruiter),
      });

      const result = await res.json();

      if (result.success) {
        // Refresh interviews list
        const fetchInterviews = async () => {
          try {
            const response = await fetch(
              `${API_BASE}/api/interviews/recruiter/${user.uid}`,
            );
            if (response.ok) {
              const data = await response.json();
              if (data.success) {
                setInterviews(data.interviews || []);
              }
            }
          } catch (err) {
            console.error("Failed to refresh interviews:", err);
          }
        };

        await fetchInterviews();
        setShowInterviewScheduler(false);
        console.log("Interview scheduled successfully!");
      } else {
        throw new Error(result.message || "Failed to schedule interview");
      }
    } catch (error) {
      console.error("Failed to schedule interview:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !user?.uid) return;

    const fetchInterviews = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/api/interviews/recruiter/${user.uid}`,
        );
        if (!response.ok) throw new Error("Failed to fetch interviews");

        const data = await response.json();
        if (data.success) {
          setInterviews(data.interviews || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, [isAuthenticated, user?.uid]);

  const handleStatusChange = async (interviewId, newStatus) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/interviews/${interviewId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (response.ok) {
        setInterviews(
          interviews.map((interview) =>
            interview._id === interviewId
              ? { ...interview, status: newStatus }
              : interview,
          ),
        );
      }
    } catch (err) {
      console.error("Failed to update interview status:", err);
    }
  };

  const handleJoinMeeting = (meetingUrl) => {
    if (meetingUrl) {
      window.open(meetingUrl, "_blank");
    }
  };

  const filteredInterviews = interviews.filter((interview) => {
    const matchesFilter = filter === "all" || interview.status === filter;
    const matchesSearch =
      searchQuery === "" ||
      interview.applicantEmail
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      interview.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interview.company?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: interviews.length,
    scheduled: interviews.filter((int) => int.status === "scheduled").length,
    completed: interviews.filter((int) => int.status === "completed").length,
    cancelled: interviews.filter((int) => int.status === "cancelled").length,
    upcoming: interviews.filter(
      (int) =>
        int.status === "scheduled" &&
        new Date(int.scheduledDateTime) > new Date(),
    ).length,
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            Please Sign In
          </h1>
          <p className="text-slate-600">
            You need to be signed in to view interviews.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-6"
              >
                <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-slate-900">Interviews</h1>
            <button
              onClick={handleScheduleInterview}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Schedule Interview
            </button>
          </div>
          <p className="text-slate-600">
            Manage interview schedules and track progress
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.total}
                </p>
                <p className="text-sm text-slate-500">Total Interviews</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-amber-50 text-amber-600 p-3 rounded-xl">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.upcoming}
                </p>
                <p className="text-sm text-slate-500">Upcoming</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.completed}
                </p>
                <p className="text-sm text-slate-500">Completed</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-red-50 text-red-600 p-3 rounded-xl">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.cancelled}
                </p>
                <p className="text-sm text-slate-500">Cancelled</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by candidate email, job title, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400"
              />
            </div>
          </div>
        </div>

        {/* Interviews List */}
        {filteredInterviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              {searchQuery || filter !== "all"
                ? "No Matching Interviews"
                : "No Interviews Scheduled"}
            </h2>
            <p className="text-slate-600">
              {searchQuery || filter !== "all"
                ? "Try adjusting your filters or search query."
                : "Schedule your first interview when you shortlist candidates."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInterviews.map((interview) => (
              <div
                key={interview._id}
                className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                          interview.status === "completed"
                            ? "bg-emerald-50 text-emerald-600"
                            : interview.status === "cancelled"
                              ? "bg-red-50 text-red-600"
                              : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        {interview.status === "completed" ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : interview.status === "cancelled" ? (
                          <XCircle className="w-6 h-6" />
                        ) : (
                          <Clock className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-slate-900">
                            {interview.applicantEmail}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-lg text-xs font-medium ${
                              interview.status === "completed"
                                ? "bg-emerald-100 text-emerald-700"
                                : interview.status === "cancelled"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {interview.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-2">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {interview.jobTitle}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(
                              interview.scheduledDateTime,
                            ).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(
                              interview.scheduledDateTime,
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            {interview.type === "video" ? (
                              <Video className="w-4 h-4" />
                            ) : interview.type === "phone" ? (
                              <Phone className="w-4 h-4" />
                            ) : (
                              <MapPin className="w-4 h-4" />
                            )}
                            {interview.type === "video"
                              ? "Video Call"
                              : interview.type === "phone"
                                ? "Phone Call"
                                : interview.location || "In-person"}
                          </div>
                          {interview.duration && (
                            <span>{interview.duration} minutes</span>
                          )}
                          <span className="text-slate-400">
                            {interview.company}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Send email"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                    {interview.status === "scheduled" && (
                      <>
                        {interview.type === "video" && interview.meetingUrl && (
                          <button
                            onClick={() =>
                              handleJoinMeeting(interview.meetingUrl)
                            }
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Join video call"
                          >
                            <Video className="w-4 h-4" />
                          </button>
                        )}
                        <select
                          value={interview.status}
                          onChange={(e) =>
                            handleStatusChange(interview._id, e.target.value)
                          }
                          className="text-sm font-medium border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:border-indigo-400 cursor-pointer"
                        >
                          <option value="scheduled">Scheduled</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interview Scheduler Modal */}
      {showInterviewScheduler && (
        <InterviewScheduler
          applicant={{
            _id: "manual-interview",
            firebaseUid: "manual-interview",
            email: "candidate@example.com",
            jobTitle: "Position to be determined",
            company: user?.displayName || "Your Company",
          }}
          isOpen={showInterviewScheduler}
          onClose={() => setShowInterviewScheduler(false)}
          onSchedule={handleInterviewScheduled}
        />
      )}
    </div>
  );
}
