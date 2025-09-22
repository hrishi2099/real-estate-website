"use client";

import { useEffect, useState, useRef } from "react";
import { Wrapper } from "@googlemaps/react-wrapper";

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  propertyTitle: string;
  propertyBoundary?: [number, number][];
  className?: string;
}

interface SimpleGoogleMapProps {
  center: google.maps.LatLngLiteral;
  zoom: number;
  propertyTitle: string;
}

function SimpleGoogleMapComponent({ center, zoom, propertyTitle }: SimpleGoogleMapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();

  useEffect(() => {
    if (ref.current && !map) {
      const newMap = new window.google.maps.Map(ref.current, {
        center,
        zoom,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "simplified" }]
          }
        ]
      });
      setMap(newMap);
    }
  }, [ref, map, center, zoom]);

  useEffect(() => {
    if (map) {
      const marker = new google.maps.Marker({
        position: center,
        map,
        title: propertyTitle,
        icon: {
          url: 'data:image/svg+xml;base64,' + btoa(`
            <svg width="20" height="26" viewBox="0 0 20 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 0C4.477 0 0 4.477 0 10c0 7.5 10 16 10 16s10-8.5 10-16c0-5.523-4.477-10-10-10z" fill="#3B82F6"/>
              <circle cx="10" cy="10" r="4" fill="white"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(20, 26),
          anchor: new google.maps.Point(10, 26)
        }
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 4px; font-family: system-ui, -apple-system, sans-serif;">
            <h3 style="margin: 0; font-size: 12px; font-weight: 600;">${propertyTitle}</h3>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
    }
  }, [map, center, propertyTitle]);

  return <div ref={ref} style={{ width: '100%', height: '100%' }} />;
}

export default function PropertyMap({
  latitude,
  longitude,
  propertyTitle,
  className = "h-96 w-full"
}: PropertyMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className={`${className} bg-red-50 border border-red-200 flex items-center justify-center rounded-lg`}>
        <div className="text-red-600 text-center p-4">
          <p className="font-semibold text-sm">Google Maps API Key Required</p>
          <p className="text-xs mt-1">Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env file</p>
        </div>
      </div>
    );
  }

  const center = { lat: latitude, lng: longitude };

  const render = (status: any) => {
    if (status === 'LOADING') {
      return (
        <div className={`${className} bg-gray-200 flex items-center justify-center rounded-lg`}>
          <div className="text-gray-500 text-sm">Loading map...</div>
        </div>
      );
    }

    if (status === 'FAILURE') {
      return (
        <div className={`${className} bg-red-50 border border-red-200 flex items-center justify-center rounded-lg`}>
          <div className="text-red-600 text-center p-4">
            <p className="font-semibold text-sm">Failed to load Google Maps</p>
            <p className="text-xs mt-1">Please check your API key</p>
          </div>
        </div>
      );
    }

    return (
      <SimpleGoogleMapComponent
        center={center}
        zoom={15}
        propertyTitle={propertyTitle}
      />
    );
  };

  return (
    <div className={`${className} rounded-lg overflow-hidden border border-gray-200`}>
      <Wrapper
        apiKey={apiKey}
        render={render}
        libraries={['places']}
      />
    </div>
  );
}