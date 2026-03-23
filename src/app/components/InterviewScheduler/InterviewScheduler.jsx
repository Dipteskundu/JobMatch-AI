"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Users,
  X,
  Check,
  AlertCircle,
  Phone,
} from "lucide-react";

export default function InterviewScheduler({
  applicant,
  isOpen,
  onClose,
  onSchedule,
}) {
  const [interviewData, setInterviewData] = useState({
    type: "video", // video, phone, in-person
    date: "",
    time: "",
    duration: "30", // minutes
    location: "",
    meetingUrl: "",
    meetingId: "",
    notes: "",
    reminderTime: "15", // minutes before
  });

  const [isScheduling, setIsScheduling] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!interviewData.date) {
      newErrors.date = "Date is required";
    }

    if (!interviewData.time) {
      newErrors.time = "Time is required";
    }

    if (interviewData.type === "video" && !interviewData.meetingUrl) {
      newErrors.meetingUrl = "Meeting URL is required for video interviews";
    }

    if (interviewData.type === "in-person" && !interviewData.location) {
      newErrors.location = "Location is required for in-person interviews";
    }

    // Check if date is in the past
    const interviewDateTime = new Date(
      `${interviewData.date}T${interviewData.time}`,
    );
    if (interviewDateTime < new Date()) {
      newErrors.datetime = "Cannot schedule interviews in the past";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsScheduling(true);

    try {
      const interviewDetails = {
        ...interviewData,
        applicantId: applicant.firebaseUid, // Use Firebase UID instead of MongoDB _id
        applicationId: applicant._id, // Add application ID for matching
        applicantEmail: applicant.email,
        applicantName: applicant.email.split("@")[0], // Extract name from email
        jobTitle: applicant.jobTitle,
        company: applicant.company,
        scheduledBy: "recruiter", // This would be the actual recruiter ID
        recruiterId: window.localStorage.getItem("uid") || "recruiter", // Add recruiter ID
        status: "scheduled",
        createdAt: new Date(),
      };

      console.log("Interview Details being sent:", interviewDetails);
      console.log("Applicant object:", applicant);

      await onSchedule(interviewDetails);
      onClose();

      // Reset form
      setInterviewData({
        type: "video",
        date: "",
        time: "",
        duration: "30",
        location: "",
        meetingUrl: "",
        meetingId: "",
        notes: "",
        reminderTime: "15",
      });
    } catch (error) {
      console.error("Failed to schedule interview:", error);
    } finally {
      setIsScheduling(false);
    }
  };

  const generateZoomLink = () => {
    // This would integrate with Zoom API in a real implementation
    const mockMeetingId = Math.random().toString(36).substring(2, 12);
    const mockUrl = `https://zoom.us/j/${mockMeetingId}`;

    setInterviewData((prev) => ({
      ...prev,
      meetingUrl: mockUrl,
      meetingId: mockMeetingId,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Schedule Interview
              </h2>
              <p className="text-slate-600 mt-1">
                with {applicant.email} for {applicant.jobTitle}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Interview Type */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Interview Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "video", label: "Video Call", icon: Video },
                { value: "phone", label: "Phone Call", icon: Phone },
                { value: "in-person", label: "In-Person", icon: MapPin },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setInterviewData((prev) => ({ ...prev, type: value }))
                  }
                  className={`p-3 rounded-lg border-2 transition-all ${
                    interviewData.type === value
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <Icon className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-sm font-medium">{label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={interviewData.date}
                onChange={(e) =>
                  setInterviewData((prev) => ({
                    ...prev,
                    date: e.target.value,
                  }))
                }
                min={new Date().toISOString().split("T")[0]}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.date ? "border-red-300" : "border-slate-300"
                }`}
              />
              {errors.date && (
                <p className="text-red-500 text-xs mt-1">{errors.date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Time *
              </label>
              <input
                type="time"
                value={interviewData.time}
                onChange={(e) =>
                  setInterviewData((prev) => ({
                    ...prev,
                    time: e.target.value,
                  }))
                }
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.time ? "border-red-300" : "border-slate-300"
                }`}
              />
              {errors.time && (
                <p className="text-red-500 text-xs mt-1">{errors.time}</p>
              )}
            </div>
          </div>

          {errors.datetime && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-red-700 text-sm">{errors.datetime}</p>
            </div>
          )}

          {/* Duration */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Duration
            </label>
            <select
              value={interviewData.duration}
              onChange={(e) =>
                setInterviewData((prev) => ({
                  ...prev,
                  duration: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
            </select>
          </div>

          {/* Conditional Fields Based on Type */}
          {interviewData.type === "video" && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Video Meeting Details *
                </label>
                <button
                  type="button"
                  onClick={generateZoomLink}
                  className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full hover:bg-indigo-200 transition-colors"
                >
                  Generate Zoom Link
                </button>
              </div>

              <div className="space-y-3">
                <input
                  type="url"
                  placeholder="Meeting URL (e.g., https://zoom.us/j/...)"
                  value={interviewData.meetingUrl}
                  onChange={(e) =>
                    setInterviewData((prev) => ({
                      ...prev,
                      meetingUrl: e.target.value,
                    }))
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.meetingUrl ? "border-red-300" : "border-slate-300"
                  }`}
                />
                {errors.meetingUrl && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.meetingUrl}
                  </p>
                )}

                <input
                  type="text"
                  placeholder="Meeting ID (optional)"
                  value={interviewData.meetingId}
                  onChange={(e) =>
                    setInterviewData((prev) => ({
                      ...prev,
                      meetingId: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {interviewData.type === "in-person" && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                placeholder="Office address, room number, etc."
                value={interviewData.location}
                onChange={(e) =>
                  setInterviewData((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.location ? "border-red-300" : "border-slate-300"
                }`}
              />
              {errors.location && (
                <p className="text-red-500 text-xs mt-1">{errors.location}</p>
              )}
            </div>
          )}

          {interviewData.type === "phone" && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="Candidate will call this number"
                value={interviewData.location}
                onChange={(e) =>
                  setInterviewData((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* Reminder Time */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Send Reminder
            </label>
            <select
              value={interviewData.reminderTime}
              onChange={(e) =>
                setInterviewData((prev) => ({
                  ...prev,
                  reminderTime: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="0">No reminder</option>
              <option value="15">15 minutes before</option>
              <option value="30">30 minutes before</option>
              <option value="60">1 hour before</option>
              <option value="1440">1 day before</option>
            </select>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Additional Notes
            </label>
            <textarea
              placeholder="Any additional information for the candidate..."
              value={interviewData.notes}
              onChange={(e) =>
                setInterviewData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isScheduling}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isScheduling ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  Schedule Interview
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
