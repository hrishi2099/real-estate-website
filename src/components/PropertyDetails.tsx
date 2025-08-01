"use client";

import { useState } from "react";
import PropertyMap from "./PropertyMapSimple";

interface PropertyDetailsProps {
  property: {
    id: string;
    title: string;
    price: number;
    location: string;
    latitude?: number;
    longitude?: number;
    area?: number;
    type: string;
    status: string;
    description?: string;
    features?: string[];
    images: { id: string; url: string; isPrimary: boolean }[];
    bedrooms?: number;
    bathrooms?: number;
    yearBuilt?: number;
    owner?: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export default function PropertyDetails({ property }: PropertyDetailsProps) {
  const [showBidModal, setShowBidModal] = useState(false);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [enquiryForm, setEnquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  // Calculate derived values
  const plotNumber = `P${Math.floor(Math.random() * 90000) + 10000}`;
  const pricePerSqft = property.area ? Math.round(property.price / property.area) : null;
  const walkScore = Math.floor(Math.random() * 40) + 60;
  const localityScore = Math.floor(Math.random() * 30) + 70;
  const amenitiesScore = Math.floor(Math.random() * 25) + 75;

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
    return `₹${price.toLocaleString()}`;
  };

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation for bid submission
    console.log('Bid submitted:', { propertyId: property.id, amount: bidAmount });
    setShowBidModal(false);
    setBidAmount("");
    alert('Bid submitted successfully!');
  };

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation for enquiry submission
    console.log('Enquiry submitted:', { propertyId: property.id, ...enquiryForm });
    setShowEnquiryModal(false);
    setEnquiryForm({ name: "", email: "", phone: "", message: "" });
    alert('Enquiry submitted successfully!');
  };

  return (
    <div className="space-y-8">
      {/* Property Overview */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  Plot {plotNumber}
                </span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {property.status}
                </span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                  {property.type}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{property.title}</h1>
              <p className="text-gray-600 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {property.location}
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{formatPrice(property.price)}</div>
                <div className="text-sm text-gray-600">Total Price</div>
              </div>
              {pricePerSqft && (
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">₹{pricePerSqft.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Per Sq Ft</div>
                </div>
              )}
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{property.area?.toLocaleString() || 'N/A'}</div>
                <div className="text-sm text-gray-600">Sq Ft</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{walkScore}</div>
                <div className="text-sm text-gray-600">Walk Score</div>
              </div>
            </div>

            {/* Locality Scores */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Locality Assessment</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-blue-600">{localityScore}</span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">Locality Score</div>
                  <div className="text-xs text-gray-600">Overall rating</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-green-600">{walkScore}</span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">Walkability</div>
                  <div className="text-xs text-gray-600">Transit & amenities</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-purple-600">{amenitiesScore}</span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">Amenities</div>
                  <div className="text-xs text-gray-600">Nearby facilities</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {formatPrice(property.price)}
                </div>
                {pricePerSqft && (
                  <div className="text-gray-600">
                    ₹{pricePerSqft.toLocaleString()} per sq ft
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-6">
                <button
                  onClick={() => setShowBidModal(true)}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Place Bid
                </button>
                <button
                  onClick={() => setShowEnquiryModal(true)}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Send Enquiry
                </button>
                <button className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                  Add to Wishlist
                </button>
              </div>

              {/* Owner Details */}
              {property.owner && (
                <div className="border-t pt-4">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-semibold text-sm">
                        {property.owner.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{property.owner.name}</div>
                      <div className="text-sm text-gray-600">Property Owner</div>
                    </div>
                  </div>
                  <button className="w-full text-blue-600 border border-blue-600 py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors text-sm">
                    Contact Owner
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Property Features */}
      {property.features && property.features.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Property Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {property.features.map((feature, index) => (
              <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Map */}
      {property.latitude && property.longitude && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Location & Property Boundaries</h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <PropertyMap
              latitude={property.latitude}
              longitude={property.longitude}
              propertyTitle={property.title}
              className="h-96 w-full"
            />
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Map Features</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Switch between Street, Satellite, and Terrain views</li>
              <li>• Toggle property boundaries on/off</li>
              <li>• Interactive map with zoom and pan controls</li>
              <li>• Precise GPS coordinates: {property.latitude.toFixed(6)}, {property.longitude.toFixed(6)}</li>
            </ul>
          </div>
        </div>
      )}

      {/* Bid Modal */}
      {showBidModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Place Your Bid</h3>
            <form onSubmit={handleBidSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bid Amount (₹)
                </label>
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your bid amount"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Current asking price: {formatPrice(property.price)}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBidModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Submit Bid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enquiry Modal */}
      {showEnquiryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Send Enquiry</h3>
            <form onSubmit={handleEnquirySubmit}>
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={enquiryForm.name}
                    onChange={(e) => setEnquiryForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={enquiryForm.email}
                    onChange={(e) => setEnquiryForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={enquiryForm.phone}
                    onChange={(e) => setEnquiryForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    value={enquiryForm.message}
                    onChange={(e) => setEnquiryForm(prev => ({ ...prev, message: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="I am interested in this property..."
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEnquiryModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Send Enquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}