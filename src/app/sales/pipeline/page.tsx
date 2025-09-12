"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PipelineActivityModal from "@/components/PipelineActivityModal";

interface PipelineStage {
  id: string;
  stage: string;
  enteredAt: string;
  exitedAt?: string;
  durationHours?: number;
  probability?: number;
  estimatedValue?: number;
  nextAction?: string;
  nextActionDate?: string;
  notes?: string;
  assignmentId?: string;
  lead: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    score: number;
    grade: string;
  };
  recentActivities: Array<{
    id: string;
    activityType: string;
    description: string;
    createdAt: string;
  }>;
}



export default function SalesPipeline() {
  const { user } = useAuth();
  const [pipelineData, setPipelineData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [showStageModal, setShowStageModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<PipelineStage | null>(null);

  const [stageForm, setStageForm] = useState({
    stage: "",
    probability: "",
    estimatedValue: "",
    nextAction: "",
    nextActionDate: "",
    notes: "",
  });

  const stageLabels: Record<string, string> = {
    NEW_LEAD: "New Lead",
    CONTACTED: "Contacted",
    QUALIFIED: "Qualified", 
    PROPOSAL_SENT: "Proposal Sent",
    NEGOTIATION: "Negotiation",
    PROPERTY_VIEWING: "Property Viewing",
    APPLICATION: "Application",
    CLOSING: "Closing",
    WON: "Won",
    LOST: "Lost",
    ON_HOLD: "On Hold",
  };

  const stageColors: Record<string, string> = {
    NEW_LEAD: "bg-gray-100 text-gray-800",
    CONTACTED: "bg-blue-100 text-blue-800",
    QUALIFIED: "bg-indigo-100 text-indigo-800",
    PROPOSAL_SENT: "bg-purple-100 text-purple-800",
    NEGOTIATION: "bg-yellow-100 text-yellow-800",
    PROPERTY_VIEWING: "bg-orange-100 text-orange-800",
    APPLICATION: "bg-teal-100 text-teal-800",
    CLOSING: "bg-cyan-100 text-cyan-800",
    WON: "bg-green-100 text-green-800",
    LOST: "bg-red-100 text-red-800",
    ON_HOLD: "bg-gray-100 text-gray-600",
  };

  const activityTypeLabels: Record<string, string> = {
    PHONE_CALL: "Phone Call",
    EMAIL_SENT: "Email Sent",
    EMAIL_RECEIVED: "Email Received",
    MEETING_SCHEDULED: "Meeting Scheduled",
    MEETING_COMPLETED: "Meeting Completed",
    PROPERTY_SHOWING: "Property Showing",
    PROPOSAL_SENT: "Proposal Sent",
    FOLLOW_UP: "Follow Up",
    DOCUMENT_RECEIVED: "Document Received",
    APPLICATION_SUBMITTED: "Application Submitted",
    NEGOTIATION: "Negotiation",
    CONTRACT_SENT: "Contract Sent",
    CONTRACT_SIGNED: "Contract Signed",
    PAYMENT_RECEIVED: "Payment Received",
    DEAL_CLOSED: "Deal Closed",
    DEAL_LOST: "Deal Lost",
    NOTE_ADDED: "Note Added",
  };

  useEffect(() => {
    if (user?.id) {
      loadPipelineData();
    }
  }, [user?.id, selectedStage]);

  const loadPipelineData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        salesManagerId: user?.id || "",
      });
      
      if (selectedStage !== "all") {
        params.append("stage", selectedStage);
      }

      const response = await fetch(`/api/sales/pipeline?${params}`);
      const data = await response.json();

      if (data.success) {
        setPipelineData(data.data);
      } else {
        setError(data.error || "Failed to load pipeline data");
      }

    } catch (err) {
      setError("Failed to load pipeline data");
      console.error("Error loading pipeline:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStageUpdate = (stage: PipelineStage) => {
    setSelectedLead(stage);
    setStageForm({
      stage: stage.stage,
      probability: stage.probability?.toString() || "",
      estimatedValue: stage.estimatedValue?.toString() || "",
      nextAction: stage.nextAction || "",
      nextActionDate: stage.nextActionDate ? stage.nextActionDate.split('T')[0] : "",
      notes: stage.notes || "",
    });
    setShowStageModal(true);
  };

  const handleAddActivity = (stage: PipelineStage) => {
    setSelectedLead(stage);
    setShowActivityModal(true);
  };

  const handleStageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLead) return;

    try {
      setError(null);
      
      const response = await fetch(`/api/admin/pipeline/${selectedLead.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...stageForm,
          salesManagerId: user?.id,
          probability: stageForm.probability ? parseInt(stageForm.probability) : null,
          estimatedValue: stageForm.estimatedValue ? parseFloat(stageForm.estimatedValue) : null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowStageModal(false);
        setSelectedLead(null);
        await loadPipelineData();
      } else {
        setError(data.error || "Failed to update stage");
      }
    } catch (err) {
      setError("Failed to update stage");
      console.error("Error updating stage:", err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Pipeline</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading pipeline...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Pipeline</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  const { stages = [], statistics = {} } = pipelineData || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Pipeline</h1>
          <p className="text-gray-600">Track your deals and manage your sales process</p>
        </div>
        <button 
          onClick={loadPipelineData}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Deals</p>
              <p className="text-2xl font-semibold text-gray-900">{stages.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pipeline Value</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(statistics.revenue?.pipeline || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Win Rate</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics.revenue?.winRate || 0}%
              </p>
            </div>
          </div>
        </div>

        
      </div>

      {/* Upcoming Actions */}
      

      {/* Stage Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-4">
          <label className="block text-sm font-medium text-gray-700">Filter by Stage:</label>
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Stages</option>
            {Object.entries(stageLabels).map(([stage, label]) => (
              <option key={stage} value={stage}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Pipeline Stages */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Active Deals ({stages.length})</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {stages.map((stage: PipelineStage) => (
            <div key={stage.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-medium text-gray-900">{stage.lead.name}</h4>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stageColors[stage.stage]}`}>
                      {stageLabels[stage.stage]}
                    </span>
                    {stage.probability && (
                      <span className="text-sm text-gray-500">{stage.probability}%</span>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    <p>{stage.lead.email}</p>
                    {stage.lead.phone && <p>{stage.lead.phone}</p>}
                  </div>

                  {stage.estimatedValue && (
                    <p className="text-lg font-semibold text-green-600 mb-2">
                      {formatCurrency(stage.estimatedValue)}
                    </p>
                  )}

                  {stage.nextAction && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                      <p className="text-sm font-medium text-blue-900">Next Action:</p>
                      <p className="text-sm text-blue-700">{stage.nextAction}</p>
                      {stage.nextActionDate && (
                        <p className="text-xs text-blue-600 mt-1">
                          Due: {formatDate(stage.nextActionDate)}
                        </p>
                      )}
                    </div>
                  )}

                  {stage.recentActivities.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-900 mb-2">Recent Activities:</p>
                      <div className="space-y-1">
                        {stage.recentActivities.map(activity => (
                          <div key={activity.id} className="text-xs text-gray-600">
                            <span className="font-medium">
                              {activityTypeLabels[activity.activityType] || activity.activityType}:
                            </span>
                            <span className="ml-1">{activity.description}</span>
                            <span className="ml-2 text-gray-500">
                              {formatDateTime(activity.createdAt)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="ml-6 flex flex-col space-y-2">
                  <button
                    onClick={() => handleStageUpdate(stage)}
                    className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
                  >
                    Update Stage
                  </button>
                  <button
                    onClick={() => handleAddActivity(stage)}
                    className="px-4 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100"
                  >
                    Add Activity
                  </button>
                  <div className="text-xs text-gray-500">
                    <p>In stage: {formatDate(stage.enteredAt)}</p>
                    {stage.durationHours && (
                      <p>{stage.durationHours}h duration</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {stages.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No active deals in your pipeline.</p>
          </div>
        )}
      </div>

      {/* Stage Update Modal */}
      {showStageModal && selectedLead && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Update Pipeline Stage - {selectedLead.lead.name}
                </h3>
                <button
                  onClick={() => setShowStageModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleStageSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                  <select
                    value={stageForm.stage}
                    onChange={(e) => setStageForm({ ...stageForm, stage: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {Object.entries(stageLabels).map(([stage, label]) => (
                      <option key={stage} value={stage}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Probability (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={stageForm.probability}
                    onChange={(e) => setStageForm({ ...stageForm, probability: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Value</label>
                  <input
                    type="number"
                    step="0.01"
                    value={stageForm.estimatedValue}
                    onChange={(e) => setStageForm({ ...stageForm, estimatedValue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Next Action</label>
                  <input
                    type="text"
                    value={stageForm.nextAction}
                    onChange={(e) => setStageForm({ ...stageForm, nextAction: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Next Action Date</label>
                  <input
                    type="date"
                    value={stageForm.nextActionDate}
                    onChange={(e) => setStageForm({ ...stageForm, nextActionDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={stageForm.notes}
                    onChange={(e) => setStageForm({ ...stageForm, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowStageModal(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    Update Stage
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Activity Modal */}
      {selectedLead && (
        <PipelineActivityModal
          isOpen={showActivityModal}
          onClose={() => {
            setShowActivityModal(false);
            setSelectedLead(null);
          }}
          assignmentId={selectedLead.assignmentId || selectedLead.id}
          leadName={selectedLead.lead.name}
          salesManagerId={user?.id || ""}
          onActivityAdded={() => {
            loadPipelineData();
          }}
        />
      )}
    </div>
  );
}