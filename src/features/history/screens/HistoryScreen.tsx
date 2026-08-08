import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VeloraText } from '@components/atoms/VeloraText';
import { useTheme } from '@hooks/useTheme';
import { spacing, radius, shadow } from '@theme/spacing';

const TRIPS = [
  { id: '1', from: 'F-7 Markaz', to: 'Islamabad Airport', date: 'Aug 7, 2026', fare: 'PKR 2,400', status: 'Completed' },
  { id: '2', from: 'Blue Area', to: 'DHA Phase 2', date: 'Aug 5, 2026', fare: 'PKR 1,850', status: 'Completed' },
  { id: '3', from: 'Islamabad', to: 'Lahore', date: 'Aug 1, 2026', fare: 'PKR 24,500', status: 'Completed' },
];

export function HistoryScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <VeloraText variant="hero">Trips</VeloraText>
        <VeloraText variant="body" color={theme.colors.textSecondary}>
          Your ride history
        </VeloraText>
      </View>

      <FlatList
        data={TRIPS}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              shadow.sm,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}>
            <View style={styles.cardTop}>
              <VeloraText variant="h3">{item.from}</VeloraText>
              <VeloraText variant="label" color={theme.colors.success}>{item.status}</VeloraText>
            </View>
            <VeloraText variant="body" color={theme.colors.textSecondary} style={styles.to}>
              → {item.to}
            </VeloraText>
            <View style={styles.cardBottom}>
              <VeloraText variant="caption" color={theme.colors.textMuted}>{item.date}</VeloraText>
              <VeloraText variant="bodyMedium" color={theme.colors.primary}>{item.fare}</VeloraText>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingHorizontal: spacing.xxl, paddingBottom: spacing.lg },
  list: { paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxxl },
  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  to: { marginTop: spacing.xs, marginBottom: spacing.md },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between' },
});
