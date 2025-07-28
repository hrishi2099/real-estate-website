'use client';

import { useState } from 'react';

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

interface PlotDetailsProps {
  plot: Plot;
  onClose: () => void;
}

export default function PlotDetails({ plot, onClose }: PlotDetailsProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'buyer' | 'location'>('details');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'SOLD':
        return 'bg-red-100 text-red-800';
      case 'RESERVED':
        return 'bg-yellow-100 text-yellow-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const features = plot.features ? JSON.parse(plot.features) : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Plot #{plot.plotNumber}
            </h2>
            <div className="flex items-center mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(plot.status)}`}>
                {plot.status}
              </span>
              <span className="ml-3 text-gray-600">
                {plot.area} sq ft • ${plot.price.toLocaleString()}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex px-6">
            {[
              { id: 'details', label: 'Plot Details' },
              { id: 'buyer', label: 'Buyer Information' },
              { id: 'location', label: 'Location & Map' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-4 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plot Number
                    </label>
                    <p className="text-gray-900">{plot.plotNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Area (sq ft)
                    </label>
                    <p className="text-gray-900">{plot.area.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price
                    </label>
                    <p className="text-gray-900">${plot.price.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price per sq ft
                    </label>
                    <p className="text-gray-900">
                      ${(plot.price / plot.area).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(plot.status)}`}>
                      {plot.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Listed Date
                    </label>
                    <p className="text-gray-900">{formatDate(plot.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {plot.description && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-gray-700">{plot.description}</p>
                </div>
              )}

              {/* Features */}
              {features.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Features</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {features.map((feature: string, index: number) => (
                      <div key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sale Information */}
              {plot.status === 'SOLD' && plot.soldDate && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Sale Information</h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800">
                      <strong>Sold Date:</strong> {formatDate(plot.soldDate)}
                    </p>
                    {plot.buyer && (
                      <p className="text-sm text-red-800 mt-1">
                        <strong>Buyer:</strong> {plot.buyer.name}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'buyer' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Buyer Information</h3>
              {plot.buyer ? (
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <p className="text-gray-900">{plot.buyer.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <p className="text-gray-900">{plot.buyer.email}</p>
                    </div>
                    {plot.buyer.phone && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <p className="text-gray-900">{plot.buyer.phone}</p>
                      </div>
                    )}
                    {plot.soldDate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Purchase Date
                        </label>
                        <p className="text-gray-900">{formatDate(plot.soldDate)}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-lg mb-2">No Buyer Information</div>
                  <p className="text-gray-600">
                    This plot is {plot.status.toLowerCase()} and has no associated buyer.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'location' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Location Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <p className="text-gray-900">{plot.location}</p>
                </div>
                {plot.address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <p className="text-gray-900">{plot.address}</p>
                  </div>
                )}
                {plot.latitude && plot.longitude && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Coordinates
                    </label>
                    <p className="text-gray-900">
                      {plot.latitude.toFixed(6)}, {plot.longitude.toFixed(6)}
                    </p>
                  </div>
                )}
                
                {/* Mini Map */}
                {plot.latitude && plot.longitude && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Map Location
                    </label>
                    <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
                      <iframe
                        src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${plot.longitude}!3d${plot.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM!5e1!3m2!1sen!2s!4v1234567890123`}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      ></iframe>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}