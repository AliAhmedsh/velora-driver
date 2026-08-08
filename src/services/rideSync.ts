import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Ride } from '../types/ride';

export const RIDE_STORAGE_KEY = 'velora_active_ride';
export const RIDE_HISTORY_KEY = 'velora_ride_history';

export async function persistActiveRide(ride: Ride | null): Promise<void> {
  if (ride) {
    await AsyncStorage.setItem(RIDE_STORAGE_KEY, JSON.stringify(ride));
  } else {
    await AsyncStorage.removeItem(RIDE_STORAGE_KEY);
  }
}

export async function loadActiveRide(): Promise<Ride | null> {
  const raw = await AsyncStorage.getItem(RIDE_STORAGE_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as Ride;
}

export async function persistRideHistory(history: Ride[]): Promise<void> {
  await AsyncStorage.setItem(RIDE_HISTORY_KEY, JSON.stringify(history));
}

export async function loadRideHistory(): Promise<Ride[]> {
  const raw = await AsyncStorage.getItem(RIDE_HISTORY_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as Ride[];
}
