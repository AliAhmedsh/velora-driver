import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { VeloraText } from '@components/atoms/VeloraText';
import { DashboardScreen } from '@features/dashboard/screens/DashboardScreen';
import { TripsScreen } from '@features/trips/screens/TripsScreen';
import { EarningsScreen } from '@features/earnings/screens/EarningsScreen';
import { ProfileScreen } from '@features/profile/screens/ProfileScreen';
import { useTheme } from '@hooks/useTheme';
import { MainTabParamList } from './types';
import { spacing, shadow } from '@theme/spacing';

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const { theme } = useTheme();
  const icons: Record<string, string> = {
    Dashboard: '◉',
    Trips: '☰',
    Earnings: '◈',
    Profile: '○',
  };

  return (
    <View style={styles.tabItem}>
      <VeloraText
        variant="h3"
        color={focused ? theme.colors.tabBarActive : theme.colors.tabBarInactive}>
        {icons[label]}
      </VeloraText>
      <VeloraText
        variant="tab"
        color={focused ? theme.colors.tabBarActive : theme.colors.tabBarInactive}>
        {label}
      </VeloraText>
    </View>
  );
}

export function MainNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          shadow.md,
          {
            backgroundColor: theme.colors.tabBar,
            borderTopColor: theme.colors.border,
          },
        ],
        tabBarShowLabel: false,
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
      })}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Trips" component={TripsScreen} />
      <Tab.Screen name="Earnings" component={EarningsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 72,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  tabItem: { alignItems: 'center', gap: 4 },
});
