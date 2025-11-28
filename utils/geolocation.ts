import * as Location from 'expo-location';
import { Platform } from 'react-native';

export interface GeolocationResult {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  method: 'native' | 'browser' | 'ip-fallback';
}

export interface GeolocationError {
  code: string;
  message: string;
  canRetry: boolean;
}

/**
 * Check if geolocation is available and not blocked
 */
export const checkGeolocationAvailability = (): { available: boolean; reason?: string } => {
  // Check if running in web
  if (Platform.OS === 'web') {
    // Check secure context
    if (typeof window !== 'undefined' && window.isSecureContext === false) {
      return {
        available: false,
        reason: 'insecure-context'
      };
    }

    // Check if geolocation API exists
    if (!navigator.geolocation) {
      return {
        available: false,
        reason: 'not-supported'
      };
    }

    return { available: true };
  }

  // Mobile is always available (will ask for permissions)
  return { available: true };
};

/**
 * Get location using browser's native geolocation API
 */
const getBrowserLocation = (): Promise<GeolocationResult> => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject({
        code: 'TIMEOUT',
        message: 'Location request timed out after 10 seconds',
        canRetry: true
      });
    }, 10000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeout);
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          method: 'browser'
        });
      },
      (error) => {
        clearTimeout(timeout);
        let errorCode = 'UNKNOWN';
        let errorMessage = 'Failed to get location';
        let canRetry = true;

        switch (error.code) {
          case 1: // PERMISSION_DENIED
            errorCode = 'PERMISSION_DENIED';
            errorMessage = 'Location access was denied';
            canRetry = false;
            break;
          case 2: // POSITION_UNAVAILABLE
            errorCode = 'POSITION_UNAVAILABLE';
            errorMessage = 'Location information is unavailable';
            canRetry = true;
            break;
          case 3: // TIMEOUT
            errorCode = 'TIMEOUT';
            errorMessage = 'Location request timed out';
            canRetry = true;
            break;
        }

        reject({ code: errorCode, message: errorMessage, canRetry });
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
};

/**
 * Get location using Expo Location API (mobile)
 */
const getMobileLocation = async (): Promise<GeolocationResult> => {
  // Request permissions
  const { status } = await Location.requestForegroundPermissionsAsync();
  
  if (status !== 'granted') {
    throw {
      code: 'PERMISSION_DENIED',
      message: 'Location permission was denied',
      canRetry: false
    };
  }

  // Get location with timeout
  const locationPromise = Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject({
      code: 'TIMEOUT',
      message: 'Location request timed out',
      canRetry: true
    }), 10000);
  });

  const location = await Promise.race([locationPromise, timeoutPromise]) as any;

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    method: 'native'
  };
};

/**
 * IP-based geolocation fallback using ipapi.co
 */
const getIPBasedLocation = async (): Promise<GeolocationResult> => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    
    if (!response.ok) {
      throw new Error('IP geolocation service unavailable');
    }

    const data = await response.json();

    return {
      latitude: data.latitude,
      longitude: data.longitude,
      city: data.city,
      region: data.region,
      postalCode: data.postal,
      country: data.country_name,
      address: `${data.city}, ${data.region}, ${data.country_name}`,
      method: 'ip-fallback'
    };
  } catch (error) {
    throw {
      code: 'IP_FALLBACK_FAILED',
      message: 'Could not determine location from IP address',
      canRetry: false
    };
  }
};

/**
 * Reverse geocode coordinates to get address
 */
export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<Partial<GeolocationResult>> => {
  if (Platform.OS === 'web') {
    // Use Nominatim for web (free, no API key required)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Fleety-App'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }

      const data = await response.json();
      const addr = data.address || {};

      return {
        address: data.display_name,
        city: addr.city || addr.town || addr.village,
        region: addr.state,
        postalCode: addr.postcode,
        country: addr.country
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return {};
    }
  } else {
    // Use Expo Location for mobile
    try {
      const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      
      if (geocode && geocode.length > 0) {
        const address = geocode[0];
        const addressParts = [
          address.name,
          address.street,
          address.subregion,
          address.city,
          address.region
        ].filter(Boolean);

        return {
          address: addressParts.join(', '),
          city: address.city || '',
          region: address.region || '',
          postalCode: address.postalCode || '',
          country: address.country || ''
        };
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  }

  return {};
};

/**
 * Main function to get user location with all fallbacks
 */
export const getUserLocation = async (): Promise<GeolocationResult> => {
  console.log('=== getUserLocation started ===');
  console.log('Platform:', Platform.OS);

  // Check availability
  const availability = checkGeolocationAvailability();
  
  if (!availability.available) {
    console.log('Geolocation not available:', availability.reason);
    
    if (availability.reason === 'insecure-context') {
      throw {
        code: 'INSECURE_CONTEXT',
        message: 'Location services require a secure connection (HTTPS)',
        canRetry: false
      };
    }
    
    if (availability.reason === 'not-supported') {
      throw {
        code: 'NOT_SUPPORTED',
        message: 'Location services are not supported in this browser',
        canRetry: false
      };
    }
  }

  try {
    // Try native location first
    let locationResult: GeolocationResult;

    if (Platform.OS === 'web') {
      console.log('Using browser geolocation...');
      locationResult = await getBrowserLocation();
    } else {
      console.log('Using mobile location...');
      locationResult = await getMobileLocation();
    }

    console.log('Location obtained:', locationResult);

    // Reverse geocode to get address
    console.log('Reverse geocoding...');
    const addressData = await reverseGeocode(locationResult.latitude, locationResult.longitude);
    
    return {
      ...locationResult,
      ...addressData
    };
  } catch (error: any) {
    console.error('Primary location method failed:', error);

    // If permission denied, don't fallback
    if (error.code === 'PERMISSION_DENIED') {
      throw error;
    }

    // Skip IP fallback for now due to CORS issues in production
    // Just throw the original error with helpful message
    console.error('Location detection failed. IP fallback skipped due to CORS restrictions.');
    throw {
      code: 'LOCATION_UNAVAILABLE',
      message: 'Could not detect your location. Please allow location access in your browser or enter address manually.',
      canRetry: true
    };
  }
};

/**
 * Check browser permission status (web only)
 */
export const checkBrowserPermission = async (): Promise<'granted' | 'denied' | 'prompt' | 'unavailable'> => {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined' || !navigator.permissions) {
    return 'unavailable';
  }

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
    return result.state as 'granted' | 'denied' | 'prompt';
  } catch (error) {
    console.error('Permission query error:', error);
    return 'prompt'; // Default to prompt if query fails
  }
};
