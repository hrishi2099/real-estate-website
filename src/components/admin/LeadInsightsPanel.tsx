"use client";

import React, { useState, useEffect } from 'react';

interface LeadTrend {
  date: string;
  score: number;
  grade: string;
  activities: number;
}

interface PropertyInterest {
  propertyType: string;
  views: number;
  inquiries: number;
  avgBudget: number;
}

interface BehavioralInsight {
  leadId: string;
  name: string;
  patterns: string[];
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export default function LeadInsightsPanel() {
  const [activeTab, setActiveTab] = useState<'trends' | 'behavior' | 'predictions'>('trends');
  const [loading, setLoading] = useState(false);

  // Mock data
  const leadTrends: LeadTrend[] = [
    { date: '2024-01-08', score: 45, grade: 'COLD', activities: 2 },
    { date: '2024-01-09', score: 52, grade: 'COLD', activities: 4 },
    { date: '2024-01-10', score: 61, grade: 'WARM', activities: 3 },
    { date: '2024-01-11', score: 68, grade: 'WARM', activities: 5 },
    { date: '2024-01-12', score: 75, grade: 'WARM', activities: 6 },
    { date: '2024-01-13', score: 82, grade: 'HOT', activities: 8 },
    { date: '2024-01-14', score: 85, grade: 'HOT', activities: 4 },
  ];

  const propertyInterests: PropertyInterest[] = [
    { propertyType: 'Villa', views: 45, inquiries: 12, avgBudget: 3500000 },
    { propertyType: 'Apartment', views: 38, inquiries: 8, avgBudget: 2800000 },
    { propertyType: 'Plot', views: 22, inquiries: 5, avgBudget: 1500000 },
    { propertyType: 'Commercial', views: 15, inquiries: 3, avgBudget: 5000000 },
  ];

  const behavioralInsights: BehavioralInsight[] = [
    {
      leadId: '1',
      name: 'John Doe',
      patterns: ['Views properties in evening', 'Prefers 3+ BHK', 'Compares multiple properties'],
      riskLevel: 'low',
      recommendations: ['Send evening newsletters', 'Show premium 3BHK options', 'Provide comparison tools']
    },
    {
      leadId: '2',
      name: 'Jane Smith',
      patterns: ['Inactive for 5 days', 'Last viewed budget properties', 'No phone engagement'],
      riskLevel: 'high',
      recommendations: ['Follow-up call needed', 'Send budget-friendly options', 'Offer virtual tour']
    },
  ];

  const TrendsTab = () => (
    <div className="space-y-6">
      {/* Score Trend Chart */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Progression (Last 7 Days)</h3>
        <div className="relative">
          <div className="flex items-end justify-between h-64 mb-4">
            {leadTrends.map((trend, index) => (
              <div key={index} className="flex flex-col items-center flex-1 mx-1">
                <div className="mb-2 px-2 py-1 bg-blue-100 rounded text-xs text-blue-800 font-medium">
                  {trend.score}
                </div>
                <div
                  className={`w-full rounded-t transition-all duration-500 ${
                    trend.score >= 80 ? 'bg-green-500' :
                    trend.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ height: `${(trend.score / 100) * 200}px` }}
                />
                <div className="mt-2 text-xs text-gray-600 text-center">
                  {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                Hot (80+)
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                Warm (60-79)
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                Cold (0-59)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Heatmap */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Heatmap</h3>
        <div className="grid grid-cols-7 gap-2">
          {leadTrends.map((trend, index) => (
            <div key={index} className="text-center">
              <div className="text-xs text-gray-600 mb-1">
                {new Date(trend.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div
                className={`h-12 rounded flex items-center justify-center text-white font-medium ${
                  trend.activities >= 6 ? 'bg-green-500' :
                  trend.activities >= 4 ? 'bg-yellow-500' :
                  trend.activities >= 2 ? 'bg-orange-500' : 'bg-gray-300'
                }`}
              >
                {trend.activities}
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-3">Daily activity count - Higher numbers indicate more engagement</p>
      </div>

      {/* Property Interest Breakdown */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Interest Analysis</h3>
        <div className="space-y-4">
          {propertyInterests.map((interest, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900">{interest.propertyType}</h4>
                <span className="text-sm text-gray-600">₹{(interest.avgBudget / 100000).toFixed(1)}L avg</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Views: </span>
                  <span className="font-medium">{interest.views}</span>
                </div>
                <div>
                  <span className="text-gray-600">Inquiries: </span>
                  <span className="font-medium">{interest.inquiries}</span>
                </div>
              </div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(interest.inquiries / interest.views) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {((interest.inquiries / interest.views) * 100).toFixed(1)}% inquiry rate
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const BehaviorTab = () => (
    <div className="space-y-6">
      {behavioralInsights.map((insight, index) => (
        <div key={index} className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{insight.name}</h3>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                insight.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                insight.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {insight.riskLevel.toUpperCase()} RISK
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Behavioral Patterns</h4>
              <ul className="space-y-2">
                {insight.patterns.map((pattern, idx) => (
                  <li key={idx} className="flex items-start">
                    <svg className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-sm text-gray-700">{pattern}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">AI Recommendations</h4>
              <ul className="space-y-2">
                {insight.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start">
                    <svg className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const PredictionsTab = () => (
    <div className="space-y-6">
      {/* Conversion Probability */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Predictions</h3>
        <div className="space-y-4">
          {[
            { name: 'John Doe', probability: 85, timeFrame: '7-14 days', factors: ['High engagement', 'Budget match', 'Multiple inquiries'] },
            { name: 'Jane Smith', probability: 42, timeFrame: '30+ days', factors: ['Price sensitive', 'Irregular activity', 'Needs nurturing'] },
            { name: 'Bob Johnson', probability: 28, timeFrame: '45+ days', factors: ['Low engagement', 'Budget unclear', 'New to market'] },
          ].map((prediction, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{prediction.name}</h4>
                  <p className="text-sm text-gray-600">Expected conversion: {prediction.timeFrame}</p>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${
                    prediction.probability >= 70 ? 'text-green-600' :
                    prediction.probability >= 40 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {prediction.probability}%
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className={`h-2 rounded-full ${
                        prediction.probability >= 70 ? 'bg-green-500' :
                        prediction.probability >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${prediction.probability}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {prediction.factors.map((factor, idx) => (
                  <span key={idx} className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Insights */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Intelligence</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Peak Activity Times</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Weekday Evenings</span>
                <span className="text-sm font-medium">78% activity</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Weekend Mornings</span>
                <span className="text-sm font-medium">65% activity</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Lunch Hours</span>
                <span className="text-sm font-medium">45% activity</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Popular Search Filters</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Budget Range</span>
                <span className="text-sm font-medium">₹20L - ₹35L</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Preferred Area</span>
                <span className="text-sm font-medium">North Bangalore</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Property Type</span>
                <span className="text-sm font-medium">2-3 BHK</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'trends', name: 'Trends & Analytics', icon: '📈' },
            { id: 'behavior', name: 'Behavior Insights', icon: '🧠' },
            { id: 'predictions', name: 'AI Predictions', icon: '🔮' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } transition-colors duration-200`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {activeTab === 'trends' && <TrendsTab />}
          {activeTab === 'behavior' && <BehaviorTab />}
          {activeTab === 'predictions' && <PredictionsTab />}
        </>
      )}
    </div>
  );
}