import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, Search, Loader2 } from 'lucide-react';

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  address: string;
  onChange: (lat: number, lon: number, address: string) => void;
}

// Built-in offline fallback dictionary for instant civic search responses
const PRESET_GEOCODES: { [key: string]: { lat: number; lon: number; name: string } } = {
  'main road': { lat: 12.9716, lon: 77.5946, name: 'Main Road / Commercial Cross' },
  'college gate': { lat: 12.9852, lon: 77.6052, name: 'North Avenue & College Gate' },
  'north avenue': { lat: 12.9852, lon: 77.6052, name: 'North Avenue & College Gate' },
  'central market': { lat: 12.9602, lon: 77.5802, name: 'Central Market & Bus Terminal' },
  'green glen': { lat: 12.9780, lon: 77.5700, name: 'Green Glen Residential Park' },
  'ring road': { lat: 12.9718, lon: 77.5948, name: 'Ring Road Metro Station' },
  'metro station': { lat: 12.9720, lon: 77.5942, name: 'Main Road Metro Gate 2' }
};

export const LocationPicker: React.FC<LocationPickerProps> = ({
  latitude,
  longitude,
  address,
  onChange
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Synchronized form inputs
  const [addressSearch, setAddressSearch] = useState(address || '');
  const [latInput, setLatInput] = useState<string>(latitude ? latitude.toFixed(5) : '12.97160');
  const [lonInput, setLonInput] = useState<string>(longitude ? longitude.toFixed(5) : '77.59460');
  const [isSearching, setIsSearching] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);

  // Keep internal input strings synchronized when props change externally
  useEffect(() => {
    if (latitude) setLatInput(latitude.toFixed(5));
    if (longitude) setLonInput(longitude.toFixed(5));
    if (address !== undefined) setAddressSearch(address);
  }, [latitude, longitude, address]);

  // Central function to move the single marker and update map & state
  const updateMarkerAndPosition = (
    newLat: number,
    newLon: number,
    newAddress?: string,
    zoomTo?: number
  ) => {
    const latFixed = Number(newLat.toFixed(5));
    const lonFixed = Number(newLon.toFixed(5));

    setLatInput(latFixed.toFixed(5));
    setLonInput(lonFixed.toFixed(5));

    const finalAddress = newAddress !== undefined ? newAddress : addressSearch;
    if (newAddress !== undefined) {
      setAddressSearch(newAddress);
    }

    // Move the single marker
    if (markerRef.current) {
      markerRef.current.setLatLng([latFixed, lonFixed]);
    }

    // Move / center the map
    if (mapInstanceRef.current) {
      if (zoomTo) {
        mapInstanceRef.current.setView([latFixed, lonFixed], zoomTo);
      } else {
        mapInstanceRef.current.panTo([latFixed, lonFixed]);
      }
    }

    onChange(latFixed, lonFixed, finalAddress);
  };

  // Initialize Leaflet map and the single draggable marker
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialLat = latitude || 12.9716;
    const initialLon = longitude || 77.5946;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLon],
        zoom: 15
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Distinctive high-contrast municipal pin icon
      const pinIcon = L.divIcon({
        className: 'custom-leaflet-pin',
        html: `<div style="background-color: #025aa1; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; color: white;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      // 4. Drag the marker -> adjust exact location
      const marker = L.marker([initialLat, initialLon], {
        draggable: true,
        icon: pinIcon
      }).addTo(map);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        updateMarkerAndPosition(pos.lat, pos.lng);
      });

      // 3. Click anywhere on the map -> move the marker there
      map.on('click', (e: L.LeafletMouseEvent) => {
        updateMarkerAndPosition(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    }

    return () => {
      // Keep instance intact across renders
    };
  }, []);

  // 1. Type/search an address -> place marker there
  const handleAddressSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = addressSearch.trim();
    if (!query) return;

    setIsSearching(true);
    setSearchFeedback(null);

    try {
      // Check local preset dictionary first for instantaneous demo responsiveness
      const lowerQuery = query.toLowerCase();
      const matchedKey = Object.keys(PRESET_GEOCODES).find((k) => lowerQuery.includes(k));

      if (matchedKey) {
        const match = PRESET_GEOCODES[matchedKey];
        updateMarkerAndPosition(match.lat, match.lon, query, 16);
        setSearchFeedback(`Located: ${match.name}`);
        setIsSearching(false);
        return;
      }

      // Query OpenStreetMap Nominatim
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const result = data[0];
          const newLat = parseFloat(result.lat);
          const newLon = parseFloat(result.lon);
          updateMarkerAndPosition(newLat, newLon, query, 16);
          setSearchFeedback(`Located: ${result.display_name.split(',').slice(0, 3).join(',')}`);
          setIsSearching(false);
          return;
        }
      }

      // Fallback if not found on Nominatim
      setSearchFeedback('Address not found on live map. You can enter coordinates or click on the map.');
    } catch (err) {
      console.warn('Geocoding fetch error:', err);
      setSearchFeedback('Network lookup unavailable. You can drag the marker directly on the map.');
    } finally {
      setIsSearching(false);
    }
  };

  // 2. Enter latitude and longitude -> place the marker there
  const handleCoordinateChange = (newLatStr: string, newLonStr: string) => {
    setLatInput(newLatStr);
    setLonInput(newLonStr);

    const latVal = parseFloat(newLatStr);
    const lonVal = parseFloat(newLonStr);

    if (!isNaN(latVal) && !isNaN(lonVal)) {
      if (latVal >= -90 && latVal <= 90 && lonVal >= -180 && lonVal <= 180) {
        updateMarkerAndPosition(latVal, lonVal);
      }
    }
  };

  const handleUseBrowserGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateMarkerAndPosition(
          pos.coords.latitude,
          pos.coords.longitude,
          'Current Device GPS Location',
          16
        );
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        alert('Could not retrieve device location. You can drag the pin on the map instead.');
      }
    );
  };

  return (
    <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
        <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span>Location Selection (Interactive Map Selector)</span>
        </label>
        <button
          type="button"
          onClick={handleUseBrowserGPS}
          className="text-xs flex items-center gap-1 text-blue-700 hover:text-blue-900 font-semibold bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition border border-blue-200"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Use GPS</span>
        </button>
      </div>

      {/* 1. Address Search Bar */}
      <div>
        <label htmlFor="address-search-input" className="text-xs font-medium text-slate-700 block mb-1">
          Method 1: Type or search an address (places marker)
        </label>
        <form onSubmit={handleAddressSearch} className="flex gap-2">
          <div className="relative flex-1">
            <input
              id="address-search-input"
              type="text"
              value={addressSearch}
              onChange={(e) => {
                setAddressSearch(e.target.value);
                onChange(Number(latInput), Number(lonInput), e.target.value);
              }}
              placeholder="e.g. Main Road, Central Market, Ring Road, North Avenue..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition shrink-0 disabled:opacity-60"
          >
            {isSearching ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Search className="w-3.5 h-3.5" />
            )}
            <span>Locate</span>
          </button>
        </form>
        {searchFeedback && (
          <p className="text-[11px] text-blue-700 mt-1 font-medium">{searchFeedback}</p>
        )}
      </div>

      {/* Map instructions & Interactive Container */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span>Click anywhere on the map or drag the marker to adjust exact spot</span>
          <span className="text-blue-600 font-semibold">Single synchronized marker</span>
        </div>
        <div className="h-60 sm:h-72 border border-slate-300 rounded-xl overflow-hidden shadow-inner">
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>
      </div>

      {/* 2. Editable Latitude & Longitude inputs */}
      <div>
        <label className="text-xs font-medium text-slate-700 block mb-1">
          Method 2: Enter exact latitude & longitude coordinates
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="input-lat" className="text-[10px] uppercase font-bold text-slate-500 block">
              Latitude
            </label>
            <input
              id="input-lat"
              type="number"
              step="any"
              value={latInput}
              onChange={(e) => handleCoordinateChange(e.target.value, lonInput)}
              className="w-full mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="input-lon" className="text-[10px] uppercase font-bold text-slate-500 block">
              Longitude
            </label>
            <input
              id="input-lon"
              type="number"
              step="any"
              value={lonInput}
              onChange={(e) => handleCoordinateChange(latInput, e.target.value)}
              className="w-full mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Quick Location Shortcuts */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1 border-t border-slate-100">
        <span className="text-slate-500 font-semibold text-[11px]">Quick presets:</span>
        <button
          type="button"
          onClick={() => updateMarkerAndPosition(12.9716, 77.5946, 'Main Road / Commercial Cross', 16)}
          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-700 text-[11px] font-medium transition"
        >
          Main Road Hotspot
        </button>
        <button
          type="button"
          onClick={() => updateMarkerAndPosition(12.9852, 77.6052, 'North Avenue & College Gate', 16)}
          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-700 text-[11px] font-medium transition"
        >
          College Gate
        </button>
        <button
          type="button"
          onClick={() => updateMarkerAndPosition(12.9602, 77.5802, 'Central Market & Bus Terminal', 16)}
          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-700 text-[11px] font-medium transition"
        >
          Central Market
        </button>
      </div>
    </div>
  );
};
