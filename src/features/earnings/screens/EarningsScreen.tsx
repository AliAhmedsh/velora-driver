import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { VeloraText } from '@components/atoms/VeloraText';
import { useTheme } from '@hooks/useTheme';
import { spacing, radius, shadow } from '@theme/spacing';
import { formatFare } from '@utils/locations';
import { fetchTodayEarnings, fetchWeekEarnings, fetchWalletBalance } from '../../../services/walletService';

export function EarningsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [monthTotal, setMonthTotal] = useState(0);
  const [today, setToday] = useState(0);
  const [week, setWeek] = useState(0);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    Promise.all([fetchTodayEarnings(), fetchWeekEarnings(), fetchWalletBalance()])
      .then(([t, w, b]) => {
        setToday(t);
        setWeek(w);
        setBalance(b);
        setMonthTotal(w * 4);
      })
      .catch(() => {});
  }, []);

  return (
    <ScrollView
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
      <LinearGradient
        colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
        style={[styles.hero, { paddingTop: insets.top + spacing.xl }]}>
        <VeloraText variant="caption" color={theme.colors.brown200}>Wallet balance</VeloraText>
        <VeloraText variant="hero" color={theme.colors.textOnPrimary}>{formatFare(balance)}</VeloraText>
        <VeloraText variant="body" color={theme.colors.brown200} style={styles.sub}>
          This week: {formatFare(week)}
        </VeloraText>
      </LinearGradient>

      <View style={styles.content}>
        <VeloraText variant="h3" style={styles.section}>Earnings</VeloraText>

        <View style={[styles.row, shadow.sm, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <VeloraText variant="bodyMedium">Today</VeloraText>
          <VeloraText variant="label">{formatFare(today)}</VeloraText>
        </View>
        <View style={[styles.row, shadow.sm, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <VeloraText variant="bodyMedium">This week</VeloraText>
          <VeloraText variant="label">{formatFare(week)}</VeloraText>
        </View>
        <View style={[styles.row, shadow.sm, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <VeloraText variant="bodyMedium">Est. this month</VeloraText>
          <VeloraText variant="label">{formatFare(monthTotal)}</VeloraText>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hero: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxxl,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
  },
  sub: { marginTop: spacing.sm },
  content: { padding: spacing.xxl },
  section: { marginBottom: spacing.lg },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
});
