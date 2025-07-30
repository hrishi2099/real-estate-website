'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Plot } from '@prisma/client';

type PlotWithBuyer = Plot & {
  buyer?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
};

interface PlotMapProps {
  plots: PlotWithBuyer[];
  onPlotClick: (plot: PlotWithBuyer) => void;
  selectedPlot?: PlotWithBuyer | null;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
    plotMapClickHandler?: (plotId: string) => void;
  }
}

export default function PlotMap({ plots, onPlotClick, selectedPlot }: PlotMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapError, setMapError] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    // Check if API key is configured
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    setApiKey(key || null);
    
    if (!key || key === 'your-google-maps-api-key-here') {
      setMapError(true);
      return;
    }

    if (typeof window !== 'undefined' && !window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&callback=initMap`;
      script.async = true;
      script.defer = true;
      
      script.onerror = () => {
        setMapError(true);
      };
      
      window.initMap = initializeMap;
      document.head.appendChild(script);
    } else if (window.google) {
      initializeMap();
    }
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && plots.length > 0) {
      updateMarkers();
    }
  }, [plots, selectedPlot]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Clear markers on cleanup
      markersRef.current.forEach(marker => {
        if (marker && marker.setMap) {
          marker.setMap(null);
        }
      });
      markersRef.current = [];
      
      // Clean up global handler
      if (typeof window !== 'undefined' && window.plotMapClickHandler) {
        window.plotMapClickHandler = undefined;
      }
    };
  }, []);

  const initializeMap = () => {
    if (!mapRef.current) return;
    
    try {

    // Default center (you can adjust this based on your plot locations)
    const defaultCenter = plots.length > 0 && plots[0].latitude && plots[0].longitude
      ? { lat: plots[0].latitude, lng: plots[0].longitude }
      : { lat: 28.6139, lng: 77.2090 }; // Delhi, India as default

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      zoom: 15,
      center: defaultCenter,
      mapTypeId: window.google.maps.MapTypeId.SATELLITE,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: window.google.maps.ControlPosition.TOP_CENTER,
        mapTypeIds: [
          window.google.maps.MapTypeId.ROADMAP,
          window.google.maps.MapTypeId.SATELLITE,
          window.google.maps.MapTypeId.HYBRID,
          window.google.maps.MapTypeId.TERRAIN
        ]
      },
      zoomControl: true,
      streetViewControl: true,
      fullscreenControl: true,
    });

    updateMarkers();
    } catch (error) {
      console.error('Error initializing Google Maps:', error);
      setMapError(true);
    }
  };

  const updateMarkers = useCallback(() => {
    try {
      // Clear existing markers
      markersRef.current.forEach(marker => {
        if (marker && marker.setMap) {
          marker.setMap(null);
        }
      });
      markersRef.current = [];

      if (!mapInstanceRef.current || !window.google) return;

    plots.forEach((plot) => {
      if (!plot.latitude || !plot.longitude) return;

      const position = { lat: plot.latitude, lng: plot.longitude };
      
      // Determine marker color based on status
      let markerColor = '#4CAF50'; // Green for available
      if (plot.status === 'SOLD') markerColor = '#F44336'; // Red for sold
      else if (plot.status === 'RESERVED') markerColor = '#FF9800'; // Orange for reserved
      else if (plot.status === 'INACTIVE') markerColor = '#9E9E9E'; // Gray for inactive

      // Create custom marker icon
      const markerIcon = {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: selectedPlot?.id === plot.id ? 12 : 8,
        fillColor: markerColor,
        fillOpacity: 0.8,
        strokeColor: '#FFFFFF',
        strokeWeight: 2,
      };

      const marker = new window.google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        icon: markerIcon,
        title: `Plot #${plot.plotNumber} - ${plot.status}`,
        animation: selectedPlot?.id === plot.id ? window.google.maps.Animation.BOUNCE : null,
      });

      // Create info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">
              Plot #${plot.plotNumber}
            </h3>
            <p style="margin: 4px 0; font-size: 14px;">
              <strong>Area:</strong> ${plot.area} sq ft
            </p>
            <p style="margin: 4px 0; font-size: 14px;">
              <strong>Price:</strong> $${plot.price.toLocaleString()}
            </p>
            <p style="margin: 4px 0; font-size: 14px;">
              <strong>Status:</strong> 
              <span style="
                padding: 2px 6px; 
                border-radius: 4px; 
                font-size: 12px; 
                background-color: ${markerColor}20; 
                color: ${markerColor};
              ">
                ${plot.status}
              </span>
            </p>
            <p style="margin: 4px 0; font-size: 14px;">
              <strong>Location:</strong> ${plot.location}
            </p>
            ${plot.buyer ? `
              <p style="margin: 4px 0; font-size: 14px;">
                <strong>Buyer:</strong> ${plot.buyer.name}
              </p>
            ` : ''}
            <button 
              onclick="window.plotMapClickHandler('${plot.id}')"
              style="
                margin-top: 8px;
                padding: 4px 8px;
                background-color: #2196F3;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
              "
            >
              View Details
            </button>
          </div>
        `
      });

      marker.addListener('click', () => {
        // Close all other info windows
        markersRef.current.forEach(m => {
          if (m.infoWindow) m.infoWindow.close();
        });
        
        infoWindow.open(mapInstanceRef.current, marker);
        onPlotClick(plot);
      });

      // Store info window reference
      marker.infoWindow = infoWindow;
      markersRef.current.push(marker);

      // Open info window for selected plot
      if (selectedPlot?.id === plot.id) {
        infoWindow.open(mapInstanceRef.current, marker);
        mapInstanceRef.current.panTo(position);
      }
    });

    // Set up global click handler for info window buttons
    if (typeof window !== 'undefined') {
      window.plotMapClickHandler = (plotId: string) => {
        const plot = plots.find(p => p.id === plotId);
        if (plot) onPlotClick(plot);
      };
    }

    // Fit map to show all markers
    if (plots.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      plots.forEach(plot => {
        if (plot.latitude && plot.longitude) {
          bounds.extend({ lat: plot.latitude, lng: plot.longitude });
        }
      });
      
      if (!bounds.isEmpty()) {
        mapInstanceRef.current.fitBounds(bounds);
        
        // Ensure minimum zoom level
        const listener = window.google.maps.event.addListener(mapInstanceRef.current, 'idle', () => {
          if (mapInstanceRef.current.getZoom() > 18) {
            mapInstanceRef.current.setZoom(18);
          }
          window.google.maps.event.removeListener(listener);
        });
      }
    }
    } catch (error) {
      console.error('Error updating markers:', error);
    }
  }, [plots, selectedPlot, onPlotClick]);

  // Fallback map for when Google Maps API is not available
  if (mapError) {
    return (
      <div className="relative">
        <div className="w-full h-96 rounded-lg border border-gray-300 bg-gray-100 flex flex-col items-center justify-center">
          <div className="text-center p-6">
            <div className="mb-4">
              <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Google Maps Not Available</h3>
            <p className="text-gray-600 text-sm mb-4">
              To view plots on the map, you need to configure Google Maps API key.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <h4 className="font-semibold text-blue-800 mb-2">Setup Instructions:</h4>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" className="underline">Google Cloud Console</a></li>
                <li>Create a new API key</li>
                <li>Enable Maps JavaScript API</li>
                <li>Add the key to your .env file as NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</li>
                <li>Restart your development server</li>
              </ol>
            </div>
          </div>
        </div>
        
        {/* Plot List as fallback */}
        <div className="mt-6 bg-white rounded-lg border border-gray-300 p-4">
          <h4 className="font-semibold mb-3">Plot Locations (List View)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {plots.map((plot) => (
              <div
                key={plot.id}
                onClick={() => onPlotClick(plot)}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedPlot?.id === plot.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium">Plot #{plot.plotNumber}</h5>
                    <p className="text-sm text-gray-600">{plot.location}</p>
                    <p className="text-sm text-gray-600">{plot.area} sq ft - ${plot.price.toLocaleString()}</p>
                    {plot.latitude && plot.longitude && (
                      <p className="text-xs text-gray-500">
                        📍 {plot.latitude.toFixed(4)}, {plot.longitude.toFixed(4)}
                      </p>
                    )}
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
        
        {/* Legend */}
        <div className="mt-4 bg-white rounded-lg border border-gray-300 p-3">
          <h4 className="font-semibold mb-2 text-sm">Plot Status</h4>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span>Sold</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
              <span>Reserved</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
              <span>Inactive</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        className="w-full h-96 rounded-lg border border-gray-300"
        style={{ minHeight: '400px' }}
      />
      
      {/* Map Legend */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md p-3 text-sm">
        <h4 className="font-semibold mb-2">Plot Status</h4>
        <div className="space-y-1">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span>Sold</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
            <span>Reserved</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
            <span>Inactive</span>
          </div>
        </div>
      </div>
    </div>
  );
}