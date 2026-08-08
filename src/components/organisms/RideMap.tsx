import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import type { RideLocation } from '../../types/ride';

type RideMapProps = {
  pickup?: RideLocation | null;
  dropoff?: RideLocation | null;
  driverLocation?: RideLocation | null;
  showRoute?: boolean;
};

export function RideMap({ pickup, dropoff, driverLocation, showRoute = true }: RideMapProps) {
  const points = [pickup, dropoff, driverLocation].filter(Boolean) as RideLocation[];

  const center = pickup ?? dropoff ?? {
    latitude: 33.6844,
    longitude: 73.0479,
    address: '',
  };

  const routeCoords =
    showRoute && pickup && dropoff
      ? [
          { latitude: pickup.latitude, longitude: pickup.longitude },
          { latitude: dropoff.latitude, longitude: dropoff.longitude },
        ]
      : [];

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: center.latitude,
          longitude: center.longitude,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}
        region={
          points.length > 0
            ? {
                latitude: center.latitude,
                longitude: center.longitude,
                latitudeDelta: 0.12,
                longitudeDelta: 0.12,
              }
            : undefined
        }
        showsUserLocation
        showsMyLocationButton={Platform.OS === 'android'}>
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
  container: { flex: 1 },
  map: { flex: 1 },
});
