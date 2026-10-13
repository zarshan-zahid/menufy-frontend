/**
 * Google Maps Loader and Pakistan Mapping Utilities
 * Safe async loader that handles missing keys, network errors, and billing restrictions gracefully.
 */

let googleMapsPromise = null;

export const isGoogleMapsConfigured = () => {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  return Boolean(key && key.trim() && key !== 'YOUR_GOOGLE_MAPS_API_KEY');
};

export const loadGoogleMapsScript = () => {
  if (typeof window !== 'undefined' && window.google && window.google.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (googleMapsPromise) return googleMapsPromise;

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
    return Promise.reject(new Error('VITE_GOOGLE_MAPS_API_KEY is not configured in client environment.'));
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    // Check if script element already inserted
    const existing = document.getElementById('google-maps-script');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google.maps));
      existing.addEventListener('error', (e) => reject(e));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey.trim()
    )}&libraries=places,geometry&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google && window.google.maps) {
        resolve(window.google.maps);
      } else {
        reject(new Error('Google Maps script loaded but window.google.maps was not found.'));
      }
    };

    script.onerror = () => {
      reject(new Error('Failed to load Google Maps script. Check network connection or API key restrictions.'));
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
};
