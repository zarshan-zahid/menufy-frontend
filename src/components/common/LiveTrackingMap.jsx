import React, { useEffect, useRef, useState } from 'react';
import {
  Bike,
  UtensilsCrossed,
  MapPin,
  Clock,
  Compass,
  AlertTriangle,
  Radio,
  CheckCircle2,
  Navigation,
} from 'lucide-react';
import { loadGoogleMapsScript, isGoogleMapsConfigured } from '../../utils/googleMaps';

export default function LiveTrackingMap({
  orderNumber,
  status,
  restaurantLocation,
  destinationLocation,
  assignedRider,
  riderLocation,
  distanceKm,
  etaMinutes,
}) {
  const mapRef = useRef(null);
  const googleMapInstance = useRef(null);
  const markersRef = useRef({ restaurant: null, destination: null, rider: null });
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [timeAgoText, setTimeAgoText] = useState('Just now');

  // Compute stale condition (> 2 minutes without updates)
  const isStale = Boolean(
    riderLocation?.updatedAt &&
      Date.now() - new Date(riderLocation.updatedAt).getTime() > 120000
  );

  const isGpsDenied = Boolean(riderLocation?.permissionDenied);

  // Time-ago ticker
  useEffect(() => {
    if (!riderLocation?.updatedAt) {
      setTimeAgoText('No GPS telemetry yet');
      return;
    }

    const updateTicker = () => {
      const diffSec = Math.floor((Date.now() - new Date(riderLocation.updatedAt).getTime()) / 1000);
      if (diffSec < 5) setTimeAgoText('Just now');
      else if (diffSec < 60) setTimeAgoText(`${diffSec}s ago`);
      else {
        const mins = Math.floor(diffSec / 60);
        setTimeAgoText(`${mins}m ago`);
      }
    };

    updateTicker();
    const interval = setInterval(updateTicker, 3000);
    return () => clearInterval(interval);
  }, [riderLocation?.updatedAt]);

  // Attempt Google Maps integration
  useEffect(() => {
    if (!isGoogleMapsConfigured()) return;

    let isMounted = true;
    loadGoogleMapsScript()
      .then((googleMaps) => {
        if (!isMounted || !mapRef.current) return;
        setMapsLoaded(true);

        const centerLat =
          riderLocation?.lat ||
          destinationLocation?.coordinates?.lat ||
          restaurantLocation?.coordinates?.lat ||
          24.8607;
        const centerLng =
          riderLocation?.lng ||
          destinationLocation?.coordinates?.lng ||
          restaurantLocation?.coordinates?.lng ||
          67.0011;

        const map = new googleMaps.Map(mapRef.current, {
          center: { lat: centerLat, lng: centerLng },
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        googleMapInstance.current = map;

        // 1. Restaurant Marker
        if (restaurantLocation?.coordinates?.lat) {
          markersRef.current.restaurant = new googleMaps.Marker({
            position: restaurantLocation.coordinates,
            map,
            title: restaurantLocation.name || 'Kitchen',
            icon: {
              path: googleMaps.SymbolPath.BACKWARD_CLOSED_ARROW,
              scale: 5,
              fillColor: '#ea580c',
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#ffffff',
            },
          });
        }

        // 2. Customer Destination Marker
        if (destinationLocation?.coordinates?.lat) {
          markersRef.current.destination = new googleMaps.Marker({
            position: destinationLocation.coordinates,
            map,
            title: 'Delivery Destination',
            icon: {
              path: googleMaps.SymbolPath.CIRCLE,
              scale: 7,
              fillColor: '#3b82f6',
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#ffffff',
            },
          });
        }
      })
      .catch((err) => {
        console.warn('Google Maps tracking SDK unavailable, using live radar map view.');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Update Rider Marker on Google Map when position changes
  useEffect(() => {
    if (
      mapsLoaded &&
      window.google &&
      googleMapInstance.current &&
      riderLocation?.lat &&
      riderLocation?.lng &&
      !riderLocation.permissionDenied
    ) {
      const googleMaps = window.google.maps;
      const riderPos = { lat: riderLocation.lat, lng: riderLocation.lng };

      if (!markersRef.current.rider) {
        markersRef.current.rider = new googleMaps.Marker({
          position: riderPos,
          map: googleMapInstance.current,
          title: assignedRider?.name || 'Courier',
          icon: {
            path: googleMaps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 6,
            fillColor: '#10b981',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#ffffff',
          },
        });
      } else {
        markersRef.current.rider.setPosition(riderPos);
      }

      // Fit bounds to show rider and destination
      const bounds = new googleMaps.LatLngBounds();
      bounds.extend(riderPos);
      if (destinationLocation?.coordinates?.lat) {
        bounds.extend(destinationLocation.coordinates);
      }
      googleMapInstance.current.fitBounds(bounds, 50);
    }
  }, [mapsLoaded, riderLocation]);

  return (
    <div className="space-y-3">
      {/* Telemetry Status Bar */}
      <div className="p-3.5 bg-slate-900 border border-slate-800 text-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
              Real-Time Courier Tracking
            </div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>{assignedRider?.name || 'Courier Assigned'}</span>
              <span className="text-[10px] text-slate-400">• {timeAgoText}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {distanceKm !== null && distanceKm !== undefined && (
            <div className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700">
              📍 {distanceKm.toFixed(1)} km away
            </div>
          )}
          {etaMinutes !== null && etaMinutes !== undefined && (
            <div className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              ⏱ ~{etaMinutes} mins ETA
            </div>
          )}
        </div>
      </div>

      {/* Fallback & Stale Notices */}
      {isGpsDenied && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Rider has not enabled GPS location sharing on their device. Your food is on its way according to schedule.
          </span>
        </div>
      )}

      {isStale && !isGpsDenied && riderLocation && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>
            Rider location has not updated recently (signal may be weak). Last recorded: {timeAgoText}.
          </span>
        </div>
      )}

      {/* Map Visual Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl">
        {/* Google Maps SDK Canvas */}
        <div
          ref={mapRef}
          className={`w-full h-64 sm:h-72 transition-opacity duration-300 ${
            mapsLoaded ? 'opacity-100 block' : 'hidden'
          }`}
        />

        {/* Live Vector Radar Visual Canvas (Fallback Mode) */}
        {!mapsLoaded && (
          <div className="w-full h-64 sm:h-72 relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6 select-none overflow-hidden">
            {/* Radar Circular Grid & Scan Wave */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-80 h-80 rounded-full border border-orange-500/10" />
              <div className="w-56 h-56 rounded-full border border-orange-500/15" />
              <div className="w-32 h-32 rounded-full border border-orange-500/20" />
              <div className="w-16 h-16 rounded-full bg-orange-500/5" />
            </div>

            {/* Connecting Delivery Vector Line */}
            <div className="relative z-10 w-full max-w-md flex items-center justify-between px-4 sm:px-8">
              {/* Point A: Restaurant Kitchen */}
              <div className="flex flex-col items-center text-center space-y-1">
                <div className="w-10 h-10 rounded-2xl bg-orange-600/30 border border-orange-500/50 text-orange-400 flex items-center justify-center shadow-lg">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-black text-slate-300 max-w-[80px] truncate">
                  {restaurantLocation?.name || 'Kitchen'}
                </div>
                <div className="text-[9px] text-slate-500">Pickup Origin</div>
              </div>

              {/* Vector Corridor with Moving Courier Marker */}
              <div className="flex-1 px-4 relative flex items-center justify-center">
                <div className="w-full border-t-2 border-dashed border-orange-500/40" />

                {/* Courier Motorcycle Indicator */}
                <div className="absolute flex flex-col items-center animate-pulse">
                  <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 ring-4 ring-emerald-500/20">
                    <Bike className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-black text-emerald-400 mt-1 bg-slate-950/90 px-2 py-0.5 rounded-full border border-slate-800">
                    {assignedRider?.name || 'Rider'}
                  </span>
                </div>
              </div>

              {/* Point B: Customer Destination */}
              <div className="flex flex-col items-center text-center space-y-1">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-500/50 text-blue-400 flex items-center justify-center shadow-lg">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-black text-slate-300 max-w-[80px] truncate">
                  {destinationLocation?.address || 'Your Address'}
                </div>
                <div className="text-[9px] text-slate-500">Destination</div>
              </div>
            </div>

            {/* Bottom Telemetry Ribbon */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] text-slate-400 bg-slate-950/90 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Compass className="w-3 h-3 text-orange-400" />
                <span>
                  {riderLocation?.lat
                    ? `Live Telemetry: (${riderLocation.lat}, ${riderLocation.lng})`
                    : 'Awaiting rider device GPS broadcast...'}
                </span>
              </span>
              <span className="text-orange-400 font-bold">Standard Radar Dispatch View</span>
            </div>
          </div>
        )}

        {/* Live Badge */}
        <div className="absolute top-3 right-3 z-10">
          <span
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm backdrop-blur-md border flex items-center gap-1.5 ${
              mapsLoaded
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-900/90 text-orange-300 border-orange-500/30'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>{mapsLoaded ? 'Google Satellite Tracking' : 'Real-Time Dispatch Radar'}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
