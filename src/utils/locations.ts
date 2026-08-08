import type { RideLocation } from '../types/ride';

export const ISLAMABAD_CENTER: RideLocation = {
  latitude: 33.6844,
  longitude: 73.0479,
  address: 'Islamabad City Center',
};

export type PresetDestination = RideLocation & { id: string };

export const PRESET_DESTINATIONS: PresetDestination[] = [
  { id: 'f7', address: 'F-7 Markaz', latitude: 33.7215, longitude: 73.0433 },
  { id: 'airport', address: 'Islamabad Airport', latitude: 33.5607, longitude: 72.8516 },
  { id: 'blue', address: 'Blue Area', latitude: 33.7077, longitude: 73.0563 },
  { id: 'dha', address: 'DHA Phase 2', latitude: 33.5341, longitude: 73.1677 },
];

export function estimateFare(pickup: RideLocation, dropoff: RideLocation): number {
  const latDiff = pickup.latitude - dropoff.latitude;
  const lngDiff = pickup.longitude - dropoff.longitude;
  const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111;
  const base = 500;
  const perKm = 180;
  return Math.round(base + distance * perKm);
}

export function formatFare(amount: number): string {
  return `PKR ${amount.toLocaleString('en-PK')}`;
}
