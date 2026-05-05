/**
 * Geocoding Service
 * Provides robust reverse geocoding with multi-provider fallbacks,
 * intelligent parsing for local hierarchy, and caching.
 */

// A simple utility to fetch with a timeout
const fetchWithTimeout = async (resource, options = {}) => {
  const { timeout = 8000 } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(resource, {
    ...options,
    signal: controller.signal  
  });
  clearTimeout(id);

  return response;
};

// Generate a cache key that groups nearby coordinates (~111m precision)
const getCacheKey = (lat, lon) => {
  return `geo_${Number(lat).toFixed(3)}_${Number(lon).toFixed(3)}`;
};

/**
 * Provider 1: BigDataCloud (Free, No Key Required)
 * Very good at identifying the principal locality, especially in India.
 */
const fetchFromBigDataCloud = async (latitude, longitude) => {
  const res = await fetchWithTimeout(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
  );
  if (!res.ok) throw new Error('BigDataCloud request failed');
  
  const data = await res.json();
  
  // Prefer locality, then city
  const city = data.locality || data.city || data.principalSubdivision || 'Your Location';
  
  return {
    city,
    state: data.principalSubdivision || '',
    country: data.countryName || '',
    provider: 'BigDataCloud'
  };
};

/**
 * Provider 2: OpenStreetMap Nominatim
 * Uses improved parsing to handle complex administrative hierarchies.
 */
const fetchFromNominatim = async (latitude, longitude) => {
  const res = await fetchWithTimeout(
    `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10&addressdetails=1`,
    { headers: { 'Accept-Language': 'en' } }
  );
  if (!res.ok) throw new Error('Nominatim request failed');
  
  const data = await res.json();
  if (!data || !data.address) throw new Error('Invalid Nominatim response');
  
  // Strict prioritization for the most accurate human-readable city
  const city = 
    data.address.city || 
    data.address.town || 
    data.address.municipality ||
    data.address.village ||
    data.address.suburb || 
    data.address.city_district ||
    data.address.county || 
    'Your Location';

  return {
    city,
    state: data.address.state || '',
    country: data.address.country || '',
    provider: 'Nominatim'
  };
};

/**
 * Main Exported Service
 */
export const geocodingAPI = {
  
  /**
   * Robust reverse geocode function with caching and fallback chaining.
   */
  reverseGeocode: async (latitude, longitude) => {
    const cacheKey = getCacheKey(latitude, longitude);
    
    // 1. Check Cache (24 hour TTL)
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsedCache = JSON.parse(cached);
        const age = Date.now() - parsedCache.timestamp;
        if (age < 24 * 60 * 60 * 1000) {
          return parsedCache.data;
        }
      } catch (e) {
        // Cache corrupted, ignore
      }
    }

    let result = null;

    // 2. Try Primary Provider (BigDataCloud)
    try {
      result = await fetchFromBigDataCloud(latitude, longitude);
    } catch (err1) {
      console.warn('Primary geocoding (BigDataCloud) failed:', err1);
      
      // 3. Try Secondary Provider (Nominatim)
      try {
        result = await fetchFromNominatim(latitude, longitude);
      } catch (err2) {
        console.error('Secondary geocoding (Nominatim) failed:', err2);
        
        // 4. Absolute Fallback
        result = {
          city: 'Your Location',
          state: '',
          country: '',
          provider: 'Fallback'
        };
      }
    }

    // 5. Save to Cache
    if (result && result.provider !== 'Fallback') {
      localStorage.setItem(cacheKey, JSON.stringify({
        timestamp: Date.now(),
        data: result
      }));
    }

    return result;
  }
};
