"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface Lead {
  id: string;
  assignedAt: string;
  status: string;
  priority: string;
  notes?: string;
  expectedCloseDate?: string;
  lead: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    score: number;
    grade: string;
    seriousBuyerIndicator: boolean;
  };
}

export default function SalesLeads() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const gradeColors = {
    HOT: "bg-red-100 text-red-800",
    WARM: "bg-orange-100 text-orange-800",
    COOL: "bg-yellow-100 text-yellow-800",
    COLD: "bg-gray-100 text-gray-800",
  };

  const priorityColors = {
    HIGH: "bg-red-100 text-red-800",
    NORMAL: "bg-yellow-100 text-yellow-800",
    LOW: "bg-green-100 text-green-800",
  };

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

  useEffect(() => {
    if (user?.id) {
      loadLeads();
    }
  }, [user?.id]);

  const loadLeads = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/lead-assignments?salesManagerId=${user?.id}`);
      const data = await response.json();

      if (data.success) {
        setLeads(data.data);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === "all") return matchesSearch;
    if (selectedFilter === "high_priority") return matchesSearch && lead.priority === "HIGH";
    if (selectedFilter === "hot") return matchesSearch && lead.lead.grade === "HOT";
    if (selectedFilter === "warm") return matchesSearch && lead.lead.grade === "WARM";
    if (selectedFilter === "new") return matchesSearch && lead.status === "ACTIVE";
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Leads</h1>
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
          <h1 className="text-2xl font-bold text-gray-900">My Leads</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Leads</h1>
          <p className="text-gray-600">Manage your assigned leads and track their progress</p>
        </div>
        <button 
          onClick={loadLeads}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <label className="block text-sm font-medium text-gray-700">Filter:</label>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Leads</option>
              <option value="high_priority">High Priority</option>
              <option value="hot">Hot Leads</option>
              <option value="warm">Warm Leads</option>
              <option value="new">New Leads</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="block text-sm font-medium text-gray-700">Search:</label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Leads List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Leads ({filteredLeads.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredLeads.map((lead) => (
            <div key={lead.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-medium text-gray-900">
                      {lead.lead.name}
                    </h4>
                    
                    {lead.lead && (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        gradeColors[lead.lead.grade as keyof typeof gradeColors]
                      }`}>
                        {lead.lead.grade} ({lead.lead.score})
                      </span>
                    )}
                    
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      priorityColors[lead.priority as keyof typeof priorityColors]
                    }`}>
                      {lead.priority}
                    </span>
                    
                    
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    <p>{lead.lead.email}</p>
                    {lead.lead.phone && <p>{lead.lead.phone}</p>}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">Assigned</p>
                      <p className="text-gray-600">{formatDate(lead.assignedAt)}</p>
                    </div>
                    
                    {lead.expectedCloseDate && (
                      <div>
                        <p className="font-medium text-gray-900">Expected Close</p>
                        <p className="text-gray-600">{formatDate(lead.expectedCloseDate)}</p>
                      </div>
                    )}
                    
                  </div>

                  {lead.notes && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-900">Notes:</p>
                      <p className="text-sm text-gray-600">{lead.notes}</p>
                    </div>
                  )}
                </div>

                <div className="ml-6 flex flex-col space-y-2">
                  <a
                    href={`/sales/pipeline`}
                    className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 text-center"
                  >
                    View Pipeline
                  </a>
                  
                  <button
                    onClick={() => window.open(`mailto:${lead.lead.email}`, '_blank')}
                    className="px-4 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100"
                  >
                    Send Email
                  </button>
                  
                  {lead.lead.phone && (
                    <button
                      onClick={() => window.open(`tel:${lead.lead.phone}`, '_blank')}
                      className="px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100"
                    >
                      Call
                    </button>
                  )}

                  <div className="text-xs text-gray-500 pt-2">
                    {lead.lead.seriousBuyerIndicator && (
                      <div className="flex items-center text-green-600">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Serious Buyer
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredLeads.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No leads found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}