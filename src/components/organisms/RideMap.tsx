import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import type { RideLocation } from '../../types/ride';
import { ISLAMABAD_CENTER } from '../../utils/locations';

type RideMapProps = {
  pickup?: RideLocation | null;
  dropoff?: RideLocation | null;
  driverLocation?: RideLocation | null;
  showRoute?: boolean;
};

const PIN = {
  pickup: '#7C4A2D',
  dropoff: '#C9A66B',
  driver: '#3D8B5F',
};

function Pin({ color }: { color: string }) {
  return <View style={[styles.pin, { backgroundColor: color }]} />;
}

export function RideMap({ pickup, dropoff, driverLocation, showRoute = true }: RideMapProps) {
  const mapRef = useRef<MapView>(null);

  const center = useMemo(() => {
    const points = [pickup, dropoff, driverLocation].filter(Boolean) as RideLocation[];
    if (points.length === 0) return ISLAMABAD_CENTER;

    const latitude = points.reduce((sum, p) => sum + p.latitude, 0) / points.length;
    const longitude = points.reduce((sum, p) => sum + p.longitude, 0) / points.length;
    return { latitude, longitude, address: '' };
  }, [pickup, dropoff, driverLocation]);

  const region = useMemo(
    () => ({
      latitude: center.latitude,
      longitude: center.longitude,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    }),
    [center.latitude, center.longitude],
  );

  useEffect(() => {
    mapRef.current?.animateToRegion(region, 400);
  }, [region]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation
      >
        {showRoute && pickup && dropoff && (
          <Polyline
            coordinates={[
              { latitude: pickup.latitude, longitude: pickup.longitude },
              { latitude: dropoff.latitude, longitude: dropoff.longitude },
            ]}
            strokeColor="#7C4A2D"
            strokeWidth={4}
          />
        )}

        {pickup && (
          <Marker coordinate={{ latitude: pickup.latitude, longitude: pickup.longitude }}>
            <Pin color={PIN.pickup} />
          </Marker>
        )}
        {dropoff && (
          <Marker coordinate={{ latitude: dropoff.latitude, longitude: dropoff.longitude }}>
            <Pin color={PIN.dropoff} />
          </Marker>
        )}
        {driverLocation && (
          <Marker coordinate={{ latitude: driverLocation.latitude, longitude: driverLocation.longitude }}>
            <Pin color={PIN.driver} />
          </Marker>
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 240,
    backgroundColor: '#E8DDD0',
  },
  map: {
    flex: 1,
  },
  pin: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
});
