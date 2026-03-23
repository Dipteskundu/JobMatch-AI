"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../lib/AuthContext";
import { API_BASE } from "../lib/apiClient";
import {
  Users,
  Mail,
  Calendar,
  Briefcase,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  User,
  MapPin,
  Phone,
  Globe,
  Github,
  Linkedin,
  Eye,
  X,
  Video,
} from "lucide-react";
import Link from "next/link";
import InterviewScheduler from "../components/InterviewScheduler/InterviewScheduler";

export default function ApplicantsPage() {
  const { user, isAuthenticated } = useAuth();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [statusChangeConfirm, setStatusChangeConfirm] = useState({
    show: false,
    applicantId: null,
    newStatus: null,
    applicantEmail: "",
  });
  const [showInterviewScheduler, setShowInterviewScheduler] = useState(false);
  const [selectedApplicantForInterview, setSelectedApplicantForInterview] =
    useState(null);

  const fetchApplicants = useCallback(async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/applications/recruiter/${user.uid}`,
      );
      const data = await res.json();
      if (data.success) {
        setApplicants(data.applications || []);
      }
    } catch (error) {
      console.error("Failed to fetch applicants:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    fetchApplicants();
  }, [user?.uid, fetchApplicants]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/applications/${appId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setApplicants(
          applicants.map((app) =>
            app._id === appId ? { ...app, status: newStatus } : app,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleStatusClick = (applicant, newStatus) => {
    setStatusChangeConfirm({
      show: true,
      applicantId: applicant._id,
      newStatus: newStatus,
      applicantEmail: applicant.email,
    });
  };

  const confirmStatusChange = () => {
    if (statusChangeConfirm.applicantId && statusChangeConfirm.newStatus) {
      handleStatusChange(
        statusChangeConfirm.applicantId,
        statusChangeConfirm.newStatus,
      );
      setStatusChangeConfirm({
        show: false,
        applicantId: null,
        newStatus: null,
        applicantEmail: "",
      });
    }
  };

  const cancelStatusChange = () => {
    setStatusChangeConfirm({
      show: false,
      applicantId: null,
      newStatus: null,
      applicantEmail: "",
    });
  };

  const handleScheduleInterview = (applicant) => {
    setSelectedApplicantForInterview(applicant);
    setShowInterviewScheduler(true);
  };

  const handleInterviewScheduled = async (interviewData) => {
    try {
      console.log("Sending interview data:", interviewData);

      // Add actual recruiter UID to the interview data
      const interviewDataWithRecruiter = {
        ...interviewData,
        recruiterId: user.uid, // Use actual recruiter UID
      };

      const apiUrl = `${API_BASE}/api/interviews`;
      console.log("Calling API URL:", apiUrl);

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(interviewDataWithRecruiter),
      });

      console.log("API Response status:", res.status);
      console.log("API Response ok:", res.ok);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error Response:", errorText);
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }

      const result = await res.json();
      console.log("API Response data:", result);

      if (result.success) {
        // Update applicant status to "interviewing" using the application ID
        const applicationId = applicants.find(
          (app) => app.firebaseUid === interviewData.applicantId,
        )?._id;
        console.log("Found application ID for status update:", applicationId);

        if (applicationId) {
          await handleStatusChange(applicationId, "interviewing");
        }

        // Show success message (you could add a toast notification here)
        console.log("Interview scheduled successfully!");
      } else {
        throw new Error(result.message || "Failed to schedule interview");
      }
    } catch (error) {
      console.error("Failed to schedule interview - Full error:", error);
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      throw error; // Re-throw to let the scheduler handle the error state
    }
  };

  const fetchApplicantProfile = async (firebaseUid) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/profile/${firebaseUid}`);
      const data = await res.json();
      if (data.success) {
        setSelectedApplicant(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch applicant profile:", error);
    }
  };

  const handleViewProfile = async (applicant) => {
    await fetchApplicantProfile(applicant.firebaseUid);
    setShowProfileModal(true);
  };

  const filteredApplicants = applicants.filter((applicant) => {
    const matchesSearch =
      applicant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || applicant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: applicants.length,
    submitted: applicants.filter((a) => a.status === "submitted").length,
    shortlisted: applicants.filter((a) => a.status === "shortlisted").length,
    interviewing: applicants.filter((a) => a.status === "interviewing").length,
    selected: applicants.filter((a) => a.status === "selected").length,
    rejected: applicants.filter((a) => a.status === "rejected").length,
  };

  const statusColors = {
    submitted: "bg-blue-100 text-blue-800",
    shortlisted: "bg-green-100 text-green-800",
    interviewing: "bg-yellow-100 text-yellow-800",
    selected: "bg-purple-100 text-purple-800",
    rejected: "bg-red-100 text-red-800",
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            Please Sign In
          </h1>
          <p className="text-slate-600 mb-6">
            You need to be signed in to view applicants.
          </p>
          <Link
            href="/signin"
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Applicants</h1>
              <p className="text-slate-600 mt-1">
                Manage and review job applications
              </p>
            </div>
            <Link
              href="/dashboard"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-slate-600" />
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.total}
                </p>
                <p className="text-xs text-slate-600">Total</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.submitted}
                </p>
                <p className="text-xs text-slate-600">Submitted</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.shortlisted}
                </p>
                <p className="text-xs text-slate-600">Shortlisted</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.interviewing}
                </p>
                <p className="text-xs text-slate-600">Interviewing</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.selected}
                </p>
                <p className="text-xs text-slate-600">Selected</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.rejected}
                </p>
                <p className="text-xs text-slate-600">Rejected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by email, job title, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interviewing">Interviewing</option>
              <option value="selected">Selected</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Applicants List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-slate-600 mt-2">Loading applicants...</p>
          </div>
        ) : filteredApplicants.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-slate-200">
            <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No applicants found
            </h3>
            <p className="text-slate-600">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "No applications have been submitted yet"}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Job Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Applied
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredApplicants.map((applicant) => (
                    <tr key={applicant._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-slate-900">
                              {applicant.email}
                            </p>
                            <p className="text-xs text-slate-500">
                              {applicant.skills?.slice(0, 3).join(", ")}
                              {applicant.skills?.length > 3 && "..."}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {applicant.jobTitle}
                          </p>
                          <p className="text-xs text-slate-500">
                            {applicant.company}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-slate-900">
                          {new Date(applicant.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={applicant.status}
                          onChange={(e) => {
                            if (e.target.value !== applicant.status) {
                              handleStatusClick(applicant, e.target.value);
                            }
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[applicant.status]}`}
                        >
                          <option value="submitted">Submitted</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="interviewing">Interviewing</option>
                          <option value="selected">Selected</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewProfile(applicant)}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            View Profile
                          </button>
                          {applicant.status !== "interviewing" &&
                            applicant.status !== "selected" &&
                            applicant.status !== "rejected" && (
                              <button
                                onClick={() =>
                                  handleScheduleInterview(applicant)
                                }
                                className="text-green-600 hover:text-green-900 text-sm font-medium flex items-center gap-1"
                              >
                                <Calendar className="w-4 h-4" />
                                Schedule
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {showProfileModal && selectedApplicant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">
                  Applicant Profile
                </h2>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Basic Info */}
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900">
                    {selectedApplicant.displayName}
                  </h3>
                  <p className="text-slate-600">{selectedApplicant.email}</p>
                  <p className="text-sm text-slate-500 mt-1">
                    {selectedApplicant.title || "No title provided"}
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">
                    Contact Information
                  </h4>
                  <div className="space-y-2">
                    {selectedApplicant.phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-4 h-4" />
                        {selectedApplicant.phone}
                      </div>
                    )}
                    {selectedApplicant.location && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="w-4 h-4" />
                        {selectedApplicant.location}
                      </div>
                    )}
                    {selectedApplicant.portfolioUrl && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Globe className="w-4 h-4" />
                        <a
                          href={selectedApplicant.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline"
                        >
                          Portfolio
                        </a>
                      </div>
                    )}
                    {selectedApplicant.linkedin && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Linkedin className="w-4 h-4" />
                        <a
                          href={selectedApplicant.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline"
                        >
                          LinkedIn
                        </a>
                      </div>
                    )}
                    {selectedApplicant.github && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Github className="w-4 h-4" />
                        <a
                          href={selectedApplicant.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline"
                        >
                          GitHub
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">
                    Bio
                  </h4>
                  <p className="text-sm text-slate-600">
                    {selectedApplicant.bio || "No bio provided"}
                  </p>
                </div>
              </div>

              {/* Skills */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">
                  Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedApplicant.skills?.length > 0 ? (
                    selectedApplicant.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No skills listed</p>
                  )}
                </div>
              </div>

              {/* Experience */}
              {selectedApplicant.experience?.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">
                    Experience
                  </h4>
                  <div className="space-y-4">
                    {selectedApplicant.experience.map((exp, index) => (
                      <div
                        key={index}
                        className="border-l-2 border-slate-200 pl-4"
                      >
                        <h5 className="font-medium text-slate-900">
                          {exp.title}
                        </h5>
                        <p className="text-sm text-slate-600">{exp.company}</p>
                        <p className="text-xs text-slate-500">{exp.duration}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {selectedApplicant.education?.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">
                    Education
                  </h4>
                  <div className="space-y-4">
                    {selectedApplicant.education.map((edu, index) => (
                      <div
                        key={index}
                        className="border-l-2 border-slate-200 pl-4"
                      >
                        <h5 className="font-medium text-slate-900">
                          {edu.degree}
                        </h5>
                        <p className="text-sm text-slate-600">{edu.school}</p>
                        <p className="text-xs text-slate-500">{edu.year}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status Change Confirmation Modal */}
      {statusChangeConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Confirm Status Change
              </h3>
              <button
                onClick={cancelStatusChange}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-slate-600 mb-2">
                Are you sure you want to change the status for:
              </p>
              <p className="font-medium text-slate-900">
                {statusChangeConfirm.applicantEmail}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[applicants.find((a) => a._id === statusChangeConfirm.applicantId)?.status || "submitted"]}`}
                >
                  {applicants.find(
                    (a) => a._id === statusChangeConfirm.applicantId,
                  )?.status || "submitted"}
                </span>
                <span className="text-slate-400">→</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[statusChangeConfirm.newStatus]}`}
                >
                  {statusChangeConfirm.newStatus}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelStatusChange}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interview Scheduler Modal */}
      {showInterviewScheduler && selectedApplicantForInterview && (
        <InterviewScheduler
          applicant={selectedApplicantForInterview}
          isOpen={showInterviewScheduler}
          onClose={() => {
            setShowInterviewScheduler(false);
            setSelectedApplicantForInterview(null);
          }}
          onSchedule={handleInterviewScheduled}
        />
      )}
    </div>
  );
}
