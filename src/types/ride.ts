export type RideStatus =
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
  status: RideStatus;
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
