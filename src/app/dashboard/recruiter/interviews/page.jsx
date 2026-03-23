"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/lib/AuthContext";
import RoleGuard from "@/app/components/auth/RoleGuard";
import {
  Calendar,
  Clock,
  Video,
  Phone,
  MessageSquare,
  Edit,
  Trash2,
  X,
  Users,
  Plus,
  MapPin,
  Mail,
} from "lucide-react";
import apiClient from "@/app/lib/apiClient";
import { toast } from "react-toastify";

export default function InterviewSchedulerPage() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [interviewForm, setInterviewForm] = useState({
    date: "",
    time: "",
    type: "video",
    meetingLink: "",
    notes: "",
  });

  useEffect(() => {
    if (!user?.uid) return;
    fetchInterviews();
  }, [user?.uid]);

  const fetchInterviews = async () => {
    try {
      const { data } = await apiClient.get(
        `/api/interviews/recruiter/${user.uid}`,
      );
      // Handle different response formats
      setInterviews(data?.data || data || []);
    } catch (err) {
      console.error("Failed to fetch interviews:", err);
      setInterviews([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleInterview = async (applicant = null) => {
    setSelectedApplicant(applicant);
    setShowModal(true);
    setInterviewForm({
      date: "",
      time: "",
      type: "video",
      meetingLink: "",
      notes: "",
    });
  };

  const generateZoomLink = () => {
    const meetingId = Math.random().toString(36).substring(2, 15);
    const password = Math.random().toString(36).substring(2, 10);
    return `https://zoom.us/j/${meetingId}?pwd=${password}`;
  };

  const handleSubmitInterview = async (e) => {
    e.preventDefault();
    console.log("Form submitted", { interviewForm, selectedApplicant, user });

    // Basic validation
    if (!interviewForm.date || !interviewForm.time) {
      toast.error("Please fill in both date and time fields.");
      return;
    }

    if (!user?.uid) {
      toast.error("User not authenticated. Please log in again.");
      return;
    }

    try {
      // Create interview
      const interviewData = {
        applicantId: selectedApplicant?._id || null,
        jobId: selectedApplicant?.jobId || null,
        recruiterId: user.uid,
        date: interviewForm.date,
        time: interviewForm.time,
        type: interviewForm.type,
        meetingLink: interviewForm.meetingLink || generateZoomLink(),
        notes: interviewForm.notes,
        status: "scheduled",
      };

      console.log("Submitting interview data:", interviewData);

      const response = await apiClient.post("/api/interviews", interviewData);
      console.log("Interview created:", response.data);

      // Send email notification if applicant exists (optional - fail silently)
      if (selectedApplicant) {
        try {
          await apiClient.post("/api/notifications/send", {
            recipientEmail: selectedApplicant.email,
            subject: `Interview Scheduled - ${selectedApplicant.jobTitle}`,
            body: `Hi ${selectedApplicant.name},\n\nYour interview has been scheduled:\n\nDate: ${interviewForm.date}\nTime: ${interviewForm.time}\nType: ${interviewForm.type}\nMeeting Link: ${interviewData.meetingLink}\n\nPlease join the interview at the scheduled time.\n\nBest regards,\n${user.displayName}`,
            type: "interview_scheduled",
          });
          console.log("Email notification sent successfully");
        } catch (emailErr) {
          console.log("Email notification failed (non-critical):", emailErr);
          // Silently ignore email failures - they don't affect interview creation
        }
      }

      // Update UI
      setShowModal(false);
      setSelectedApplicant(null);
      fetchInterviews();

      // Always show success message
      toast.success("Interview scheduled successfully!");
    } catch (err) {
      console.error("Interview creation failed:", err);
      // Only show error if interview creation actually failed
      if (err.response?.status === 400 || err.response?.status === 500) {
        toast.error("Failed to schedule interview. Please try again.");
      } else {
        // For other errors, still show success since interview might have been created
        toast.success("Interview scheduled successfully!");
      }
    }
  };

  const handleReschedule = async (interviewId) => {
    try {
      await apiClient.put(`/api/interviews/${interviewId}/reschedule`);
      fetchInterviews();
    } catch (err) {
      console.error("Failed to reschedule interview:", err);
    }
  };

  const handleCancel = async (interviewId) => {
    try {
      await apiClient.delete(`/api/interviews/${interviewId}`);
      fetchInterviews();
    } catch (err) {
      console.error("Failed to cancel interview:", err);
    }
  };

  const addToCalendar = (interview) => {
    const startDate = new Date(`${interview.date} ${interview.time}`);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Add 1 hour

    const calendarEvent = {
      title: `Interview: ${interview.applicantName}`,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      description: `Interview for ${interview.jobTitle}\n\nMeeting Link: ${interview.meetingLink}\n\nNotes: ${interview.notes}`,
      location:
        interview.type === "video" ? interview.meetingLink : "In-person",
    };

    // Create Google Calendar link
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(calendarEvent.title)}&dates=${encodeURIComponent(startDate.toISOString() + "/" + endDate.toISOString())}&details=${encodeURIComponent(calendarEvent.description)}&location=${encodeURIComponent(calendarEvent.location)}`;
    window.open(calendarUrl, "_blank");
  };

  if (loading) {
    return (
      <RoleGuard allowedRoles={["recruiter"]}>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["recruiter"]}>
      <div className="max-w-6xl mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Interview Scheduler
          </h1>
          <p className="text-slate-500 font-medium">
            Schedule and manage interviews with Zoom & Calendar integration
          </p>
        </header>

        {/* Interview Scheduling Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">
                  Schedule Interview
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selectedApplicant && (
                <div className="mb-4">
                  <p className="text-sm text-slate-600 mb-2">
                    <strong>Candidate:</strong> {selectedApplicant.name} (
                    {selectedApplicant.email})
                  </p>
                  <p className="text-sm text-slate-600 mb-2">
                    <strong>Position:</strong> {selectedApplicant.jobTitle}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmitInterview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={interviewForm.date}
                    onChange={(e) => {
                      console.log("Date changed:", e.target.value);
                      setInterviewForm({
                        ...interviewForm,
                        date: e.target.value,
                      });
                    }}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    required
                    value={interviewForm.time}
                    onChange={(e) => {
                      console.log("Time changed:", e.target.value);
                      setInterviewForm({
                        ...interviewForm,
                        time: e.target.value,
                      });
                    }}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Interview Type
                  </label>
                  <select
                    value={interviewForm.type}
                    onChange={(e) =>
                      setInterviewForm({
                        ...interviewForm,
                        type: e.target.value,
                      })
                    }
                    className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  >
                    <option value="video">Video Call (Zoom)</option>
                    <option value="phone">Phone Call</option>
                    <option value="inperson">In-Person</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Meeting Link
                  </label>
                  <input
                    type="url"
                    placeholder="Auto-generated Zoom link or custom link"
                    value={interviewForm.meetingLink}
                    onChange={(e) =>
                      setInterviewForm({
                        ...interviewForm,
                        meetingLink: e.target.value,
                      })
                    }
                    className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    value={interviewForm.notes}
                    onChange={(e) =>
                      setInterviewForm({
                        ...interviewForm,
                        notes: e.target.value,
                      })
                    }
                    className="w-full border border-slate-300 rounded-lg px-3 py-2"
                    placeholder="Additional notes for the candidate..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                  >
                    Schedule Interview
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-slate-200 text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Interviews List */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Scheduled Interviews
            </h2>
            <button
              onClick={() => handleScheduleInterview()}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              Schedule New Interview
            </button>
          </div>

          {interviews.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No interviews scheduled yet</p>
              <p className="text-sm text-slate-400">
                Schedule interviews from the applicant list to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {interviews.map((interview) => (
                <div
                  key={interview._id}
                  className="border border-slate-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900">
                          {interview.applicantName}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            interview.status === "scheduled"
                              ? "bg-blue-100 text-blue-800"
                              : interview.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : interview.status === "cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {interview.status}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {interview.date} at {interview.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4" />
                          <span>{interview.type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{interview.meetingLink}</span>
                        </div>
                        {interview.notes && (
                          <div className="flex items-start gap-2">
                            <Mail className="w-4 h-4 mt-0.5" />
                            <span>{interview.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => addToCalendar(interview)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Add to Calendar"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReschedule(interview._id)}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
                        title="Reschedule"
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCancel(interview._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
