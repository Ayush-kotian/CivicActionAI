import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, Navigation } from 'lucide-react';

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  address: string;
  onChange: (lat: number, lon: number, address: string) => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  latitude,
  longitude,
  address,
  onChange
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Default coordinate (e.g., Central District 12.9716, 77.5946)
  const currentLat = latitude || 12.9716;
  const currentLon = longitude || 77.5946;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [currentLat, currentLon],
        zoom: 14
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Custom marker icon
      const pinIcon = L.divIcon({
        className: 'custom-leaflet-pin',
        html: `<div style="background-color: #025aa1; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28]
      });

      const marker = L.marker([currentLat, currentLon], {
        draggable: true,
        icon: pinIcon
      }).addTo(map);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onChange(Number(pos.lat.toFixed(5)), Number(pos.lng.toFixed(5)), address);
      });

      map.on('click', (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        onChange(Number(e.latlng.lat.toFixed(5)), Number(e.latlng.lng.toFixed(5)), address);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    } else {
      mapInstanceRef.current.setView([currentLat, currentLon]);
      if (markerRef.current) {
        markerRef.current.setLatLng([currentLat, currentLon]);
      }
    }

    return () => {
      // Keep instance intact across minor renders
    };
  }, [currentLat, currentLon]);

  const handleUseBrowserLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lon = Number(pos.coords.longitude.toFixed(5));
        onChange(lat, lon, 'Device Detected GPS Coordinates');
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lon], 16);
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lon]);
          }
        }
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        alert('Could not retrieve device location. You can drag the pin on the map instead.');
      }
    );
  };

  const handlePresetSelect = (lat: number, lon: number, name: string) => {
    onChange(lat, lon, name);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lon], 15);
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lon]);
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span>Incident Location (Map Pin or Address)</span>
        </label>
        <button
          type="button"
          onClick={handleUseBrowserLocation}
          className="text-xs flex items-center gap-1 text-blue-700 hover:text-blue-900 font-medium bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded transition"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Use My GPS</span>
        </button>
      </div>

      {/* Preset demo shortcuts */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
        <span className="font-semibold text-slate-500">Quick presets:</span>
        <button
          type="button"
          onClick={() => handlePresetSelect(12.9716, 77.5946, 'Main Road / Commercial Cross')}
          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border rounded text-slate-700 transition"
        >
          Main Road Hotspot
        </button>
        <button
          type="button"
          onClick={() => handlePresetSelect(12.9852, 77.6052, 'North Avenue College Gate')}
          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border rounded text-slate-700 transition"
        >
          College Gate
        </button>
        <button
          type="button"
          onClick={() => handlePresetSelect(12.9602, 77.5802, 'Central Market Bus Terminal')}
          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border rounded text-slate-700 transition"
        >
          Central Market
        </button>
      </div>

      {/* Map container */}
      <div className="h-56 sm:h-64 border border-slate-300 rounded-lg overflow-hidden shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div>
          <label htmlFor="loc-address" className="text-slate-500 font-medium">Street Name or Landmark</label>
          <input
            id="loc-address"
            type="text"
            value={address}
            onChange={(e) => onChange(latitude, longitude, e.target.value)}
            placeholder="e.g. Main Road, outside St. Jude School"
            className="w-full mt-0.5 px-3 py-1.5 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-slate-500 font-medium">Coordinates (Click/drag pin on map)</label>
          <div className="mt-0.5 px-3 py-1.5 bg-slate-100 border border-slate-300 rounded-md text-sm font-mono text-slate-700">
            {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </div>
        </div>
      </div>
    </div>
  );
};
