"use client";

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

interface KMLEditorProps {
  propertyId: string;
  initialKML?: string;
  latitude?: number;
  longitude?: number;
  onSave: (kmlContent: string) => void;
}

interface LatLng {
  lat: number;
  lng: number;
}

export default function KMLEditor({ propertyId, initialKML, latitude, longitude, onSave }: KMLEditorProps) {
  const [polygonPaths, setPolygonPaths] = useState<LatLng[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polygonRef = useRef<L.Polygon | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const mapCenter: [number, number] = [latitude || 20.5937, longitude || 78.9629];
    const map = L.map(mapRef.current).setView(mapCenter, latitude ? 18 : 5);

    // Google Satellite layer
    L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
      attribution: '&copy; Google',
      maxZoom: 21,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(map);

    // Google Hybrid overlay - roads and labels
    L.tileLayer('https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}', {
      attribution: '&copy; Google',
      maxZoom: 21,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      opacity: 1
    }).addTo(map);

    mapInstanceRef.current = map;
    setIsLoaded(true);

    // Parse initial KML if provided
    if (initialKML) {
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(initialKML, 'text/xml');
        const coordinates = xmlDoc.getElementsByTagName('coordinates')[0]?.textContent?.trim();

        if (coordinates) {
          const points = coordinates.split(/\s+/).map(coord => {
            const [lng, lat] = coord.split(',').map(Number);
            return { lat, lng };
          }).filter(point => !isNaN(point.lat) && !isNaN(point.lng));

          if (points.length > 0) {
            setPolygonPaths(points);
          }
        }
      } catch (error) {
        console.error('Error parsing KML:', error);
      }
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [initialKML, latitude, longitude]);

  // Handle map clicks for drawing
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isDrawing) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      const newPoint = {
        lat: e.latlng.lat,
        lng: e.latlng.lng
      };
      setPolygonPaths(prev => [...prev, newPoint]);
    };

    map.on('click', handleClick);

    return () => {
      map.off('click', handleClick);
    };
  }, [isDrawing]);

  // Update polygon on map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing polygon
    if (polygonRef.current) {
      map.removeLayer(polygonRef.current);
      polygonRef.current = null;
    }

    // Draw new polygon if we have points
    if (polygonPaths.length > 0) {
      const latlngs: [number, number][] = polygonPaths.map(p => [p.lat, p.lng]);

      const polygon = L.polygon(latlngs, {
        color: '#3B82F6',
        fillColor: '#3B82F4',
        fillOpacity: 0.35,
        weight: 2
      }).addTo(map);

      polygonRef.current = polygon;

      // Fit bounds if we have enough points
      if (polygonPaths.length >= 3) {
        map.fitBounds(polygon.getBounds(), { padding: [50, 50] });
      }
    }
  }, [polygonPaths]);

  const generateKML = (paths: LatLng[]): string => {
    if (paths.length < 3) return '';

    const coordinates = paths.map(point =>
      `${point.lng},${point.lat},0`
    ).join('\n          ');

    const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Property Boundary</name>
    <Placemark>
      <name>Plot Boundary</name>
      <description>Property boundary for ${propertyId}</description>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>
          ${coordinates}
          ${paths[0].lng},${paths[0].lat},0
            </coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>
  </Document>
</kml>`;

    return kml;
  };

  const handleStartDrawing = () => {
    setIsDrawing(true);
    setPolygonPaths([]);
  };

  const handleFinishDrawing = () => {
    setIsDrawing(false);
    if (polygonPaths.length >= 3) {
      const kml = generateKML(polygonPaths);
      onSave(kml);
    }
  };

  const handleClear = () => {
    setPolygonPaths([]);
    setIsDrawing(false);
  };

  const handleUndo = () => {
    setPolygonPaths(prev => prev.slice(0, -1));
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">KML Plot Boundary Editor</h3>
        <p className="text-sm text-blue-700 mb-4">
          Click on the satellite map to draw the property boundary. Click "Finish Drawing" when done.
        </p>

        <div className="flex gap-2 flex-wrap">
          {!isDrawing ? (
            <button
              onClick={handleStartDrawing}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Start Drawing
            </button>
          ) : (
            <>
              <button
                onClick={handleFinishDrawing}
                disabled={polygonPaths.length < 3}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Finish Drawing ({polygonPaths.length} points)
              </button>
              <button
                onClick={handleUndo}
                disabled={polygonPaths.length === 0}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Undo Last Point
              </button>
            </>
          )}
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Clear All
          </button>
        </div>

        {polygonPaths.length > 0 && (
          <div className="mt-3 text-sm text-blue-700">
            <strong>Points added:</strong> {polygonPaths.length} {polygonPaths.length >= 3 && '(Ready to save)'}
          </div>
        )}
      </div>

      {/* Leaflet Map Container */}
      <div
        ref={mapRef}
        className="w-full h-[600px] rounded-lg border border-gray-300 overflow-hidden"
        style={{ zIndex: 0 }}
      />

      {polygonPaths.length >= 3 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Generated KML Preview</h4>
          <pre className="text-xs bg-white p-3 rounded border overflow-x-auto max-h-48">
            {generateKML(polygonPaths)}
          </pre>
        </div>
      )}
    </div>
  );
}
