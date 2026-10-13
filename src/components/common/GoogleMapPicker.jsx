import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Search,
  Crosshair,
  Navigation,
  Compass,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Layers,
  Info,
} from 'lucide-react';
import { loadGoogleMapsScript, isGoogleMapsConfigured } from '../../utils/googleMaps';
import { api } from '../../utils/api';

/**
 * Predefined popular Pakistani landmarks for instant fallback search
 */
const DEFAULT_PAKISTAN_PRESETS = [
  { name: 'Clifton (Boat Basin)', city: 'Karachi', area: 'Clifton', lat: 24.8256, lng: 67.0278 },
  { name: 'DHA Phase 5 (Khayaban-e-Shahbaz)', city: 'Karachi', area: 'DHA', lat: 24.8012, lng: 67.0543 },
  { name: 'Gulshan-e-Iqbal Block 13-D', city: 'Karachi', area: 'Gulshan', lat: 24.918, lng: 67.0862 },
  { name: 'MM Alam Road (Gulberg III)', city: 'Lahore', area: 'Gulberg', lat: 31.5115, lng: 74.3542 },
  { name: 'DHA Phase 3 (Y Block)', city: 'Lahore', area: 'DHA', lat: 31.4721, lng: 74.3812 },
  { name: 'Jinnah Super Market (F-7/2)', city: 'Islamabad', area: 'Sector F-7', lat: 33.7215, lng: 73.0556 },
  { name: 'Super Market (F-6/2)', city: 'Islamabad', area: 'Sector F-6', lat: 33.7312, lng: 73.0762 },
  { name: 'Saddar Bank Road', city: 'Rawalpindi', area: 'Saddar', lat: 33.5952, lng: 73.0543 },
];

export default function GoogleMapPicker({
  initialCoordinates = { lat: 24.8607, lng: 67.0011 },
  initialAddress = '',
  initialCity = 'Karachi',
  onChange,
  restaurantCity = 'Karachi',
}) {
  const [coordinates, setCoordinates] = useState(initialCoordinates);
  const [addressText, setAddressText] = useState(initialAddress);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Google Maps SDK State
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [mapLoadError, setMapLoadError] = useState('');
  const mapRef = useRef(null);
  const googleMapInstance = useRef(null);
  const markerInstance = useRef(null);
  const searchInputRef = useRef(null);

  // Initialize and attempt to load Google Maps SDK
  useEffect(() => {
    if (!isGoogleMapsConfigured()) {
      setMapLoadError('Google Maps API key not detected. Using Interactive Pakistan Pin Mode.');
      return;
    }

    let isMounted = true;
    loadGoogleMapsScript()
      .then((googleMaps) => {
        if (!isMounted || !mapRef.current) return;
        setMapsLoaded(true);

        // Initialize Google Map
        const map = new googleMaps.Map(mapRef.current, {
          center: { lat: coordinates.lat, lng: coordinates.lng },
          zoom: 14,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          styles: [
            { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
          ],
        });
        googleMapInstance.current = map;

        // Custom Destination Pin Marker
        const marker = new googleMaps.Marker({
          position: { lat: coordinates.lat, lng: coordinates.lng },
          map,
          draggable: true,
          title: 'Delivery Destination (Drag to adjust pin)',
          animation: googleMaps.Animation.DROP,
        });
        markerInstance.current = marker;

        // Listen for drag end
        marker.addListener('dragend', () => {
          const pos = marker.getPosition();
          const newCoords = {
            lat: Number(pos.lat().toFixed(4)),
            lng: Number(pos.lng().toFixed(4)),
          };
          setCoordinates(newCoords);
          triggerChange(addressText, newCoords);
        });

        // Initialize Places Autocomplete if available
        if (googleMaps.places && searchInputRef.current) {
          const autocomplete = new googleMaps.places.Autocomplete(searchInputRef.current, {
            componentRestrictions: { country: 'pk' },
            fields: ['formatted_address', 'geometry', 'name'],
          });

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.geometry && place.geometry.location) {
              const loc = place.geometry.location;
              const newCoords = {
                lat: Number(loc.lat().toFixed(4)),
                lng: Number(loc.lng().toFixed(4)),
              };
              const newAddr = place.formatted_address || place.name || addressText;
              setCoordinates(newCoords);
              setAddressText(newAddr);
              setSearchQuery(newAddr);
              map.setCenter(loc);
              map.setZoom(16);
              marker.setPosition(loc);
              triggerChange(newAddr, newCoords);
            }
          });
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn('Google Maps Script did not load, falling back to built-in pin selector:', err.message);
          setMapLoadError(err.message || 'Could not load Google Maps SDK');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const triggerChange = (addr, coords, extra = {}) => {
    if (onChange) {
      onChange({
        address: addr,
        coordinates: coords,
        city: extra.city || restaurantCity || 'Karachi',
        area: extra.area || '',
        landmark: extra.name || '',
      });
    }
  };

  // Search Pakistan Places directory (fallback or companion)
  const handleSearchPlaces = async (q) => {
    setSearchQuery(q);
    if (!q || q.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await api.get(`/public/pakistan-places?q=${encodeURIComponent(q.trim())}&city=${encodeURIComponent(restaurantCity || '')}`);
      if (res.success && Array.isArray(res.places)) {
        setSearchResults(res.places);
      }
    } catch (e) {
      // Local fallback matching
      const matches = DEFAULT_PAKISTAN_PRESETS.filter(
        (p) =>
          p.name.toLowerCase().includes(q.toLowerCase()) ||
          p.area.toLowerCase().includes(q.toLowerCase()) ||
          p.city.toLowerCase().includes(q.toLowerCase())
      );
      setSearchResults(matches);
    } finally {
      setSearching(false);
    }
  };

  // Select place preset
  const handleSelectPlace = (place) => {
    const newCoords = { lat: place.lat, lng: place.lng };
    const newAddr = `${place.name}, ${place.city}`;
    setCoordinates(newCoords);
    setAddressText(newAddr);
    setSearchQuery(newAddr);
    setSearchResults([]);

    if (googleMapInstance.current && markerInstance.current) {
      googleMapInstance.current.setCenter(newCoords);
      googleMapInstance.current.setZoom(15);
      markerInstance.current.setPosition(newCoords);
    }

    triggerChange(newAddr, newCoords, place);
  };

  // Browser Geolocation Detection
  const handleDetectCurrentLocation = () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingLocation(false);
        const newCoords = {
          lat: Number(pos.coords.latitude.toFixed(4)),
          lng: Number(pos.coords.longitude.toFixed(4)),
        };
        setCoordinates(newCoords);

        if (googleMapInstance.current && markerInstance.current) {
          googleMapInstance.current.setCenter(newCoords);
          googleMapInstance.current.setZoom(16);
          markerInstance.current.setPosition(newCoords);
        }

        const detectedAddr = addressText || `Detected Location near (${newCoords.lat}, ${newCoords.lng})`;
        setAddressText(detectedAddr);
        triggerChange(detectedAddr, newCoords);
      },
      (err) => {
        setIsDetectingLocation(false);
        let msg = 'Could not retrieve your GPS coordinates.';
        if (err.code === 1) msg = 'Location permission was denied. You can enter your address manually or use search.';
        else if (err.code === 2) msg = 'Location unavailable. You can search or adjust pin manually.';
        else if (err.code === 3) msg = 'Location request timed out.';
        setLocationError(msg);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Interactive Fallback Grid Click / Pin Placement
  const handleGridAdjust = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width; // 0 to 1
    const yRatio = (e.clientY - rect.top) / rect.height; // 0 to 1

    // Scale offset slightly within ~4km radius of current center
    const latOffset = (0.5 - yRatio) * 0.04;
    const lngOffset = (xRatio - 0.5) * 0.04;

    const newCoords = {
      lat: Number((coordinates.lat + latOffset).toFixed(4)),
      lng: Number((coordinates.lng + lngOffset).toFixed(4)),
    };
    setCoordinates(newCoords);
    triggerChange(addressText, newCoords);
  };

  return (
    <div className="space-y-3">
      {/* Search Input Bar */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchPlaces(e.target.value)}
            placeholder="Search address, landmark, area, or sector in Pakistan..."
            className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white shadow-2xs"
          />
          <button
            type="button"
            onClick={handleDetectCurrentLocation}
            disabled={isDetectingLocation}
            className="absolute right-1.5 px-2.5 py-1.5 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 text-[11px] font-bold flex items-center gap-1 transition-colors"
          >
            <Crosshair className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin' : ''}`} />
            <span>{isDetectingLocation ? 'Locating...' : 'My GPS'}</span>
          </button>
        </div>

        {/* Autocomplete Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-30 max-h-56 overflow-y-auto divide-y divide-gray-100 animate-fade-in">
            {searchResults.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPlace(item)}
                className="w-full text-left px-3.5 py-2.5 hover:bg-orange-50 flex items-start gap-2.5 transition-colors"
              >
                <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-gray-900">{item.name}</div>
                  <div className="text-[10px] text-gray-500">
                    {item.area ? `${item.area}, ` : ''}{item.city} (Lat: {item.lat}, Lng: {item.lng})
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Location Permission / Error Callout */}
      {locationError && (
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="text-[11px] font-semibold">{locationError}</span>
        </div>
      )}

      {/* Interactive Map Visual Container */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-slate-900 shadow-inner">
        {/* Google Maps SDK Canvas */}
        <div
          ref={mapRef}
          className={`w-full h-48 sm:h-56 transition-opacity duration-300 ${
            mapsLoaded ? 'opacity-100 block' : 'hidden'
          }`}
        />

        {/* Fallback Interactive Pakistan Pin Adjuster */}
        {!mapsLoaded && (
          <div
            onClick={handleGridAdjust}
            className="w-full h-48 sm:h-56 relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex flex-col items-center justify-center p-4 cursor-crosshair select-none"
          >
            {/* Grid background lines */}
            <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Simulated interactive crosshairs */}
            <div className="relative z-10 flex flex-col items-center animate-bounce">
              <div className="w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-600/50 ring-4 ring-orange-500/30">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="mt-1 px-2.5 py-0.5 rounded-full bg-slate-950/90 text-white text-[10px] font-black border border-slate-700 shadow-md">
                Delivery Pin: {coordinates.lat}, {coordinates.lng}
              </div>
            </div>

            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-slate-400 bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-slate-800 pointer-events-none">
              <span className="flex items-center gap-1 text-slate-300">
                <Compass className="w-3 h-3 text-orange-400" />
                <span>Click anywhere on grid to adjust pin</span>
              </span>
              <span className="text-orange-400 font-bold hidden sm:inline">
                {restaurantCity} Operating Grid
              </span>
            </div>
          </div>
        )}

        {/* Map Mode Badge */}
        <div className="absolute top-2 right-2 z-10">
          <span
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm backdrop-blur-md border ${
              mapsLoaded
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-900/80 text-orange-300 border-orange-500/30'
            }`}
          >
            {mapsLoaded ? '● Google Maps Live' : '● Pakistan Precision Pin'}
          </span>
        </div>
      </div>

      {/* Quick Landmark Presets for Supported Pakistani Locations */}
      <div>
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Navigation className="w-3 h-3 text-orange-600" />
          <span>Quick Landmarks ({restaurantCity})</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {DEFAULT_PAKISTAN_PRESETS.filter((p) => !restaurantCity || p.city.toLowerCase() === restaurantCity.toLowerCase())
            .slice(0, 4)
            .map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPlace(preset)}
                className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-orange-50 hover:text-orange-700 text-gray-700 text-[11px] font-semibold border border-gray-200 transition-colors"
              >
                {preset.name}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
