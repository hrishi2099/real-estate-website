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

    // Google Hybrid layer (Satellite with roads and labels)
    const googleSatelliteLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
      attribution: '&copy; Google',
      maxZoom: 21,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(map);

    // Google Hybrid overlay - roads, labels, and place names on satellite
    const googleHybridOverlay = L.tileLayer('https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}', {
      attribution: '&copy; Google',
      maxZoom: 21,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      opacity: 1
    }).addTo(map);

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

    // Cleanup
    return () => {
      map.remove();
    };
  }, [latitude, longitude, propertyTitle, kmlFileUrl, kmlContent]);

  return (
    <div className={`${className} relative rounded-lg overflow-hidden border border-gray-200`}>
      <div ref={mapRef} style={{ width: '100%', height }} />

      {/* Legend */}
      {(kmlFileUrl || kmlContent) && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-3 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 bg-opacity-20 border-2 border-blue-500"></div>
            <span className="font-medium">Plot Boundary</span>
          </div>
        </div>
      )}
    </div>
  );
}
