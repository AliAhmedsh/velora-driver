import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View, TouchableOpacity, Switch, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GradientBackdrop } from '@components/atoms/GradientBackdrop';
import { VeloraText } from '@components/atoms/VeloraText';
import { useTheme } from '@hooks/useTheme';
import { useAppDispatch, useAppSelector } from '@hooks/useAppDispatch';
import { setOnline, syncRideState } from '@store';
import { MainStackParamList } from '@navigation/types';
import { spacing, radius, shadow } from '@theme/spacing';
import { formatFare } from '@utils/locations';
import {
  fetchC2CPlans,
  fetchDestinationQueue,
  fetchDriverSettings,
  updateDriverSettings,
  type QueueItem,
} from '../../../services/queueService';
import { fetchTodayEarnings, fetchWeekEarnings } from '../../../services/walletService';

export function DashboardScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { isOnline, activeRide } = useAppSelector(state => state.ride);

  const [autoMatch, setAutoMatch] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [weekEarnings, setWeekEarnings] = useState(0);
  const [topPlan, setTopPlan] = useState<{ name: string; price_pkr: number; description?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    try {
      const [settings, q, today, week, plans] = await Promise.all([
        fetchDriverSettings(),
        fetchDestinationQueue(),
        fetchTodayEarnings(),
        fetchWeekEarnings(),
        fetchC2CPlans(),
      ]);
      if (settings) {
        dispatch(setOnline(settings.is_online ?? false));
        setAutoMatch(settings.auto_match ?? false);
      }
      setQueue(q);
      setTodayEarnings(today);
      setWeekEarnings(week);
      const premium = plans.find(p => p.name?.toLowerCase().includes('platinum')) ?? plans[plans.length - 1];
      if (premium) setTopPlan(premium);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard]),
  );

  useEffect(() => {
    dispatch(syncRideState());
  }, [dispatch, isOnline]);

  const hasIncoming = isOnline && activeRide?.status === 'searching';
  const hasActiveRide =
    activeRide &&
    activeRide.status !== 'searching' &&
    activeRide.status !== 'completed' &&
    activeRide.status !== 'cancelled';

  const handleOnlineToggle = async (value: boolean) => {
    dispatch(setOnline(value));
    try {
      await updateDriverSettings({ is_online: value });
      dispatch(syncRideState());
    } catch (error: any) {
      dispatch(setOnline(!value));
      Alert.alert('Could not go online', error?.message ?? 'Check your connection and try again.');
    }
  };

  const handleAutoMatchToggle = async (value: boolean) => {
    setAutoMatch(value);
    try {
      await updateDriverSettings({ auto_match: value });
    } catch (error: any) {
      setAutoMatch(!value);
      Alert.alert('Could not save setting', error?.message ?? 'Try again');
    }
  };

  if (loading) {
    return (
      <View style={[styles.flex, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + spacing.lg, backgroundColor: theme.colors.primaryDark },
        ]}>
        <GradientBackdrop colors={[theme.colors.primaryDark, theme.colors.primary]} />
        <View style={styles.headerRow}>
          <View>
            <VeloraText variant="caption" color={theme.colors.brown200}>Driver dashboard</VeloraText>
            <VeloraText variant="h2" color={theme.colors.white}>Velora Driver</VeloraText>
          </View>
        </View>

        <View
          style={[
            styles.onlineCard,
            shadow.md,
            { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
          ]}>
          <View style={styles.onlineRow}>
            <View>
              <VeloraText variant="h3">{isOnline ? 'You are online' : 'Go online'}</VeloraText>
              <VeloraText variant="caption" color={theme.colors.textSecondary}>
                {isOnline ? 'Receiving ride requests' : 'Start earning today'}
              </VeloraText>
            </View>
            <Switch
              value={isOnline}
              onValueChange={handleOnlineToggle}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.white}
            />
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}>
        {(hasIncoming || hasActiveRide) && (
          <TouchableOpacity
            activeOpacity={0.9}
            delayPressIn={0}
            onPress={() => navigation.navigate('DriverRide')}
            style={[
              styles.requestBanner,
              shadow.md,
              { backgroundColor: theme.colors.accent, borderColor: theme.colors.border },
            ]}>
            <VeloraText variant="h3" color={theme.colors.textOnPrimary}>
              {hasIncoming ? 'New ride request!' : 'Active ride'}
            </VeloraText>
            <VeloraText variant="caption" color={theme.colors.brown200}>
              {activeRide?.pickup.address} → {activeRide?.dropoff.address}
            </VeloraText>
            <VeloraText variant="label" color={theme.colors.textOnPrimary} style={styles.tapHint}>
              Tap to open map →
            </VeloraText>
          </TouchableOpacity>
        )}

        <View style={styles.earningsRow}>
          <View
            style={[
              styles.earnCard,
              shadow.sm,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}>
            <VeloraText variant="caption" color={theme.colors.textSecondary}>Today</VeloraText>
            <VeloraText variant="h2" color={theme.colors.primary}>{formatFare(todayEarnings)}</VeloraText>
          </View>
          <View
            style={[
              styles.earnCard,
              shadow.sm,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}>
            <VeloraText variant="caption" color={theme.colors.textSecondary}>This week</VeloraText>
            <VeloraText variant="h2" color={theme.colors.primary}>{formatFare(weekEarnings)}</VeloraText>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <VeloraText variant="h3">Destination queue</VeloraText>
          <TouchableOpacity activeOpacity={0.85} delayPressIn={0} onPress={() => navigation.navigate('DestinationQueue')}>
            <VeloraText variant="label" color={theme.colors.primary}>Edit</VeloraText>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.queueCard,
            shadow.sm,
            { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
          ]}>
          {queue.length === 0 ? (
            <VeloraText variant="bodyMedium" color={theme.colors.textSecondary}>
              No destinations set. Tap Edit to add your 3-city queue.
            </VeloraText>
          ) : (
            queue.map(item => (
              <View key={item.priority} style={styles.priorityRow}>
                <View style={[styles.priorityDot, { backgroundColor: theme.colors.accent }]}>
                  <VeloraText variant="caption" color={theme.colors.textOnPrimary}>{item.priority}</VeloraText>
                </View>
                <View style={styles.priorityInfo}>
                  <VeloraText variant="bodyMedium">{item.city_name}</VeloraText>
                  {item.eta ? (
                    <VeloraText variant="caption" color={theme.colors.textMuted}>{item.eta}</VeloraText>
                  ) : null}
                </View>
              </View>
            ))
          )}

          <View style={styles.autoRow}>
            <VeloraText variant="bodyMedium">Auto match</VeloraText>
            <Switch
              value={autoMatch}
              onValueChange={handleAutoMatchToggle}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.white}
            />
          </View>
        </View>

        {topPlan && (
          <View style={[styles.cta, shadow.md, styles.ctaWrap]}>
            <GradientBackdrop colors={[theme.colors.gradientStart, theme.colors.gradientEnd]} />
            <VeloraText variant="h3" color={theme.colors.white}>{topPlan.name}</VeloraText>
            <VeloraText variant="caption" color={theme.colors.brown200} style={styles.ctaSub}>
              PKR {topPlan.price_pkr} · {topPlan.description ?? 'Intercity driver benefits'}
            </VeloraText>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: { alignItems: 'center', justifyContent: 'center' },
  header: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    zIndex: 1,
  },
  onlineCard: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1 },
  onlineRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scroll: { paddingHorizontal: spacing.xxl, paddingTop: spacing.lg },
  requestBanner: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, marginBottom: spacing.lg },
  tapHint: { marginTop: spacing.sm },
  earningsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xxl },
  earnCard: { flex: 1, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  queueCard: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, marginBottom: spacing.xxl },
  priorityRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  priorityDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  priorityInfo: { flex: 1 },
  autoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  cta: { padding: spacing.xl, borderRadius: radius.xl },
  ctaWrap: { overflow: 'hidden' },
  ctaSub: { marginTop: spacing.xs, zIndex: 1 },
});
