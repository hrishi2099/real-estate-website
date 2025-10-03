"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Wrapper } from "@googlemaps/react-wrapper";

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  propertyTitle: string;
  propertyBoundary?: [number, number][];
  className?: string;
}

interface GoogleMapProps {
  center: google.maps.LatLngLiteral;
  zoom: number;
  propertyTitle: string;
  propertyBoundary?: [number, number][];
  mapType: google.maps.MapTypeId;
  showBoundaries: boolean;
}

function GoogleMapComponent({
  center,
  zoom,
  propertyTitle,
  propertyBoundary,
  mapType,
  showBoundaries
}: GoogleMapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();
  const [marker, setMarker] = useState<google.maps.Marker>();
  const [polygon, setPolygon] = useState<google.maps.Polygon>();
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow>();

  useEffect(() => {
    if (ref.current && !map) {
      const newMap = new window.google.maps.Map(ref.current, {
        center,
        zoom,
        mapTypeId: mapType,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "on" }]
          }
        ]
      });
      setMap(newMap);
    }
  }, [ref, map, center, zoom, mapType]);

  useEffect(() => {
    if (map) {
      map.setMapTypeId(mapType);
    }
  }, [map, mapType]);

  useEffect(() => {
    if (map) {
      if (marker) {
        marker.setMap(null);
      }
      if (infoWindow) {
        infoWindow.close();
      }

      const newMarker = new google.maps.Marker({
        position: center,
        map,
        title: propertyTitle,
        icon: {
          url: 'data:image/svg+xml;base64,' + btoa(`
            <svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20c0-6.627-5.373-12-12-12z" fill="#3B82F6"/>
              <circle cx="12" cy="12" r="6" fill="white"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(24, 32),
          anchor: new google.maps.Point(12, 32)
        }
      });

      const newInfoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; font-family: system-ui, -apple-system, sans-serif;">
            <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">${propertyTitle}</h3>
            <p style="margin: 0; font-size: 12px; color: #6b7280;">
              ${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}
            </p>
          </div>
        `
      });

      newMarker.addListener('click', () => {
        newInfoWindow.open(map, newMarker);
      });

      setMarker(newMarker);
      setInfoWindow(newInfoWindow);
    }
  }, [map, center, propertyTitle]);

  useEffect(() => {
    if (map) {
      if (polygon) {
        polygon.setMap(null);
      }

      if (showBoundaries && propertyBoundary && propertyBoundary.length > 0) {
        const boundaryCoords = propertyBoundary.map(([lat, lng]) => ({ lat, lng }));

        const newPolygon = new google.maps.Polygon({
          paths: boundaryCoords,
          strokeColor: '#3B82F6',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#3B82F6',
          fillOpacity: 0.2
        });

        newPolygon.setMap(map);
        setPolygon(newPolygon);
      }
    }
  }, [map, propertyBoundary, showBoundaries]);

  return <div ref={ref} style={{ width: '100%', height: '100%' }} />;
}

export default function PropertyMap({
  latitude,
  longitude,
  propertyTitle,
  propertyBoundary,
  className = "h-96 w-full"
}: PropertyMapProps) {
  const [mapType, setMapType] = useState<google.maps.MapTypeId>(google.maps.MapTypeId.ROADMAP);
  const [showBoundaries, setShowBoundaries] = useState(true);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  console.log('PropertyMap - API Key:', apiKey ? 'Present' : 'Missing');
  console.log('PropertyMap - API Key length:', apiKey?.length);

  if (!apiKey) {
    return (
      <div className={`${className} bg-red-50 border border-red-200 flex items-center justify-center rounded-lg`}>
        <div className="text-red-600 text-center p-4">
          <p className="font-semibold">Google Maps API Key Required</p>
          <p className="text-sm mt-1">Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env file</p>
        </div>
      </div>
    );
  }

  const center = { lat: latitude, lng: longitude };

  const defaultBoundary: [number, number][] = propertyBoundary || [
    [latitude + 0.001, longitude - 0.001],
    [latitude + 0.001, longitude + 0.001],
    [latitude - 0.001, longitude + 0.001],
    [latitude - 0.001, longitude - 0.001],
  ];

  const render = (status: any) => {
    if (status === 'LOADING') {
      return (
        <div className={`${className} bg-gray-200 flex items-center justify-center rounded-lg`}>
          <div className="text-gray-500">Loading Google Maps...</div>
        </div>
      );
    }

    if (status === 'FAILURE') {
      return (
        <div className={`${className} bg-red-50 border border-red-200 flex items-center justify-center rounded-lg`}>
          <div className="text-red-600 text-center p-4">
            <p className="font-semibold">Failed to load Google Maps</p>
            <p className="text-sm mt-1">Please check your API key and internet connection</p>
          </div>
        </div>
      );
    }

    return (
      <GoogleMapComponent
        center={center}
        zoom={16}
        propertyTitle={propertyTitle}
        propertyBoundary={defaultBoundary}
        mapType={mapType}
        showBoundaries={showBoundaries}
      />
    );
  };

  return (
    <div className="relative">
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-2 space-y-2">
        {/* Map Type Selection */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700">Map Type</label>
          <select
            value={mapType}
            onChange={(e) => setMapType(e.target.value as google.maps.MapTypeId)}
            className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value={google.maps.MapTypeId.ROADMAP}>Road</option>
            <option value={google.maps.MapTypeId.SATELLITE}>Satellite</option>
            <option value={google.maps.MapTypeId.HYBRID}>Hybrid</option>
            <option value={google.maps.MapTypeId.TERRAIN}>Terrain</option>
          </select>
        </div>

        {/* Boundary Toggle */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="showBoundaries"
            checked={showBoundaries}
            onChange={(e) => setShowBoundaries(e.target.checked)}
            className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="showBoundaries" className="text-xs text-gray-700">
            Property Boundaries
          </label>
        </div>
      </div>

      {/* Map Container */}
      <div className={`${className} rounded-lg overflow-hidden`}>
        <Wrapper
          apiKey={apiKey}
          render={render}
          libraries={['places', 'geometry']}
        />
      </div>

      {/* Map Legend */}
      <div className="mt-2 text-xs text-gray-600 flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Property Location</span>
        </div>
        {showBoundaries && (
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 bg-opacity-20 border border-blue-500"></div>
            <span>Property Boundary</span>
          </div>
        )}
      </div>
    </div>
  );
}