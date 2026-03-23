"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { toast } from "react-toastify";

export default function StatusChangeModal({ 
  isOpen, 
  onClose, 
  applicant, 
  newStatus, 
  onConfirm 
}) {
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setConfirming(false);
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case "shortlisted":
        return "shortlist this applicant for the next round";
      case "interviewing":
        return "move this applicant to the interviewing stage";
      case "selected":
        return "select this applicant for the position";
      case "rejected":
        return "reject this applicant";
      default:
        return `change this applicant's status to ${status}`;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "shortlisted":
        return "text-blue-600 bg-blue-50";
      case "interviewing":
        return "text-purple-600 bg-purple-50";
      case "selected":
        return "text-green-600 bg-green-50";
      case "rejected":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${getStatusColor(newStatus)}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Confirm Status Change
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-slate-700 mb-4">
            Are you sure you want to{" "}
            <span className="font-semibold">{getStatusMessage(newStatus)}</span>?
          </p>
          
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600 mb-2">
              <strong>Applicant:</strong> {applicant?.name}
            </p>
            <p className="text-sm text-slate-600 mb-2">
              <strong>Position:</strong> {applicant?.jobTitle}
            </p>
            <p className="text-sm text-slate-600">
              <strong>New Status:</strong>{" "}
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(newStatus)}`}>
                {newStatus}
              </span>
            </p>
          </div>

          {newStatus === "rejected" && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                <strong>Note:</strong> After rejecting, you can send feedback to the applicant using the feedback button.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              newStatus === "rejected" 
                ? "bg-red-600 text-white hover:bg-red-700 disabled:opacity-50" 
                : "bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            } disabled:cursor-not-allowed flex items-center justify-center gap-2`}
          >
            {confirming ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Updating...
              </>
            ) : (
              <>
                {newStatus === "rejected" ? "Reject Applicant" : "Confirm Change"}
              </>
            )}
          </button>
          <button
            onClick={onClose}
            disabled={confirming}
            className="flex-1 bg-slate-200 text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
