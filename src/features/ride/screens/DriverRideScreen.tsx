import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@components/atoms/Button';
import { VeloraText } from '@components/atoms/VeloraText';
import { RideMap } from '@components/organisms/RideMap';
import { useTheme } from '@hooks/useTheme';
import { useUserLocation } from '@hooks/useUserLocation';
import { useAppDispatch, useAppSelector } from '@hooks/useAppDispatch';
import { acceptRide, advanceRideStatusAction, declineRide, syncRideState } from '@store';
import { MainStackParamList } from '@navigation/types';
import { spacing, radius, shadow } from '@theme/spacing';
import { formatFare } from '@utils/locations';
import { RideOffer, fetchMyOfferForRide, submitRideOffer, withdrawRideOffer } from '../../../services/offerService';

type Props = NativeStackScreenProps<MainStackParamList, 'DriverRide'>;

const ACTION_LABELS: Record<string, string> = {
  driver_assigned: 'Start heading to pickup',
  driver_arriving: 'Start trip',
  in_progress: 'Complete trip',
};

const SERVICE_LABELS: Record<string, string> = {
  local: 'Local ride',
  city_to_city: 'City to City',
  rental: 'Rental / Contract',
};

const FUEL_LABELS: Record<string, string> = {
  driver: 'Driver provides fuel',
  customer: 'Customer provides fuel',
};

export function DriverRideScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const ride = useAppSelector(state => state.ride.activeRide);
  const { location: driverLocation } = useUserLocation();
  const [myOffer, setMyOffer] = useState<RideOffer | null>(null);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerBusy, setOfferBusy] = useState(false);

  useEffect(() => {
    if (!ride || ride.status !== 'searching' || !ride.negotiationEnabled) return;
    fetchMyOfferForRide(ride.id).then(setMyOffer).catch(() => {});
    setOfferAmount(String(ride.recommendedFare ?? ride.fare));
  }, [ride?.id, ride?.status]);

  if (!ride) {
    navigation.goBack();
    return null;
  }

  const isIncoming = ride.status === 'searching';
  const actionLabel = ACTION_LABELS[ride.status];

  const handleAccept = async () => {
    try {
      const result = await dispatch(acceptRide()).unwrap();
      if (!result) {
        Alert.alert('Ride unavailable', 'This request is no longer available.');
        dispatch(syncRideState());
        navigation.goBack();
      }
    } catch (error: any) {
      Alert.alert('Could not accept ride', error?.message ?? 'Try again or wait for another request.');
      dispatch(syncRideState());
    }
  };

  const handleDecline = async () => {
    try {
      const result = await dispatch(declineRide()).unwrap();
      if (!result) navigation.goBack();
    } catch (error: any) {
      Alert.alert('Could not decline', error?.message ?? 'Try again');
    }
  };

  const handleSendOffer = async () => {
    const amount = parseInt(offerAmount, 10);
    if (Number.isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid amount', 'Enter a valid fare amount.');
      return;
    }
    setOfferBusy(true);
    try {
      const offer = await submitRideOffer(ride.id, amount);
      setMyOffer(offer);
      Alert.alert('Offer sent', 'The rider will be notified of your offer.');
    } catch (e: any) {
      Alert.alert('Could not send offer', e?.message ?? 'Try again');
    } finally {
      setOfferBusy(false);
    }
  };

  const handleWithdrawOffer = async () => {
    if (!myOffer) return;
    await withdrawRideOffer(myOffer.id);
    setMyOffer(null);
  };

  const handleAdvance = async () => {
    try {
      const result = await dispatch(advanceRideStatusAction()).unwrap();
      if (result?.ride?.status === 'completed') {
        navigation.goBack();
      }
    } catch (error: any) {
      Alert.alert('Could not update ride', error?.message ?? 'Try again');
    }
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <View style={styles.mapWrap}>
        <RideMap pickup={ride.pickup} dropoff={ride.dropoff} driverLocation={driverLocation} showRoute />
      </View>

      <View
        style={[
          styles.sheet,
          shadow.lg,
          { backgroundColor: theme.colors.card, paddingBottom: insets.bottom + spacing.lg },
        ]}>
        <VeloraText variant="caption" color={theme.colors.textSecondary}>
          {SERVICE_LABELS[ride.serviceType] ?? ride.serviceType}
        </VeloraText>
        <VeloraText variant="h3" style={styles.title}>
          {isIncoming ? 'New ride request' : 'Active ride'}
        </VeloraText>

        <View style={styles.riderRow}>
          <VeloraText variant="bodyMedium" style={styles.riderName}>Rider: {ride.riderName}</VeloraText>
          {!isIncoming && (
            <Pressable onPress={() => navigation.navigate('Chat')}>
              <VeloraText variant="label" color={theme.colors.primary}>Chat</VeloraText>
            </Pressable>
          )}
        </View>
        {ride.womenOnly && (
          <VeloraText variant="caption" color={theme.colors.accent} style={styles.meta}>👩 Women-only ride</VeloraText>
        )}

        {ride.originCity && ride.destinationCity ? (
          <VeloraText variant="caption" color={theme.colors.textSecondary} style={styles.meta}>
            {ride.originCity} → {ride.destinationCity}
          </VeloraText>
        ) : null}

        <View style={styles.route}>
          <VeloraText variant="bodyMedium">{ride.pickup.address}</VeloraText>
          <VeloraText variant="caption" color={theme.colors.textSecondary}>
            → {ride.dropoff.address}
          </VeloraText>
        </View>

        {ride.distanceKm != null && (
          <VeloraText variant="caption" color={theme.colors.textMuted}>
            ~{ride.distanceKm.toFixed(1)} km · ~{ride.durationMin ?? 0} min
          </VeloraText>
        )}

        <View style={[styles.fareRow, { borderColor: theme.colors.border }]}>
          <View>
            <VeloraText variant="caption" color={theme.colors.textSecondary}>Recommended minimum</VeloraText>
            <VeloraText variant="bodyMedium">{formatFare(ride.recommendedFare ?? ride.fare)}</VeloraText>
          </View>
          <View>
            <VeloraText variant="caption" color={theme.colors.textSecondary}>Customer offer</VeloraText>
            <VeloraText variant="h3" color={theme.colors.primary}>{formatFare(ride.customerOffer ?? ride.fare)}</VeloraText>
          </View>
        </View>

        {ride.fuelOption && (
          <VeloraText variant="caption" color={theme.colors.textSecondary} style={styles.meta}>
            {FUEL_LABELS[ride.fuelOption]}
          </VeloraText>
        )}
        {ride.vehicleCount && ride.vehicleCount > 1 && (
          <VeloraText variant="caption" color={theme.colors.textSecondary} style={styles.meta}>
            {ride.vehicleCount} vehicles requested
          </VeloraText>
        )}
        {ride.rentalDuration && (
          <VeloraText variant="caption" color={theme.colors.textSecondary} style={styles.meta}>
            Duration: {ride.rentalDuration.replace('_', ' ')}
          </VeloraText>
        )}

        {isIncoming && ride.negotiationEnabled !== false && (
          <View style={[styles.offerBox, { borderColor: theme.colors.border }]}>
            <VeloraText variant="label" color={theme.colors.textSecondary}>
              {myOffer ? 'Your offer sent' : 'Send a counter-offer (optional)'}
            </VeloraText>
            <View style={styles.offerRow}>
              <TextInput
                value={offerAmount}
                onChangeText={setOfferAmount}
                keyboardType="number-pad"
                editable={!myOffer}
                style={[styles.offerInput, { borderColor: theme.colors.border, color: theme.colors.text, backgroundColor: theme.colors.surface }]}
              />
              {myOffer ? (
                <Button label="Withdraw" variant="outline" onPress={handleWithdrawOffer} style={styles.offerBtn} />
              ) : (
                <Button label="Send offer" onPress={handleSendOffer} loading={offerBusy} style={styles.offerBtn} />
              )}
            </View>
          </View>
        )}

        {isIncoming ? (
          <View style={styles.actions}>
            <Button label="Decline" variant="outline" onPress={handleDecline} style={styles.actionBtn} />
            <Button label="Accept at offer" onPress={handleAccept} style={styles.actionBtn} />
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
  title: { marginBottom: spacing.sm },
  riderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  riderName: { marginBottom: spacing.xs },
  meta: { marginBottom: spacing.sm },
  offerBox: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, gap: spacing.sm },
  offerRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  offerInput: { flex: 1, borderWidth: 1, borderRadius: radius.md, padding: spacing.md, minHeight: 48 },
  offerBtn: { minWidth: 120 },
  route: { marginBottom: spacing.md },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  actions: { flexDirection: 'row', gap: spacing.md },
  actionBtn: { flex: 1 },
});
