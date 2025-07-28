"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Fix Leaflet marker icons - will be handled in useEffect

// Dynamically import the map to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });
const Polygon = dynamic(() => import("react-leaflet").then(mod => mod.Polygon), { ssr: false });

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  propertyTitle: string;
  propertyBoundary?: [number, number][];
  className?: string;
}

// Tile layer configurations
const TILE_LAYERS = {
  street: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  },
  terrain: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  }
};

export default function PropertyMap({ 
  latitude, 
  longitude, 
  propertyTitle, 
  propertyBoundary,
  className = "h-96 w-full" 
}: PropertyMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [mapLayer, setMapLayer] = useState<'street' | 'satellite' | 'terrain'>('street');
  const [showBoundaries, setShowBoundaries] = useState(true);

  useEffect(() => {
    setIsClient(true);
    
    // Fix Leaflet marker icons
    if (typeof window !== "undefined") {
      import("leaflet").then((L) => {
        delete (L as any).Icon.Default.prototype._getIconUrl;
        (L as any).Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });
      });
    }
  }, []);

  if (!isClient) {
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center rounded-lg`}>
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  // Default boundary if none provided (sample rectangular boundary around the property)
  const defaultBoundary: [number, number][] = propertyBoundary || [
    [latitude + 0.001, longitude - 0.001],
    [latitude + 0.001, longitude + 0.001],
    [latitude - 0.001, longitude + 0.001],
    [latitude - 0.001, longitude - 0.001],
  ];

  return (
    <div className="relative">
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-2 space-y-2">
        {/* Layer Selection */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700">Map Type</label>
          <select
            value={mapLayer}
            onChange={(e) => setMapLayer(e.target.value as 'street' | 'satellite' | 'terrain')}
            className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="street">Street</option>
            <option value="satellite">Satellite</option>
            <option value="terrain">Terrain</option>
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
      <div className={className}>
        <MapContainer
          center={[latitude, longitude]}
          zoom={16}
          className="h-full w-full rounded-lg"
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url={TILE_LAYERS[mapLayer].url}
            attribution={TILE_LAYERS[mapLayer].attribution}
          />
          
          {/* Property Marker */}
          <Marker position={[latitude, longitude]}>
            <Popup>
              <div className="text-center">
                <h3 className="font-semibold text-sm">{propertyTitle}</h3>
                <p className="text-xs text-gray-600">
                  {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>

          {/* Property Boundaries */}
          {showBoundaries && (
            <Polygon
              positions={defaultBoundary}
              pathOptions={{
                color: '#3B82F6',
                fillColor: '#3B82F6',
                fillOpacity: 0.2,
                weight: 2,
                opacity: 0.8
              }}
            >
              <Popup>
                <div className="text-center">
                  <h3 className="font-semibold text-sm">Property Boundary</h3>
                  <p className="text-xs text-gray-600">
                    Approximate property limits
                  </p>
                </div>
              </Popup>
            </Polygon>
          )}
        </MapContainer>
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