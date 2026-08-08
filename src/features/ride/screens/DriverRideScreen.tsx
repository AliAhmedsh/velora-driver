import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@components/atoms/Button';
import { VeloraText } from '@components/atoms/VeloraText';
import { RideMap } from '@components/organisms/RideMap';
import { useTheme } from '@hooks/useTheme';
import { useUserLocation } from '@hooks/useUserLocation';
import { useAppDispatch, useAppSelector } from '@hooks/useAppDispatch';
import { acceptRide, advanceRideStatus, declineRide } from '@store';
import { MainStackParamList } from '@navigation/types';
import { spacing, radius, shadow } from '@theme/spacing';
import { formatFare } from '@utils/locations';

type Props = NativeStackScreenProps<MainStackParamList, 'DriverRide'>;

const ACTION_LABELS: Record<string, string> = {
  driver_assigned: 'Start heading to pickup',
  driver_arriving: 'Start trip',
  in_progress: 'Complete trip',
};

export function DriverRideScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const ride = useAppSelector(state => state.ride.activeRide);
  const { location: driverLocation } = useUserLocation();

  if (!ride) {
    navigation.goBack();
    return null;
  }

  const isIncoming = ride.status === 'searching';
  const actionLabel = ACTION_LABELS[ride.status];

  const handleAccept = async () => {
    await dispatch(acceptRide());
  };

  const handleDecline = async () => {
    await dispatch(declineRide());
    navigation.goBack();
  };

  const handleAdvance = async () => {
    const result = await dispatch(advanceRideStatus());
    if (result.payload?.ride?.status === 'completed') {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <View style={styles.mapWrap}>
        <RideMap
          pickup={ride.pickup}
          dropoff={ride.dropoff}
          driverLocation={driverLocation}
          showRoute
        />
      </View>

      <View
        style={[
          styles.sheet,
          shadow.lg,
          {
            backgroundColor: theme.colors.card,
            paddingBottom: insets.bottom + spacing.lg,
          },
        ]}>
        <View style={styles.sheetHeader}>
          <VeloraText variant="h3">
            {isIncoming ? 'New ride request' : 'Active ride'}
          </VeloraText>
        </View>

        <VeloraText variant="bodyMedium" style={styles.riderName}>
          Rider: {ride.riderName}
        </VeloraText>

        <View style={styles.route}>
          <VeloraText variant="bodyMedium">{ride.pickup.address}</VeloraText>
          <VeloraText variant="caption" color={theme.colors.textSecondary}>
            → {ride.dropoff.address}
          </VeloraText>
        </View>

        <View style={[styles.fareRow, { borderColor: theme.colors.border }]}>
          <VeloraText variant="bodyMedium">Fare</VeloraText>
          <VeloraText variant="h3" color={theme.colors.primary}>{formatFare(ride.fare)}</VeloraText>
        </View>

        {isIncoming ? (
          <View style={styles.actions}>
            <Button label="Decline" variant="outline" onPress={handleDecline} style={styles.actionBtn} />
            <Button label="Accept" onPress={handleAccept} style={styles.actionBtn} />
          </View>
        ) : actionLabel ? (
          <Button label={actionLabel} fullWidth onPress={handleAdvance} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  mapWrap: { flex: 1 },
  sheet: {
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
  },
  sheetHeader: { marginBottom: spacing.sm },
  riderName: { marginBottom: spacing.md },
  route: { marginBottom: spacing.md },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  actions: { flexDirection: 'row', gap: spacing.md },
  actionBtn: { flex: 1 },
});
