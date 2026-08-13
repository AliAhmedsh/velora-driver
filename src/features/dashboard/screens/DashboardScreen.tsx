import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Pressable, Switch, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
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
    await updateDriverSettings({ is_online: value });
    dispatch(syncRideState());
  };

  const handleAutoMatchToggle = async (value: boolean) => {
    setAutoMatch(value);
    await updateDriverSettings({ auto_match: value });
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
      <LinearGradient
        colors={[theme.colors.gradientStart, theme.colors.background]}
        style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <View style={styles.headerRow}>
          <View>
            <VeloraText variant="caption" color="rgba(250,247,242,0.75)">Driver dashboard</VeloraText>
            <VeloraText variant="h2" color={theme.colors.textOnPrimary}>Velora Driver</VeloraText>
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
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}>
        {(hasIncoming || hasActiveRide) && (
          <Pressable
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
          </Pressable>
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
          <Pressable onPress={() => navigation.navigate('DestinationQueue')}>
            <VeloraText variant="label" color={theme.colors.primary}>Edit</VeloraText>
          </Pressable>
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
          <LinearGradient
            colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
            style={[styles.cta, shadow.md]}>
            <VeloraText variant="h3" color={theme.colors.textOnPrimary}>{topPlan.name}</VeloraText>
            <VeloraText variant="caption" color={theme.colors.brown200} style={styles.ctaSub}>
              PKR {topPlan.price_pkr} · {topPlan.description ?? 'Intercity driver benefits'}
            </VeloraText>
          </LinearGradient>
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
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
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
  ctaSub: { marginTop: spacing.xs },
});
