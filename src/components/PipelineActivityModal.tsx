"use client";

import { useState } from "react";

interface PipelineActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId: string;
  leadName: string;
  salesManagerId: string;
  onActivityAdded: () => void;
}

export default function PipelineActivityModal({
  isOpen,
  onClose,
  assignmentId,
  leadName,
  salesManagerId,
  onActivityAdded,
}: PipelineActivityModalProps) {
  const [formData, setFormData] = useState({
    activityType: "",
    description: "",
    outcome: "",
    scheduledAt: "",
    completedAt: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activityTypes = [
    { value: "PHONE_CALL", label: "Phone Call" },
    { value: "EMAIL_SENT", label: "Email Sent" },
    { value: "EMAIL_RECEIVED", label: "Email Received" },
    { value: "MEETING_SCHEDULED", label: "Meeting Scheduled" },
    { value: "MEETING_COMPLETED", label: "Meeting Completed" },
    { value: "PROPERTY_SHOWING", label: "Property Showing" },
    { value: "PROPOSAL_SENT", label: "Proposal Sent" },
    { value: "FOLLOW_UP", label: "Follow Up" },
    { value: "DOCUMENT_RECEIVED", label: "Document Received" },
    { value: "APPLICATION_SUBMITTED", label: "Application Submitted" },
    { value: "NEGOTIATION", label: "Negotiation" },
    { value: "CONTRACT_SENT", label: "Contract Sent" },
    { value: "CONTRACT_SIGNED", label: "Contract Signed" },
    { value: "PAYMENT_RECEIVED", label: "Payment Received" },
    { value: "DEAL_CLOSED", label: "Deal Closed" },
    { value: "DEAL_LOST", label: "Deal Lost" },
    { value: "NOTE_ADDED", label: "Note Added" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.activityType || !formData.description) {
      setError("Activity type and description are required");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch("/api/admin/pipeline/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assignmentId,
          ...formData,
          salesManagerId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setFormData({
          activityType: "",
          description: "",
          outcome: "",
          scheduledAt: "",
          completedAt: "",
        });
        onActivityAdded();
        onClose();
      } else {
        setError(data.error || "Failed to add activity");
      }
    } catch (err) {
      setError("Failed to add activity");
      console.error("Error adding activity:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Add Activity - {leadName}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Activity Type *
              </label>
              <select
                value={formData.activityType}
                onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select activity type</option>
                {activityTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the activity..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Outcome
              </label>
              <textarea
                value={formData.outcome}
                onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What was the outcome or result?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scheduled At
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Completed At
              </label>
              <input
                type="datetime-local"
                value={formData.completedAt}
                onChange={(e) => setFormData({ ...formData, completedAt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Adding..." : "Add Activity"}
              </button>
            </div>
          </form>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Some activities may automatically advance the pipeline stage based on the activity type.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}