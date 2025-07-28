'use client';

import { useState, useEffect } from 'react';
import PlotMap from '@/components/PlotMap';
import PlotStats from '@/components/PlotStats';
import PlotDetails from '@/components/PlotDetails';

interface Plot {
  id: string;
  plotNumber: string;
  area: number;
  price: number;
  location: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  status: 'AVAILABLE' | 'SOLD' | 'RESERVED' | 'INACTIVE';
  description?: string;
  features?: string;
  soldDate?: string;
  buyer?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface PlotStats {
  total: number;
  available: number;
  sold: number;
  reserved: number;
  inactive: number;
}

export default function PlotsPage() {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [stats, setStats] = useState<PlotStats>({
    total: 0,
    available: 0,
    sold: 0,
    reserved: 0,
    inactive: 0
  });
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    fetchPlots();
  }, [statusFilter]);

  const fetchPlots = async () => {
    try {
      setLoading(true);
      const url = statusFilter 
        ? `/api/plots?status=${statusFilter}`
        : '/api/plots';
      
      const response = await fetch(url);
      const data = await response.json();
      
      setPlots(data.plots);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching plots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlotClick = (plot: Plot) => {
    setSelectedPlot(plot);
  };

  const handleCloseDetails = () => {
    setSelectedPlot(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Plot Management</h1>
          
          {/* Plot Statistics */}
          <PlotStats stats={stats} />
          
          {/* Filter Options */}
          <div className="mt-6 flex gap-4">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Plots</option>
              <option value="AVAILABLE">Available</option>
              <option value="SOLD">Sold</option>
              <option value="RESERVED">Reserved</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Map Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Plot Locations</h2>
                <PlotMap 
                  plots={plots} 
                  onPlotClick={handlePlotClick}
                  selectedPlot={selectedPlot}
                />
              </div>
            </div>

            {/* Plot List Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">
                Plot List ({plots.length})
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {plots.map((plot) => (
                  <div
                    key={plot.id}
                    onClick={() => handlePlotClick(plot)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedPlot?.id === plot.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">Plot #{plot.plotNumber}</h3>
                        <p className="text-sm text-gray-600">{plot.area} sq ft</p>
                        <p className="text-sm text-gray-600">${plot.price.toLocaleString()}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        plot.status === 'AVAILABLE' 
                          ? 'bg-green-100 text-green-800'
                          : plot.status === 'SOLD'
                          ? 'bg-red-100 text-red-800'
                          : plot.status === 'RESERVED'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {plot.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Plot Details Modal */}
        {selectedPlot && (
          <PlotDetails 
            plot={selectedPlot} 
            onClose={handleCloseDetails}
          />
        )}
      </div>
    </div>
  );
}