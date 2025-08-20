"use client";

import { useState, useEffect } from "react";

interface LeadScore {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  leadScore: {
    score: number;
    grade: string;
    lastActivity?: Date;
    seriousBuyerIndicator: boolean;
    budgetEstimate?: number;
  };
}

interface ScoreBreakdown {
  score: number;
  grade: string;
  breakdown: Record<string, number>;
}

export default function LeadsManagement() {
  const [leads, setLeads] = useState<LeadScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [scoreBreakdown, setScoreBreakdown] = useState<ScoreBreakdown | null>(null);
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    const loadLeads = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams();
        if (gradeFilter !== "all") {
          params.append("grade", gradeFilter);
        }
        params.append("limit", "100");
  
        const response = await fetch(`/api/admin/leads?${params}`);
        const data = await response.json();
  
        if (data.success) {
          setLeads(data.data || []);
        } else {
          setError(data.error || "Failed to load leads");
        }
      } catch (err) {
        setError("Failed to load leads");
        console.error("Error loading leads:", err);
      } finally {
        setLoading(false);
      }
    };
    loadLeads();
  }, [gradeFilter]);

  const handleViewBreakdown = async (userId: string) => {
    try {
      setSelectedUserId(userId);
      const response = await fetch(`/api/admin/leads/${userId}`);
      const data = await response.json();

      if (data.success) {
        setScoreBreakdown(data.data);
        setShowBreakdownModal(true);
      } else {
        setError(data.error || "Failed to load score breakdown");
      }
    } catch (err) {
      setError("Failed to load score breakdown");
      console.error("Error loading breakdown:", err);
    }
  };

  const handleRecalculateAll = async () => {
    if (!confirm("This will recalculate scores for all users. Continue?")) {
      return;
    }

    try {
      setRecalculating(true);
      const response = await fetch("/api/admin/leads/recalculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.success) {
        await loadLeads(); // Reload data
      } else {
        setError(data.error || "Failed to recalculate scores");
      }
    } catch (err) {
      setError("Failed to recalculate scores");
      console.error("Error recalculating:", err);
    } finally {
      setRecalculating(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "QUALIFIED": return "bg-purple-100 text-purple-800";
      case "HOT": return "bg-red-100 text-red-800";
      case "WARM": return "bg-orange-100 text-orange-800";
      case "COLD": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 81) return "text-purple-600 font-bold";
    if (score >= 61) return "text-red-600 font-bold";
    if (score >= 31) return "text-orange-600 font-bold";
    return "text-blue-600";
  };

  const filteredLeads = leads.filter(lead => {
    if (gradeFilter === "all") return true;
    return lead.leadScore.grade === gradeFilter;
  });

  const gradeStats = {
    total: leads.length,
    qualified: leads.filter(l => l.leadScore.grade === "QUALIFIED").length,
    hot: leads.filter(l => l.leadScore.grade === "HOT").length,
    warm: leads.filter(l => l.leadScore.grade === "WARM").length,
    cold: leads.filter(l => l.leadScore.grade === "COLD").length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Lead Scoring</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading leads...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Lead Scoring</h1>
          <button 
            onClick={loadLeads}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading leads</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Lead Scoring</h1>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button 
            onClick={loadLeads}
            disabled={loading}
            className="flex-1 sm:flex-none bg-gray-100 text-gray-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm touch-manipulation"
          >
            <svg className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">{loading ? 'Refreshing...' : 'Refresh'}</span>
            <span className="sm:hidden">{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <button 
            onClick={handleRecalculateAll}
            disabled={recalculating}
            className="flex-1 sm:flex-none bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm touch-manipulation"
          >
            <svg className={`w-4 h-4 mr-2 ${recalculating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">{recalculating ? 'Recalculating...' : 'Recalculate All'}</span>
            <span className="sm:hidden">{recalculating ? 'Recalc All' : 'Recalc All'}</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-lg sm:text-2xl font-bold text-gray-900">{gradeStats.total}</div>
          <div className="text-xs sm:text-sm text-gray-600">Total Leads</div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-lg sm:text-2xl font-bold text-purple-600">{gradeStats.qualified}</div>
          <div className="text-xs sm:text-sm text-gray-600">Qualified</div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-lg sm:text-2xl font-bold text-red-600">{gradeStats.hot}</div>
          <div className="text-xs sm:text-sm text-gray-600">Hot</div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-lg sm:text-2xl font-bold text-orange-600">{gradeStats.warm}</div>
          <div className="text-xs sm:text-sm text-gray-600">Warm</div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-lg sm:text-2xl font-bold text-blue-600">{gradeStats.cold}</div>
          <div className="text-xs sm:text-sm text-gray-600">Cold</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="mb-4 sm:mb-6">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
            <button
              onClick={() => setGradeFilter('all')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium touch-manipulation ${
                gradeFilter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="hidden sm:inline">All Grades</span>
              <span className="sm:hidden">All</span>
            </button>
            <button
              onClick={() => setGradeFilter('QUALIFIED')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium touch-manipulation ${
                gradeFilter === 'QUALIFIED' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Qualified
            </button>
            <button
              onClick={() => setGradeFilter('HOT')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium touch-manipulation ${
                gradeFilter === 'HOT' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Hot
            </button>
            <button
              onClick={() => setGradeFilter('WARM')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium touch-manipulation ${
                gradeFilter === 'WARM' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Warm
            </button>
            <button
              onClick={() => setGradeFilter('COLD')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium touch-manipulation ${
                gradeFilter === 'COLD' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cold
            </button>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score & Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget Estimate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.map((lead) => (
                <tr key={lead.user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                        {lead.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{lead.user.name}</div>
                        <div className="text-sm text-gray-500">{lead.user.email}</div>
                        {lead.user.phone && (
                          <div className="text-sm text-gray-500">{lead.user.phone}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className={`text-2xl font-bold ${getScoreColor(lead.leadScore.score)}`}>
                        {lead.leadScore.score}
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(lead.leadScore.grade)}`}>
                        {lead.leadScore.grade}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {lead.leadScore.seriousBuyerIndicator ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <svg className="w-2 h-2 mr-1" fill="currentColor" viewBox="0 0 8 8">
                            <circle cx={4} cy={4} r={3} />
                          </svg>
                          Serious Buyer
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <svg className="w-2 h-2 mr-1" fill="currentColor" viewBox="0 0 8 8">
                            <circle cx={4} cy={4} r={3} />
                          </svg>
                          Browser
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lead.leadScore.budgetEstimate 
                      ? `$${lead.leadScore.budgetEstimate.toLocaleString()}`
                      : 'Unknown'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.leadScore.lastActivity 
                      ? new Date(lead.leadScore.lastActivity).toLocaleDateString()
                      : 'No activity'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleViewBreakdown(lead.user.id)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View Details
                    </button>
                    <a 
                      href={`mailto:${lead.user.email}`}
                      className="text-green-600 hover:text-green-900"
                    >
                      Contact
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {filteredLeads.map((lead) => (
            <div key={lead.user.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                  {lead.user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{lead.user.name}</h3>
                      <p className="text-sm text-gray-500 truncate">{lead.user.email}</p>
                      {lead.user.phone && (
                        <p className="text-sm text-gray-500 truncate">{lead.user.phone}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-1 ml-2">
                      <div className={`text-lg font-bold ${getScoreColor(lead.leadScore.score)}`}>
                        {lead.leadScore.score}
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(lead.leadScore.grade)}`}>
                        {lead.leadScore.grade}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Status: </span>
                      {lead.leadScore.seriousBuyerIndicator ? (
                        <span className="text-green-600 font-medium">Serious</span>
                      ) : (
                        <span className="text-gray-600">Browser</span>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-600">Budget: </span>
                      <span className="font-medium">
                        {lead.leadScore.budgetEstimate 
                          ? `$${lead.leadScore.budgetEstimate.toLocaleString()}`
                          : 'Unknown'
                        }
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Last Activity: </span>
                      <span className="font-medium">
                        {lead.leadScore.lastActivity 
                          ? new Date(lead.leadScore.lastActivity).toLocaleDateString()
                          : 'No activity'
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex space-x-3">
                    <button 
                      onClick={() => handleViewBreakdown(lead.user.id)}
                      className="flex-1 bg-blue-600 text-white text-center py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm touch-manipulation"
                    >
                      View Details
                    </button>
                    <a 
                      href={`mailto:${lead.user.email}`}
                      className="flex-1 bg-green-600 text-white text-center py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm touch-manipulation"
                    >
                      Contact
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredLeads.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No leads found for the selected filters.</p>
          </div>
        )}
      </div>

      {/* Score Breakdown Modal */}
      {showBreakdownModal && scoreBreakdown && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
          <div className="relative top-4 sm:top-20 mx-auto p-4 sm:p-5 border w-full max-w-md sm:w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-900">Score Breakdown</h3>
                <button
                  onClick={() => {
                    setShowBreakdownModal(false);
                    setScoreBreakdown(null);
                    setSelectedUserId(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1 touch-manipulation"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-base sm:text-lg font-medium">Total Score</span>
                  <span className={`text-lg sm:text-xl font-bold ${getScoreColor(scoreBreakdown.score)}`}>
                    {scoreBreakdown.score}
                  </span>
                </div>
                
                <div className="flex items-center justify-center">
                  <span className={`inline-flex px-3 sm:px-4 py-2 text-sm font-semibold rounded-full ${getGradeColor(scoreBreakdown.grade)}`}>
                    {scoreBreakdown.grade} LEAD
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm sm:text-base font-medium text-gray-900">Score Components:</h4>
                  {Object.entries(scoreBreakdown.breakdown).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-1">
                      <span className="text-xs sm:text-sm text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </span>
                      <span className="text-xs sm:text-sm font-medium">{Math.round(value as number)} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}