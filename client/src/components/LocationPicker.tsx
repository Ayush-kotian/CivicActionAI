import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, Navigation } from 'lucide-react';

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  address?: string;
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

  const currentLat = latitude || 12.9716;
  const currentLon = longitude || 77.5946;

  // Central update for map click, drag, or GPS
  const handleLocationUpdate = (lat: number, lon: number, customAddr?: string) => {
    const latFixed = Number(lat.toFixed(5));
    const lonFixed = Number(lon.toFixed(5));
    const readable = customAddr || `Incident Location (${latFixed.toFixed(4)}, ${lonFixed.toFixed(4)})`;

    if (markerRef.current) {
      markerRef.current.setLatLng([latFixed, lonFixed]);
    }

    onChange(latFixed, lonFixed, readable);
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [currentLat, currentLon],
        zoom: 15
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Clean mobile-friendly high-contrast municipal pin
      const pinIcon = L.divIcon({
        className: 'custom-leaflet-pin',
        html: `<div style="background-color: #025aa1; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; color: white;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      // Draggable marker
      const marker = L.marker([currentLat, currentLon], {
        draggable: true,
        icon: pinIcon
      }).addTo(map);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        handleLocationUpdate(pos.lat, pos.lng);
      });

      // Click on map to select/move location
      map.on('click', (e: L.LeafletMouseEvent) => {
        handleLocationUpdate(e.latlng.lat, e.latlng.lng);
        map.panTo(e.latlng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    } else {
      mapInstanceRef.current.setView([currentLat, currentLon]);
      if (markerRef.current) {
        markerRef.current.setLatLng([currentLat, currentLon]);
      }
    }
  }, [currentLat, currentLon]);

  const handleUseBrowserGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        handleLocationUpdate(lat, lon, 'Device Detected GPS Location');
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lon], 16);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        alert('Could not retrieve device location. Click anywhere on the map to set location.');
      }
    );
  };

  const handlePresetSelect = (lat: number, lon: number, name: string) => {
    handleLocationUpdate(lat, lon, name);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lon], 16);
    }
  };

  return (
    <div className="space-y-2.5 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
        <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span>Select Complaint Location (Click or Drag on Map)</span>
        </label>
        <button
          type="button"
          onClick={handleUseBrowserGPS}
          className="text-xs flex items-center gap-1 text-blue-700 hover:text-blue-900 font-semibold bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition border border-blue-200"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>My GPS</span>
        </button>
      </div>

      {/* Interactive Map */}
      <div className="space-y-1">
        <div className="h-64 sm:h-72 border border-slate-300 rounded-xl overflow-hidden shadow-inner relative">
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>
        <p className="text-[11px] text-slate-500 font-medium">
          Click anywhere on the map or drag the marker to adjust the exact incident position.
        </p>
      </div>

      {/* Selected Coordinates & Quick Shortcuts */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
        <div className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-mono text-[11px] font-semibold">
          Selected: {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </div>

        <div className="flex flex-wrap items-center gap-1 text-xs">
          <span className="text-slate-400 text-[10px] font-medium mr-1">Quick:</span>
          <button
            type="button"
            onClick={() => handlePresetSelect(12.9716, 77.5946, 'Main Road / Commercial Cross')}
            className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md text-slate-700 text-[10px] font-medium transition"
          >
            Main Road
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect(12.9852, 77.6052, 'North Avenue & College Gate')}
            className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md text-slate-700 text-[10px] font-medium transition"
          >
            College Gate
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect(12.9602, 77.5802, 'Central Market & Bus Terminal')}
            className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md text-slate-700 text-[10px] font-medium transition"
          >
            Central Market
          </button>
        </div>
      </div>
    </div>
  );
};
