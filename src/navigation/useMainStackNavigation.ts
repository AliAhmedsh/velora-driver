import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp, NavigationProp, ParamListBase } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList, MainTabParamList } from './types';

export type MainTabNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList>,
  NativeStackNavigationProp<MainStackParamList>
>;

function navigateOnParentStack<RouteName extends keyof MainStackParamList>(
  navigation: NavigationProp<ParamListBase>,
  name: RouteName,
  params?: MainStackParamList[RouteName],
) {
  let current: NavigationProp<ParamListBase> | undefined = navigation;

  while (current) {
    const routeNames = current.getState().routeNames;
    if (routeNames.includes(name as string)) {
      if (params !== undefined) {
        current.navigate(name as string, params as object);
      } else {
        current.navigate(name as string);
      }
      return;
    }
    current = current.getParent() ?? undefined;
  }
}

/** Navigate to screens on the main stack from nested tab screens. */
export function useMainStackNavigation() {
  const navigation = useNavigation<MainTabNavigationProp>();

  return {
    ...navigation,
    navigate<RouteName extends keyof MainStackParamList>(
      name: RouteName,
      params?: MainStackParamList[RouteName],
    ) {
      navigateOnParentStack(navigation, name, params);
    },
  };
}

export const IN_PROGRESS_RIDE_STATUSES = [
  'searching',
  'driver_assigned',
  'driver_arriving',
  'in_progress',
] as const;
