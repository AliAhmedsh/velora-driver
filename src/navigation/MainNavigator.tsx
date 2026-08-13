import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '@features/dashboard/screens/DashboardScreen';
import { TripsScreen } from '@features/trips/screens/TripsScreen';
import { EarningsScreen } from '@features/earnings/screens/EarningsScreen';
import { WalletScreen } from '@features/wallet/screens/WalletScreen';
import { ProfileScreen } from '@features/profile/screens/ProfileScreen';
import { MainTabParamList } from './types';
import { CustomTabBar } from './CustomTabBar';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={props => <CustomTabBar {...props} />}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Trips" component={TripsScreen} />
      <Tab.Screen name="Earnings" component={EarningsScreen} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
