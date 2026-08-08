import React, { useEffect, useMemo, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import type { RideLocation } from '../../types/ride';
import { ISLAMABAD_CENTER } from '../../utils/locations';

type RideMapProps = {
  pickup?: RideLocation | null;
  dropoff?: RideLocation | null;
  driverLocation?: RideLocation | null;
  showRoute?: boolean;
};

export function RideMap({ pickup, dropoff, driverLocation, showRoute = true }: RideMapProps) {
  const mapRef = useRef<MapView>(null);

  const center = useMemo(() => {
    const points = [pickup, dropoff, driverLocation].filter(Boolean) as RideLocation[];
    if (points.length === 0) return ISLAMABAD_CENTER;

    const latitude = points.reduce((sum, p) => sum + p.latitude, 0) / points.length;
    const longitude = points.reduce((sum, p) => sum + p.longitude, 0) / points.length;
    return { latitude, longitude, address: '' };
  }, [pickup, dropoff, driverLocation]);

  const routeCoords =
    showRoute && pickup && dropoff
      ? [
          { latitude: pickup.latitude, longitude: pickup.longitude },
          { latitude: dropoff.latitude, longitude: dropoff.longitude },
        ]
      : [];

  const mapProvider = Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined;

  useEffect(() => {
    mapRef.current?.animateToRegion(
      {
        latitude: center.latitude,
        longitude: center.longitude,
        latitudeDelta: 0.12,
        longitudeDelta: 0.12,
      },
      400,
    );
  }, [center.latitude, center.longitude]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={mapProvider}
        style={styles.map}
        initialRegion={{
          latitude: center.latitude,
          longitude: center.longitude,
          latitudeDelta: 0.12,
          longitudeDelta: 0.12,
        }}
        showsUserLocation
        showsMyLocationButton={Platform.OS === 'android'}
        loadingEnabled>
        {pickup && (
          <Marker
            coordinate={{ latitude: pickup.latitude, longitude: pickup.longitude }}
            title="Pickup"
            description={pickup.address}
            pinColor="#7C4A2D"
          />
        )}
        {dropoff && (
          <Marker
            coordinate={{ latitude: dropoff.latitude, longitude: dropoff.longitude }}
            title="Drop-off"
            description={dropoff.address}
            pinColor="#C9A66B"
          />
        )}
        {driverLocation && (
          <Marker
            coordinate={{ latitude: driverLocation.latitude, longitude: driverLocation.longitude }}
            title="You"
            pinColor="#3D8B5F"
          />
        )}
        {routeCoords.length === 2 && (
          <Polyline coordinates={routeCoords} strokeColor="#7C4A2D" strokeWidth={4} />
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
    ...StyleSheet.absoluteFillObject,
  },
});
