"use client";

import { useState } from "react";
import { X, MessageSquare, Send } from "lucide-react";
import { toast } from "react-toastify";
import apiClient from "@/app/lib/apiClient";

export default function FeedbackModal({ 
  isOpen, 
  onClose, 
  applicant, 
  jobTitle, 
  onSuccess 
}) {
  const [feedback, setFeedback] = useState({
    reason: "",
    detailedFeedback: "",
    suggestions: "",
    followUp: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!feedback.reason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }

    setSubmitting(true);
    
    try {
      // Update application status to rejected with feedback
      await apiClient.put(`/api/applications/${applicant._id}/status`, {
        status: "rejected",
        feedback: feedback,
        rejectedAt: new Date(),
        rejectedBy: "recruiter",
      });

      // Send email notification with feedback
      await apiClient.post("/api/notifications/send", {
        recipientEmail: applicant.email,
        subject: `Update on your application for ${jobTitle}`,
        body: `Dear ${applicant.name},\n\nThank you for your interest in the ${jobTitle} position.\n\nAfter careful consideration, we have decided not to move forward with your application at this time.\n\nFeedback: ${feedback.reason}\n${feedback.detailedFeedback ? `\nAdditional feedback: ${feedback.detailedFeedback}` : ""}\n${feedback.suggestions ? `\nSuggestions for improvement: ${feedback.suggestions}` : ""}\n\n${feedback.followUp ? "We would be happy to consider your application for future opportunities." : "We wish you the best in your job search."}\n\nBest regards,\nHiring Team`,
        type: "rejection_feedback",
      });

      toast.success("Feedback sent successfully!");
      onSuccess();
      onClose();
      
      // Reset form
      setFeedback({
        reason: "",
        detailedFeedback: "",
        suggestions: "",
        followUp: false,
      });
      
    } catch (err) {
      console.error("Failed to send feedback:", err);
      toast.error("Failed to send feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const rejectionReasons = [
    "Not enough experience",
    "Skills don't match requirements",
    "Better qualified candidates",
    "Position requirements changed",
    "Company culture fit",
    "Other",
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">
              Send Rejection Feedback
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-600">
            <strong>Candidate:</strong> {applicant.name} ({applicant.email})
          </p>
          <p className="text-sm text-slate-600">
            <strong>Position:</strong> {jobTitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Rejection Reason *
            </label>
            <select
              value={feedback.reason}
              onChange={(e) => setFeedback({ ...feedback, reason: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
              required
            >
              <option value="">Select a reason</option>
              {rejectionReasons.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Detailed Feedback
            </label>
            <textarea
              rows={3}
              value={feedback.detailedFeedback}
              onChange={(e) => setFeedback({ ...feedback, detailedFeedback: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
              placeholder="Provide specific feedback about their application, interview, or qualifications..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Suggestions for Improvement
            </label>
            <textarea
              rows={2}
              value={feedback.suggestions}
              onChange={(e) => setFeedback({ ...feedback, suggestions: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
              placeholder="Suggest areas for improvement or skills to develop..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="followUp"
              checked={feedback.followUp}
              onChange={(e) => setFeedback({ ...feedback, followUp: e.target.checked })}
              className="w-4 h-4 text-indigo-600 border border-slate-300 rounded"
            />
            <label htmlFor="followUp" className="text-sm text-slate-700">
              Open to considering for future opportunities
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Feedback
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-200 text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
