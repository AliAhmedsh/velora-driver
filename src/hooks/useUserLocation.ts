import { useEffect, useState } from 'react';
import Geolocation from '@react-native-community/geolocation';
import type { RideLocation } from '../types/ride';
import { ISLAMABAD_CENTER } from '../utils/locations';

export function useUserLocation() {
  const [location, setLocation] = useState<RideLocation>(ISLAMABAD_CENTER);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Geolocation.requestAuthorization();
    Geolocation.getCurrentPosition(
      position => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          address: 'Your location',
        });
        setLoading(false);
      },
      () => {
        setLocation(ISLAMABAD_CENTER);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  }, []);

  return { location, loading };
}
