export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Trips: undefined;
  Earnings: undefined;
  Wallet: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  DriverRide: undefined;
  DestinationQueue: undefined;
  Chat: { rideId?: string } | undefined;
  Notifications: undefined;
  Support: undefined;
  Documents: undefined;
  VehicleRegistration: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};
