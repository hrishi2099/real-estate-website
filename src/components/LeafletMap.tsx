"use client";

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.fullscreen';
import 'leaflet.fullscreen/Control.FullScreen.css';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface LeafletMapProps {
  latitude: number;
  longitude: number;
  propertyTitle: string;
  kmlFileUrl?: string | null;
  kmlContent?: string | null;
  className?: string;
  height?: string;
}

export default function LeafletMap({
  latitude,
  longitude,
  propertyTitle,
  kmlFileUrl,
  kmlContent,
  className = "w-full",
  height = "500px"
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [mapView, setMapView] = useState<'street' | 'satellite' | 'terrain'>('street');
  const streetLayerRef = useRef<L.TileLayer | null>(null);
  const satelliteLayerRef = useRef<L.TileLayer | null>(null);
  const terrainLayerRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Determine initial map center - will be updated if KML data provides better coordinates
    let mapCenter: [number, number] = [latitude || 0, longitude || 0];
    let hasValidCoords = latitude !== 0 && longitude !== 0;

    // Initialize map with fullscreen control
    const map = L.map(mapRef.current, {
      fullscreenControl: true,
      fullscreenControlOptions: {
        position: 'topleft',
        title: 'Enter fullscreen',
        titleCancel: 'Exit fullscreen',
        forceSeparateButton: true,
        forcePseudoFullscreen: false,
      }
    } as any).setView(mapCenter, hasValidCoords ? 16 : 2);

    // Street map layer (OpenStreetMap)
    const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    });

    // Satellite layer (Esri World Imagery - free, no API key required)
    // Limiting maxZoom to 18 to avoid "data not available" errors at higher zoom levels
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 18,
      maxNativeZoom: 18,
    });

    // Terrain layer (OpenTopoMap - topographic map with elevation shading)
    const terrainLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
      maxZoom: 17,
    });

    // Add initial layer
    if (mapView === 'street') {
      streetLayer.addTo(map);
    } else if (mapView === 'satellite') {
      satelliteLayer.addTo(map);
    } else {
      terrainLayer.addTo(map);
    }

    streetLayerRef.current = streetLayer;
    satelliteLayerRef.current = satelliteLayer;
    terrainLayerRef.current = terrainLayer;

    // Add property marker only if we have valid coordinates
    if (hasValidCoords) {
      const marker = L.marker([latitude, longitude]).addTo(map);
      marker.bindPopup(`
        <div style="font-family: system-ui, sans-serif;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">${propertyTitle}</h3>
          <p style="margin: 0; font-size: 12px; color: #6b7280;">
            📍 ${latitude.toFixed(6)}, ${longitude.toFixed(6)}
          </p>
          ${kmlFileUrl || kmlContent ? '<p style="margin: 4px 0 0 0; font-size: 11px; color: #3b82f6;">🗺️ Plot details loaded</p>' : ''}
        </div>
      `);
    }

    // Load KML from content (production) or file (localhost)
    const loadKML = (kmlText: string) => {
      const parser = new DOMParser();
      const kml = parser.parseFromString(kmlText, 'text/xml');

      console.log('KML parsed successfully');

      // Extract all Polygon elements
      const polygons = kml.querySelectorAll('Polygon');
      console.log('Found polygons:', polygons.length);

      polygons.forEach((polygon, index) => {
        const coordsText = polygon.querySelector('coordinates')?.textContent?.trim();
        if (coordsText) {
          const coords = coordsText.split(/\s+/).map(coord => {
            const parts = coord.trim().split(',');
            const lng = parseFloat(parts[0]);
            const lat = parseFloat(parts[1]);
            return [lat, lng] as [number, number];
          }).filter(coord => !isNaN(coord[0]) && !isNaN(coord[1]));

          if (coords.length > 0) {
            const leafletPolygon = L.polygon(coords, {
              color: '#3B82F6',
              fillColor: '#3B82F6',
              fillOpacity: 0.2,
              weight: 2
            }).addTo(map);

            leafletPolygon.bindPopup(`Property Boundary ${polygons.length > 1 ? `(${index + 1})` : ''}`);

            // Fit map to show the first polygon
            if (index === 0) {
              map.fitBounds(leafletPolygon.getBounds(), { padding: [50, 50] });
            }
          }
        }
      });

      // Also extract LineString elements
      const lineStrings = kml.querySelectorAll('LineString');
      console.log('Found linestrings:', lineStrings.length);

      lineStrings.forEach((lineString) => {
        const coordsText = lineString.querySelector('coordinates')?.textContent?.trim();
        if (coordsText) {
          const coords = coordsText.split(/\s+/).map(coord => {
            const parts = coord.trim().split(',');
            const lng = parseFloat(parts[0]);
            const lat = parseFloat(parts[1]);
            return [lat, lng] as [number, number];
          }).filter(coord => !isNaN(coord[0]) && !isNaN(coord[1]));

          if (coords.length > 0) {
            L.polyline(coords, {
              color: '#3B82F6',
              weight: 3
            }).addTo(map).bindPopup('Property Line');
          }
        }
      });
    };

    // Load KML from content (database) or file URL
    if (kmlContent) {
      // Use stored content (works in production)
      console.log('Loading KML from database content');
      loadKML(kmlContent);
    } else if (kmlFileUrl) {
      // Fetch from file URL (works in localhost)
      const fullUrl = kmlFileUrl.startsWith('http')
        ? kmlFileUrl
        : `${window.location.origin}${kmlFileUrl}`;

      console.log('Loading KML from file:', fullUrl);

      fetch(fullUrl)
        .then(response => response.text())
        .then(kmlText => loadKML(kmlText))
        .catch(error => {
          console.error('Error loading KML file:', error);
        });
    }

    mapInstanceRef.current = map;

    mapInstanceRef.current = map;

    // Cleanup
    return () => {
      map.remove();
    };
  }, [latitude, longitude, propertyTitle, kmlFileUrl, kmlContent, mapView]);

  // Toggle between street, satellite, and terrain views
  const toggleMapView = () => {
    const map = mapInstanceRef.current;
    if (!map || !streetLayerRef.current || !satelliteLayerRef.current || !terrainLayerRef.current) return;

    if (mapView === 'street') {
      map.removeLayer(streetLayerRef.current);
      satelliteLayerRef.current.addTo(map);
      setMapView('satellite');
    } else if (mapView === 'satellite') {
      map.removeLayer(satelliteLayerRef.current);
      terrainLayerRef.current.addTo(map);
      setMapView('terrain');
    } else {
      map.removeLayer(terrainLayerRef.current);
      streetLayerRef.current.addTo(map);
      setMapView('street');
    }
  };

  return (
    <div className={`${className} relative rounded-lg overflow-hidden border border-gray-200`}>
      <div ref={mapRef} style={{ width: '100%', height }} />

      {/* View Toggle Button */}
      <div className="absolute top-4 right-4 z-[1000]">
        <button
          onClick={toggleMapView}
          className="bg-white rounded-lg shadow-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          {mapView === 'street' ? '🛰️ Satellite' : mapView === 'satellite' ? '🏔️ Terrain' : '🗺️ Street'}
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-2 text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Property Location</span>
          </div>
          {(kmlFileUrl || kmlContent) && (
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 bg-opacity-20 border border-blue-500"></div>
              <span>Plot Boundary</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
