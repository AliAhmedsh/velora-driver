import type { AcPreference, FuelOption, PaymentMethod, RentalDuration, ServiceType } from './booking';

export type RideStatus =
  | 'scheduled'
  | 'searching'
  | 'driver_assigned'
  | 'driver_arriving'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type RideLocation = {
  latitude: number;
  longitude: number;
  address: string;
};

export type Ride = {
  id: string;
  riderName: string;
  driverName?: string;
  driverRating?: number;
  pickup: RideLocation;
  dropoff: RideLocation;
  fare: number;
  recommendedFare?: number;
  customerOffer?: number;
  status: RideStatus;
  serviceType: ServiceType;
  scheduledAt?: string;
  originCity?: string;
  destinationCity?: string;
  fuelOption?: FuelOption;
  rentalDuration?: RentalDuration;
  vehicleCount?: number;
  distanceKm?: number;
  durationMin?: number;
  paymentMethod?: PaymentMethod;
  driverId?: string;
  womenOnly?: boolean;
  acPreference?: AcPreference;
  negotiationEnabled?: boolean;
  createdAt: string;
};

export type RideHistoryItem = {
  id: string;
  from: string;
  to: string;
  fare: string;
  date: string;
  status: RideStatus;
};
