import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigator } from './MainNavigator';
import { DriverRideScreen } from '@features/ride/screens/DriverRideScreen';
import { MainStackParamList } from './types';
import { useRideSync } from '@hooks/useRideSync';
import { useAppSelector } from '@hooks/useAppDispatch';

const Stack = createNativeStackNavigator<MainStackParamList>();

function DriverRideRedirect() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { isOnline, activeRide } = useAppSelector(state => state.ride);

  useEffect(() => {
    if (!isOnline || !activeRide) return;
    if (activeRide.status === 'searching' || activeRide.status === 'driver_assigned' ||
        activeRide.status === 'driver_arriving' || activeRide.status === 'in_progress') {
      navigation.navigate('DriverRide');
    }
  }, [isOnline, activeRide, navigation]);

  return null;
}

export function MainStackNavigator() {
  useRideSync();

  return (
    <>
      <DriverRideRedirect />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainNavigator} />
        <Stack.Screen name="DriverRide" component={DriverRideScreen} />
      </Stack.Navigator>
    </>
  );
}
