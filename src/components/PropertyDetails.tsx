"use client";

import { useState, useEffect } from "react";
import PropertyMap from "./PropertyMapSimple";
import GoogleEarthViewer from "./GoogleEarthViewer";

import { trackPropertyView, trackPropertyInquiry } from "@/lib/tracking";
import { getCachedLocalityScores } from "../lib/locality-scoring";
import { sanitizeHTML } from "@/lib/html-sanitizer";
import { FEATURE_FLAGS } from "@/lib/features";
import ClientOnly from "./ClientOnly";

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
    kmlFileUrl?: string | null;
    owner?: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export default function PropertyDetails({ property }: PropertyDetailsProps) {
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [mapView, setMapView] = useState<'standard' | 'earth'>('standard');
  const [enquiryForm, setEnquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  // Track property view on component mount
  useEffect(() => {
    // Track with the new universal tracking system
    trackPropertyView(property.id, property.title, property.price);
  }, [property.id, property.title, property.price]);

  // Calculate derived values
  const pricePerSqft = property.area ? Math.round(property.price / property.area) : null;
  
  // Calculate locality scores using custom algorithm
  const localityScores = getCachedLocalityScores({
    id: property.id,
    location: property.location,
    latitude: property.latitude,
    longitude: property.longitude,
    price: property.price,
    area: property.area,
    type: property.type,
    yearBuilt: property.yearBuilt
  });
  
  const { localityScore, walkScore, amenitiesScore } = localityScores;

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
    return `₹${price.toLocaleString()}`;
  };


  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Track with existing analytics system
      trackPropertyInquiry(property.id, property.title, 'enquiry');
      
      // Implementation for enquiry submission
      console.log('Enquiry submitted:', { propertyId: property.id, ...enquiryForm });
      
      setShowEnquiryModal(false);
      setEnquiryForm({ name: "", email: "", phone: "", message: "" });
      alert('Enquiry submitted successfully!');
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      alert('Error submitting enquiry. Please try again.');
    }
  };

  return (
    <>
      
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Property Overview */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2">
            <div className="mb-4 sm:mb-6">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                <span className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                  Property
                </span>
                <span className="bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                  {property.status}
                </span>
                <span className="bg-purple-100 text-purple-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                  {property.type === 'AGRICULTURAL_LAND' ? 'Agricultural Land' :
                   property.type === 'NA_LAND' ? 'NA Land' : property.type}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 leading-tight">{property.title}</h1>
              <p className="text-gray-600 flex items-start sm:items-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 mt-0.5 sm:mt-0 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm sm:text-base">{property.location}</span>
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600 break-words">{formatPrice(property.price)}</div>
                <div className="text-xs sm:text-sm text-gray-600">Total Price</div>
              </div>
              {pricePerSqft && (
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">₹{pricePerSqft.toLocaleString()}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Per Sq Ft</div>
                </div>
              )}
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">{property.area?.toLocaleString() || 'N/A'}</div>
                <div className="text-xs sm:text-sm text-gray-600">Sq Ft</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600">{walkScore}</div>
                <div className="text-xs sm:text-sm text-gray-600">Walk Score</div>
              </div>
            </div>

            {/* Locality Scores */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Locality Assessment</h3>
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-base sm:text-xl font-bold text-blue-600">{localityScore}</span>
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-gray-900">Locality Score</div>
                  <div className="text-xs text-gray-600 hidden sm:block">Overall rating</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-base sm:text-xl font-bold text-green-600">{walkScore}</span>
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-gray-900">Walkability</div>
                  <div className="text-xs text-gray-600 hidden sm:block">Transit & amenities</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-base sm:text-xl font-bold text-purple-600">{amenitiesScore}</span>
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-gray-900">Amenities</div>
                  <div className="text-xs text-gray-600 hidden sm:block">Nearby facilities</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Panel */}
          <div className="lg:col-span-1 order-first lg:order-last">
            <div className="bg-white border border-gray-200 lg:border-2 rounded-lg p-4 sm:p-6 lg:sticky lg:top-6">
              <div className="text-center mb-4 lg:mb-6">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 mb-1 lg:mb-2">
                  {formatPrice(property.price)}
                </div>
                {pricePerSqft && (
                  <div className="text-sm sm:text-base text-gray-600">
                    ₹{pricePerSqft.toLocaleString()} per sq ft
                  </div>
                )}
              </div>

              <div className="flex lg:flex-col space-x-3 lg:space-x-0 lg:space-y-3 mb-4 lg:mb-6">
                <button
                  onClick={() => setShowEnquiryModal(true)}
                  className="flex-1 lg:w-full bg-blue-600 text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base font-semibold hover:bg-blue-700 transition-colors touch-manipulation"
                >
                  Send Enquiry
                </button>
                <button className="flex-1 lg:w-full bg-gray-200 text-gray-700 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-300 transition-colors touch-manipulation">
                  Add to Wishlist
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Property Description */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">About This Property</h3>
        {property.description ? (
          <div className="bg-gray-50 rounded-lg p-6">
            {(() => {
              const sanitized = sanitizeHTML(property.description);
              const isPlainText = !sanitized.includes('<') || sanitized === property.description.replace(/<[^>]*>/g, '');

              if (isPlainText) {
                return (
                  <div
                    className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-line"
                  >
                    {sanitized}
                  </div>
                );
              } else {
                return (
                  <div
                    className="prose prose-gray prose-sm sm:prose-base max-w-none
                               prose-p:mb-4 prose-p:last:mb-0
                               prose-ul:mb-4 prose-ol:mb-4
                               prose-li:mb-1
                               prose-h3:font-semibold prose-h3:mb-2 prose-h3:mt-4 prose-h3:text-lg"
                    dangerouslySetInnerHTML={{ __html: sanitized }}
                  />
                );
              }
            })()}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-500 italic">No description available for this property.</p>
          </div>
        )}
      </div>

      {/* Property Features */}
      {property.features && property.features.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
            {property.type === 'AGRICULTURAL_LAND' || property.type === 'NA_LAND' ? 'Land Features' : 'Property Features'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            {property.features.map((feature, index) => (
              <div key={index} className="flex items-center p-2.5 sm:p-3 bg-gray-50 rounded-lg">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm sm:text-base text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Map */}
      {property.latitude && property.longitude && (
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-0">Location & Property View</h3>
            <ClientOnly>
              {FEATURE_FLAGS.GOOGLE_EARTH_ENABLED && (
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setMapView('standard')}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      mapView === 'standard'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    📍 Standard Map
                  </button>
                  <button
                    onClick={() => setMapView('earth')}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      mapView === 'earth'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    🌍 Earth View
                  </button>
                </div>
              )}
            </ClientOnly>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {mapView === 'standard' || !FEATURE_FLAGS.GOOGLE_EARTH_ENABLED ? (
              <PropertyMap
                latitude={property.latitude}
                longitude={property.longitude}
                propertyTitle={property.title}
                className="h-64 sm:h-80 lg:h-96 w-full"
              />
            ) : (
              <GoogleEarthViewer
                latitude={property.latitude}
                longitude={property.longitude}
                propertyTitle={property.title}
                kmlUrl={property.kmlFileUrl}
                className="w-full"
                height="384px"
              />
            )}
          </div>

          <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm sm:text-base font-semibold text-blue-900 mb-2">
              {mapView === 'earth' && FEATURE_FLAGS.GOOGLE_EARTH_ENABLED ? 'Earth View Features' : 'Map Features'}
            </h4>
            <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
              {mapView === 'earth' && FEATURE_FLAGS.GOOGLE_EARTH_ENABLED ? (
                <>
                  <li>• 3D satellite view with terrain details</li>
                  <li>• Interactive plot boundaries from KML data</li>
                  <li>• Zoom, rotate, and tilt controls</li>
                  {property.kmlFileUrl && <li>• 📊 Detailed plot information available</li>}
                </>
              ) : (
                <>
                  <li>• Switch between Street, Satellite, and Terrain views</li>
                  <li>• Toggle property boundaries on/off</li>
                  <li>• Interactive map with zoom and pan controls</li>
                </>
              )}
              <li className="hidden sm:block">• Precise GPS coordinates: {Number(property.latitude).toFixed(6)}, {Number(property.longitude).toFixed(6)}</li>
            </ul>
          </div>
        </div>
      )}


      {/* Enquiry Modal */}
      {showEnquiryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
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
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={enquiryForm.email}
                    onChange={(e) => setEnquiryForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={enquiryForm.phone}
                    onChange={(e) => setEnquiryForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    value={enquiryForm.message}
                    onChange={(e) => setEnquiryForm(prev => ({ ...prev, message: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base resize-none"
                    placeholder="I am interested in this property..."
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setShowEnquiryModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 touch-manipulation text-base font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 touch-manipulation text-base font-medium"
                >
                  Send Enquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </>
  );
}