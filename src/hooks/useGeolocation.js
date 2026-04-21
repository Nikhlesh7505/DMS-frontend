import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to get user's current geolocation
 * @returns {Object} - Location data, error, and loading state
 */
export const useGeolocation = () => {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLoading(false);
      },
      (err) => {
        let errorMsg = 'Failed to get location';
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMsg = 'Location permission denied';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMsg = 'Location information is unavailable';
            break;
          case err.TIMEOUT:
            errorMsg = 'Location request timed out';
            break;
          default:
            errorMsg = err.message;
        }
        setError(errorMsg);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  return { location, error, loading, getLocation };
};
