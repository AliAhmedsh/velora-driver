import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { VeloraText } from '@components/atoms/VeloraText';
import { Button } from '@components/atoms/Button';
import { useTheme } from '@hooks/useTheme';
import { spacing, radius, shadow } from '@theme/spacing';

const BREAKDOWN = [
  { label: 'Trip earnings', amount: 'PKR 26,400' },
  { label: 'Bonuses', amount: 'PKR 1,800' },
  { label: 'Deductions', amount: '- PKR 400' },
];

export function EarningsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
      <LinearGradient
        colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
        style={[styles.hero, { paddingTop: insets.top + spacing.xl }]}>
        <VeloraText variant="caption" color={theme.colors.brown200}>This month</VeloraText>
        <VeloraText variant="hero" color={theme.colors.textOnPrimary}>PKR 86,450</VeloraText>
        <VeloraText variant="body" color={theme.colors.brown200} style={styles.sub}>
          42 trips completed
        </VeloraText>
      </LinearGradient>

      <View style={styles.content}>
        <VeloraText variant="h3" style={styles.section}>Breakdown</VeloraText>

        {BREAKDOWN.map(item => (
          <View
            key={item.label}
            style={[
              styles.row,
              shadow.sm,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}>
            <VeloraText variant="bodyMedium">{item.label}</VeloraText>
            <VeloraText variant="label">{item.amount}</VeloraText>
          </View>
        ))}

        <Button label="Request Payout" fullWidth style={styles.payout} onPress={() => {}} />

        <View style={styles.statsRow}>
          {[
            { label: 'Avg / trip', value: 'PKR 2,058' },
            { label: 'Hours online', value: '128h' },
          ].map(stat => (
            <View
              key={stat.label}
              style={[
                styles.statCard,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
              ]}>
              <VeloraText variant="caption" color={theme.colors.textSecondary}>{stat.label}</VeloraText>
              <VeloraText variant="h3" color={theme.colors.primary}>{stat.value}</VeloraText>
            </View>
          ))}
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
  payout: { marginTop: spacing.lg, marginBottom: spacing.xxl },
  statsRow: { flexDirection: 'row', gap: spacing.md },
  statCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
});
