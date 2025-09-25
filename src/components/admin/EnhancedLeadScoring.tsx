"use client";

import React, { useState, useEffect } from 'react';
import { LeadGrade } from '@prisma/client';

interface Lead {
  id: string;
  leadId: string;
  name: string;
  email: string;
  phone?: string;
  score: number;
  grade: string;
  priority: string;
  lastActivity?: Date;
  seriousBuyerIndicator: boolean;
  budgetEstimate?: number;
  createdAt: Date;
  salesManagerName?: string;
  salesManagerEmail?: string;
}

interface ScoreBreakdown {
  propertyViews: number;
  inquiries: number;
  contactForms: number;
  favorites: number;
  returnVisits: number;
  sessionDuration: number;
  daysActive: number;
  budgetMatch: number;
  recentActivity: number;
}

interface LeadInsights {
  totalLeads: number;
  averageScore: number;
  gradeDistribution: Record<string, number>;
  topPerformers: Lead[];
  recentActivity: number;
}

export default function EnhancedLeadScoring() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [insights, setInsights] = useState<LeadInsights | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [scoreBreakdown, setScoreBreakdown] = useState<ScoreBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<'score' | 'lastActivity' | 'created'>('score');
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);

  // Mock data - replace with real API calls
  useEffect(() => {
    const mockLeads: Lead[] = [
      {
        id: '1',
        leadId: 'lead1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+91 9876543210',
        score: 85,
        grade: 'HOT',
        priority: 'HIGH',
        lastActivity: new Date('2024-01-15'),
        seriousBuyerIndicator: true,
        budgetEstimate: 2500000,
        createdAt: new Date('2024-01-10'),
        salesManagerName: 'Alice Smith'
      },
      {
        id: '2',
        leadId: 'lead2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        score: 65,
        grade: 'WARM',
        priority: 'MEDIUM',
        lastActivity: new Date('2024-01-14'),
        seriousBuyerIndicator: false,
        budgetEstimate: 1800000,
        createdAt: new Date('2024-01-08'),
      },
      {
        id: '3',
        leadId: 'lead3',
        name: 'Bob Johnson',
        email: 'bob@example.com',
        phone: '+91 9876543211',
        score: 45,
        grade: 'COLD',
        priority: 'LOW',
        lastActivity: new Date('2024-01-12'),
        seriousBuyerIndicator: false,
        createdAt: new Date('2024-01-05'),
      }
    ];

    const mockInsights: LeadInsights = {
      totalLeads: 156,
      averageScore: 62,
      gradeDistribution: {
        QUALIFIED: 12,
        HOT: 28,
        WARM: 45,
        COLD: 71
      },
      topPerformers: mockLeads.slice(0, 3),
      recentActivity: 23
    };

    setLeads(mockLeads);
    setInsights(mockInsights);
    setLoading(false);
  }, []);

  const handleViewBreakdown = async (lead: Lead) => {
    setSelectedLead(lead);

    // Mock breakdown data - replace with real API call
    const mockBreakdown: ScoreBreakdown = {
      propertyViews: 15,
      inquiries: 8,
      contactForms: 12,
      favorites: 6,
      returnVisits: 5,
      sessionDuration: 18,
      daysActive: 10,
      budgetMatch: 8,
      recentActivity: 15
    };

    setScoreBreakdown(mockBreakdown);
    setShowBreakdownModal(true);
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'QUALIFIED': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'HOT': return 'bg-red-100 text-red-800 border-red-200';
      case 'WARM': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'COLD': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const ScoreProgress = ({ score }: { score: number }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={`h-2 rounded-full transition-all duration-300 ${
          score >= 80 ? 'bg-green-500' :
          score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
        }`}
        style={{ width: `${score}%` }}
      />
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Enhanced Lead Scoring Dashboard</h1>
        <p className="text-blue-100">Advanced analytics and insights for better lead management</p>
      </div>

      {/* Insights Cards */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">{insights.totalLeads}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{insights.averageScore}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hot Leads</p>
                <p className="text-2xl font-bold text-gray-900">{insights.gradeDistribution.HOT}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Recent Activity</p>
                <p className="text-2xl font-bold text-gray-900">{insights.recentActivity}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grade Distribution Chart */}
      {insights && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Grade Distribution</h3>
          <div className="space-y-3">
            {Object.entries(insights.gradeDistribution).map(([grade, count]) => (
              <div key={grade} className="flex items-center">
                <div className="w-20 text-sm font-medium text-gray-700">{grade}</div>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        grade === 'QUALIFIED' ? 'bg-purple-500' :
                        grade === 'HOT' ? 'bg-red-500' :
                        grade === 'WARM' ? 'bg-orange-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${(count / insights.totalLeads) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="w-12 text-sm font-medium text-gray-700">{count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div>
              <label htmlFor="grade-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Grade
              </label>
              <select
                id="grade-filter"
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="all">All Grades</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="HOT">Hot</option>
                <option value="WARM">Warm</option>
                <option value="COLD">Cold</option>
              </select>
            </div>

            <div>
              <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">
                Sort by
              </label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="score">Score</option>
                <option value="lastActivity">Last Activity</option>
                <option value="created">Date Created</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Lead Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Lead Details</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                        <div className="text-sm text-gray-500">{lead.email}</div>
                        {lead.phone && (
                          <div className="text-xs text-gray-400">{lead.phone}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex flex-col space-y-1">
                        <span className={`text-2xl font-bold ${getScoreColor(lead.score)}`}>
                          {lead.score}
                        </span>
                        <ScoreProgress score={lead.score} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getGradeColor(lead.grade)}`}>
                      {lead.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lead.budgetEstimate ?
                      `₹${(lead.budgetEstimate / 100000).toFixed(1)}L` :
                      'Not specified'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.lastActivity ?
                      new Date(lead.lastActivity).toLocaleDateString() :
                      'No activity'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleViewBreakdown(lead)}
                      className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                    >
                      View Breakdown
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Score Breakdown Modal */}
      {showBreakdownModal && selectedLead && scoreBreakdown && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={() => setShowBreakdownModal(false)}>
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-lg bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Score Breakdown - {selectedLead.name}
              </h3>
              <button
                onClick={() => setShowBreakdownModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {Object.entries(scoreBreakdown).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((value / 25) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-900 w-8">{value}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-blue-900">Total Score</span>
                <span className="text-2xl font-bold text-blue-600">{selectedLead.score}/100</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}