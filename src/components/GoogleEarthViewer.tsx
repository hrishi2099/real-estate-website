"use client";

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface GoogleEarthViewerProps {
  kmlUrl?: string | null;
  kmlContent?: string;
  latitude: number;
  longitude: number;
  propertyTitle: string;
  className?: string;
  height?: string;
}

export default function GoogleEarthViewer({
  kmlUrl,
  kmlContent,
  latitude,
  longitude,
  propertyTitle,
  className = "w-full",
  height = "500px"
}: GoogleEarthViewerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'satellite' | 'earth'>('satellite');

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey) {
      setError('Google Maps API key is required');
      setIsLoading(false);
      return;
    }

    const initializeMap = async () => {
      try {
        const loader = new Loader({
          apiKey,
          version: 'weekly',
          libraries: ['geometry', 'places']
        });

        await loader.load();

        if (mapRef.current) {
          const mapInstance = new google.maps.Map(mapRef.current, {
            center: { lat: latitude, lng: longitude },
            zoom: 18,
            mapTypeId: view === 'earth' ? google.maps.MapTypeId.SATELLITE : google.maps.MapTypeId.HYBRID,
            tilt: view === 'earth' ? 45 : 0,
            heading: 0,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            zoomControl: true,
            styles: view === 'earth' ? [] : [
              {
                featureType: 'all',
                stylers: [{ visibility: 'on' }]
              }
            ]
          });

          // Add property marker
          const marker = new google.maps.Marker({
            position: { lat: latitude, lng: longitude },
            map: mapInstance,
            title: propertyTitle,
            icon: {
              url: 'data:image/svg+xml;base64,' + btoa(`
                <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24c0-8.837-7.163-16-16-16z" fill="#FF6B35"/>
                  <circle cx="16" cy="16" r="8" fill="white"/>
                  <circle cx="16" cy="16" r="4" fill="#FF6B35"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(32, 40),
              anchor: new google.maps.Point(16, 40)
            }
          });

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 10px; font-family: system-ui, -apple-system, sans-serif;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">${propertyTitle}</h3>
                <p style="margin: 0; font-size: 14px; color: #6b7280;">
                  📍 ${latitude.toFixed(6)}, ${longitude.toFixed(6)}
                </p>
                ${kmlUrl || kmlContent ? '<p style="margin: 4px 0 0 0; font-size: 12px; color: #3b82f6;">🗺️ Plot details available</p>' : ''}
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(mapInstance, marker);
          });

          // Load KML if provided
          if (kmlUrl) {
            const kmlLayer = new google.maps.KmlLayer({
              url: kmlUrl,
              map: mapInstance,
              preserveViewport: false,
              suppressInfoWindows: false
            });

            kmlLayer.addListener('status_changed', () => {
              const status = kmlLayer.getStatus();
              if (status !== google.maps.KmlLayerStatus.OK) {
                console.error('KML Layer failed to load:', status);
                setError('Failed to load KML data');
              }
            });
          } else if (kmlContent) {
            // For KML content, we would need to upload it somewhere accessible or use Data URI
            // This is a limitation of Google Maps KML layer - it needs a publicly accessible URL
            setError('KML content needs to be hosted at a public URL for Google Maps to load it');
          }

          setMap(mapInstance);
        }
      } catch (err) {
        console.error('Error initializing Google Earth viewer:', err);
        setError('Failed to initialize map viewer');
      } finally {
        setIsLoading(false);
      }
    };

    initializeMap();
  }, [apiKey, latitude, longitude, propertyTitle, kmlUrl, kmlContent, view]);

  const toggleView = () => {
    setView(prev => prev === 'satellite' ? 'earth' : 'satellite');
    if (map) {
      map.setMapTypeId(view === 'satellite' ? google.maps.MapTypeId.SATELLITE : google.maps.MapTypeId.HYBRID);
      map.setTilt(view === 'satellite' ? 45 : 0);
    }
  };

  if (!apiKey) {
    return (
      <div className={`${className} bg-red-50 border border-red-200 rounded-lg flex items-center justify-center`} style={{ height }}>
        <div className="text-red-600 text-center p-4">
          <p className="font-semibold">Google Maps API Key Required</p>
          <p className="text-sm mt-1">Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env file</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} bg-red-50 border border-red-200 rounded-lg flex items-center justify-center`} style={{ height }}>
        <div className="text-red-600 text-center p-4">
          <p className="font-semibold">Error Loading Map</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} relative rounded-lg overflow-hidden border border-gray-200`} style={{ height }}>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Loading Earth View...</p>
          </div>
        </div>
      )}

      {/* View Toggle */}
      <div className="absolute top-4 left-4 z-20 bg-white rounded-lg shadow-lg">
        <button
          onClick={toggleView}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg transition-colors"
        >
          {view === 'satellite' ? '🌍 3D Earth View' : '🛰️ Satellite View'}
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-20 bg-white rounded-lg shadow-lg p-3">
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-gray-700">Property Location</span>
          </div>
          {(kmlUrl || kmlContent) && (
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500"></div>
              <span className="text-gray-700">Plot Boundaries</span>
            </div>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}