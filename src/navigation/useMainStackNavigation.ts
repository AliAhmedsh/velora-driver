import { CommonActions, useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList, MainTabParamList } from './types';

export type MainTabNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList>,
  NativeStackNavigationProp<MainStackParamList>
>;

/** Navigate to stack screens from tab screens. */
export function useMainStackNavigation(): MainTabNavigationProp {
  const navigation = useNavigation<MainTabNavigationProp>();

  return {
    ...navigation,
    navigate<RouteName extends keyof MainStackParamList>(
      name: RouteName,
      params?: MainStackParamList[RouteName],
    ) {
      navigation.dispatch(
        CommonActions.navigate({
          name: name as string,
          params: params as object | undefined,
        }),
      );
    },
  } as MainTabNavigationProp;
}

export const IN_PROGRESS_RIDE_STATUSES = [
  'searching',
  'driver_assigned',
  'driver_arriving',
  'in_progress',
] as const;
