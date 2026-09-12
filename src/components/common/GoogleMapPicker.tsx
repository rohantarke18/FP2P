import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Search,
  Crosshair,
  MapPin,
  AlertCircle,
  Loader2,
  X,
  CheckCircle2,
  Navigation,
  Compass,
} from 'lucide-react';
import L from 'leaflet';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface DetectedAddress {
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  ward?: string;
  landmark?: string;
}

export interface GoogleMapPickerProps {
  coordinates?: Coordinates;
  onCoordinatesChange?: (coords: Coordinates) => void;
  addressLabel?: string;
  wardName?: string;
  /** Called whenever a new location is confirmed (drag, click, search or GPS). */
  onAddressDetected?: (address: string, ward?: string, extra?: DetectedAddress) => void;
  className?: string;
  height?: string;
}

// Default map center: Chhatrapati Sambhajinagar, Maharashtra
export const CS_DEFAULT_COORDS: Coordinates = { lat: 19.8753, lng: 75.3433 };

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: Record<string, string>;
}

// Popular local landmarks for instant 1-click positioning
const POPULAR_LANDMARKS = [
  { name: 'Kranti Chowk', lat: 19.8735, lng: 75.3262, ward: 'Ward 4 (Kranti Chowk / Station Rd)' },
  { name: 'CIDCO Cannaught', lat: 19.8824, lng: 75.3621, ward: 'Ward 8 (CIDCO N-5 / Cannaught)' },
  { name: 'Town Hall & Collectorate', lat: 19.8986, lng: 75.3229, ward: 'Ward 2 (Town Hall / Bhadkal Gate)' },
  { name: 'Railway Station Area', lat: 19.8631, lng: 75.3183, ward: 'Ward 5 (Railway Station / Padampura)' },
  { name: 'Prozone Mall / MIDC', lat: 19.8761, lng: 75.3789, ward: 'Ward 12 (Chikalthana / Prozone)' },
  { name: 'High Court / Jalna Rd', lat: 19.8749, lng: 75.3475, ward: 'Ward 7 (Adalat Road / Samarthnagar)' },
];

function createCustomMarkerIcon() {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-full cursor-grab active:cursor-grabbing select-none">
        <div class="absolute w-8 h-8 -bottom-1 rounded-full bg-blue-500/25 animate-ping"></div>
        <div class="absolute w-5 h-2 -bottom-1 rounded-full bg-slate-900/30 blur-[2px]"></div>
        <div class="relative w-9 h-9 rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-blue-500/30 transition-transform duration-150 hover:scale-110">
          <svg class="w-5 h-5 text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });
}

function parseNominatimAddress(item: SearchResult): DetectedAddress & { ward?: string } {
  const a = item.address || {};
  const wardCandidate =
    a.suburb || a.neighbourhood || a.city_district || a.residential || a.quarter || 'Central Ward';
  const landmarkCandidate =
    a.amenity || a.building || a.road || a.commercial || a.historic || '';

  return {
    city: a.city || a.town || a.village || a.suburb || 'Chhatrapati Sambhajinagar',
    district: a.state_district || a.county || 'Chhatrapati Sambhajinagar',
    state: a.state || 'Maharashtra',
    pincode: a.postcode || '431001',
    ward: wardCandidate.includes('Ward') ? wardCandidate : `${wardCandidate} Zone`,
    landmark: landmarkCandidate,
  };
}

export const GoogleMapPicker: React.FC<GoogleMapPickerProps> = ({
  coordinates = CS_DEFAULT_COORDS,
  onCoordinatesChange,
  addressLabel = 'Unspecified location',
  onAddressDetected,
  className = '',
  height = '380px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [coords, setCoords] = useState<Coordinates>(coordinates);
  const [currentAddress, setCurrentAddress] = useState<string>(addressLabel);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [lastAssignedSource, setLastAssignedSource] = useState<'marker' | 'search' | 'gps' | 'preset' | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reverse geocode helper via Nominatim
  const reverseGeocode = useCallback(
    async (targetCoords: Coordinates, source: 'marker' | 'search' | 'gps' | 'preset' = 'marker') => {
      try {
        setIsReverseGeocoding(true);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${targetCoords.lat}&lon=${targetCoords.lng}`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data: SearchResult = await res.json();

        if (data && data.display_name) {
          const parsed = parseNominatimAddress(data);
          // Format concise street address
          const addr = data.address || {};
          const streetParts = [
            addr.amenity,
            addr.building,
            addr.road,
            addr.neighbourhood,
            addr.suburb,
          ].filter(Boolean);

          const compactAddress = streetParts.length > 0 ? streetParts.join(', ') : data.display_name.split(',').slice(0, 3).join(', ');

          setCurrentAddress(compactAddress);
          setLastAssignedSource(source);
          onCoordinatesChange?.(targetCoords);
          onAddressDetected?.(compactAddress, parsed.ward, parsed);
        } else {
          // Fallback with coordinate label
          const fallback = `Point (${targetCoords.lat.toFixed(4)}, ${targetCoords.lng.toFixed(4)})`;
          setCurrentAddress(fallback);
          setLastAssignedSource(source);
          onCoordinatesChange?.(targetCoords);
          onAddressDetected?.(fallback, 'Zone Area', {
            city: 'Chhatrapati Sambhajinagar',
            district: 'Chhatrapati Sambhajinagar',
            state: 'Maharashtra',
            pincode: '431001',
          });
        }
      } catch (err) {
        console.warn('Reverse geocode fallback:', err);
        const fallback = `Coordinates ${targetCoords.lat.toFixed(4)}, ${targetCoords.lng.toFixed(4)}`;
        setCurrentAddress(fallback);
        onCoordinatesChange?.(targetCoords);
      } finally {
        setIsReverseGeocoding(false);
      }
    },
    [onCoordinatesChange, onAddressDetected]
  );

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Prevent double init

    const initialLat = coordinates.lat || CS_DEFAULT_COORDS.lat;
    const initialLng = coordinates.lng || CS_DEFAULT_COORDS.lng;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 15,
      zoomControl: false,
    });

    // Add zoom control at bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // OpenStreetMap standard tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Draggable Marker
    const icon = createCustomMarkerIcon();
    const marker = L.marker([initialLat, initialLng], {
      draggable: true,
      icon,
      title: 'Drag me to place exact problem location',
    }).addTo(map);

    // Drag events
    marker.on('dragend', () => {
      const position = marker.getLatLng();
      const newCoords = { lat: position.lat, lng: position.lng };
      setCoords(newCoords);
      reverseGeocode(newCoords, 'marker');
    });

    // Map Click event - click anywhere to drop and move marker
    map.on('click', (e: L.LeafletMouseEvent) => {
      const newCoords = { lat: e.latlng.lat, lng: e.latlng.lng };
      marker.setLatLng(e.latlng);
      setCoords(newCoords);
      map.panTo(e.latlng, { animate: true });
      reverseGeocode(newCoords, 'marker');
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    // Trigger initial geocode if address not yet set
    if (!addressLabel || addressLabel === 'Unspecified location') {
      reverseGeocode({ lat: initialLat, lng: initialLng }, 'preset');
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Update marker position when external coords change
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current) {
      if (
        Math.abs(markerRef.current.getLatLng().lat - coordinates.lat) > 0.0001 ||
        Math.abs(markerRef.current.getLatLng().lng - coordinates.lng) > 0.0001
      ) {
        markerRef.current.setLatLng([coordinates.lat, coordinates.lng]);
        mapInstanceRef.current.panTo([coordinates.lat, coordinates.lng]);
        setCoords(coordinates);
      }
    }
  }, [coordinates.lat, coordinates.lng]);

  // Debounced search for locations
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=in&q=${encodeURIComponent(
            query
          )}`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data: SearchResult[] = await res.json();
        setResults(data);
        setShowResults(true);
        if (data.length === 0) {
          setNotice(`No results found for "${query}". Try searching a major landmark or drag the pin on the map.`);
        } else {
          setNotice(null);
        }
      } catch {
        setNotice('Search temporarily busy. You can click anywhere directly on the map to place the marker.');
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Handle selecting a search result
  const handleSelectResult = (item: SearchResult) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    const newCoords = { lat, lng };

    setCoords(newCoords);
    setQuery(item.display_name);
    setShowResults(false);
    setNotice(null);

    if (markerRef.current && mapInstanceRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      mapInstanceRef.current.flyTo([lat, lng], 16, { animate: true, duration: 1 });
    }

    const parsed = parseNominatimAddress(item);
    setCurrentAddress(item.display_name);
    setLastAssignedSource('search');
    onCoordinatesChange?.(newCoords);
    onAddressDetected?.(item.display_name, parsed.ward, parsed);
  };

  // Handle preset landmark click
  const handleSelectPreset = (landmark: typeof POPULAR_LANDMARKS[0]) => {
    const newCoords = { lat: landmark.lat, lng: landmark.lng };
    setCoords(newCoords);
    setNotice(null);

    if (markerRef.current && mapInstanceRef.current) {
      markerRef.current.setLatLng([landmark.lat, landmark.lng]);
      mapInstanceRef.current.flyTo([landmark.lat, landmark.lng], 16, { animate: true });
    }

    reverseGeocode(newCoords, 'preset');
  };

  // Handle Current GPS Location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setNotice('Geolocation is not supported by your browser. Please click on the map to place the marker.');
      return;
    }
    setIsLocating(true);
    setNotice(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCoords = { lat: position.coords.latitude, lng: position.coords.longitude };
        setCoords(newCoords);

        if (markerRef.current && mapInstanceRef.current) {
          markerRef.current.setLatLng([newCoords.lat, newCoords.lng]);
          mapInstanceRef.current.flyTo([newCoords.lat, newCoords.lng], 17, { animate: true });
        }

        reverseGeocode(newCoords, 'gps');
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        setNotice('Location permission was denied or unavailable. Click directly on the map to drop the marker.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Search and Locate Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setShowResults(true)}
            placeholder="Search address, landmark, colony or ward..."
            className="w-full text-xs sm:text-sm pl-9 pr-9 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-blue-600 shadow-2xs placeholder:text-slate-400"
          />
          {isSearching && (
            <Loader2 className="w-4 h-4 animate-spin text-blue-600 absolute right-3 top-1/2 -translate-y-1/2" />
          )}
          {!isSearching && query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults([]);
                setShowResults(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Autocomplete Dropdown */}
          {showResults && results.length > 0 && (
            <div className="absolute z-30 mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto divide-y divide-slate-100">
              {results.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectResult(item)}
                  className="w-full text-left px-3.5 py-2.5 text-xs text-slate-700 hover:bg-blue-50/80 transition-colors flex items-start gap-2"
                >
                  <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{item.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Locate Me GPS Button */}
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-semibold shadow-2xs transition-colors shrink-0 disabled:opacity-60 cursor-pointer"
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          ) : (
            <Crosshair className="w-4 h-4 text-blue-600" />
          )}
          <span>{isLocating ? 'Locating GPS…' : 'Locate My Position'}</span>
        </button>
      </div>

      {/* Quick Landmark Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] text-slate-500 scrollbar-none">
        <span className="font-semibold text-slate-600 shrink-0 flex items-center gap-1">
          <Compass className="w-3.5 h-3.5 text-slate-400" />
          <span>Quick Landmarks:</span>
        </span>
        {POPULAR_LANDMARKS.map((lm) => (
          <button
            key={lm.name}
            type="button"
            onClick={() => handleSelectPreset(lm)}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-200 text-slate-700 transition-colors shrink-0 cursor-pointer"
          >
            {lm.name}
          </button>
        ))}
      </div>

      {notice && (
        <div className="px-3.5 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{notice}</span>
        </div>
      )}

      {/* Interactive Leaflet Map Container */}
      <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm" style={{ height }}>
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Top Floating Helper Overlay */}
        <div className="absolute top-3 left-3 right-3 z-20 pointer-events-none flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/85 backdrop-blur-sm text-white text-xs font-medium shadow-md">
            <Navigation className="w-3.5 h-3.5 text-amber-400" />
            <span>Click map or drag the marker to pinpoint exact location</span>
          </div>

          {isReverseGeocoding && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/95 backdrop-blur-sm border border-slate-200 text-blue-700 text-xs font-semibold shadow-md">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
              <span>Fetching exact address...</span>
            </div>
          )}
        </div>
      </div>

      {/* Active Pin Placement Banner */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-50 via-slate-50 to-indigo-50/40 border border-blue-200/80 shadow-2xs flex items-start gap-3 text-xs">
        <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
          <MapPin className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-900 text-xs">Selected Location</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" />
              <span>Marker Placed & Synced to Boxes</span>
            </span>
            <span className="text-[11px] font-mono text-slate-500 ml-auto">
              {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
            </span>
          </div>
          <p className="font-medium text-slate-800 text-xs mt-1 leading-snug">
            {currentAddress || addressLabel || 'Select a location on the map'}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            ✨ Address line, Ward, City, and Pincode input boxes below have been auto-filled. You can also edit them manually.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoogleMapPicker;
