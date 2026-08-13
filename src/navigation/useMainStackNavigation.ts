import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from './types';

/** Navigate to screens on the main stack from nested tab screens. */
export function useMainStackNavigation() {
  const navigation = useNavigation();
  const stack =
    navigation.getParent<NativeStackNavigationProp<MainStackParamList>>() ??
    (navigation as NativeStackNavigationProp<MainStackParamList>);
  return stack;
}

export const IN_PROGRESS_RIDE_STATUSES = [
  'searching',
  'driver_assigned',
  'driver_arriving',
  'in_progress',
] as const;
