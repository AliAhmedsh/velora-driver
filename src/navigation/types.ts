export type AuthStackParamList = {
  Welcome: undefined;
  Phone: undefined;
  OTP: { phone: string };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Trips: undefined;
  Earnings: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  DriverRide: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};
