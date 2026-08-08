import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VeloraText } from '@components/atoms/VeloraText';
import { useTheme } from '@hooks/useTheme';
import { spacing, radius, shadow } from '@theme/spacing';

const TRIPS = [
  { id: '1', from: 'F-7 Markaz', to: 'Airport', fare: 'PKR 2,400', time: '2:30 PM' },
  { id: '2', from: 'Blue Area', to: 'DHA', fare: 'PKR 1,850', time: '11:15 AM' },
];

export function TripsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <VeloraText variant="hero">Trips</VeloraText>
        <VeloraText variant="body" color={theme.colors.textSecondary}>
          Today's completed trips
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
            <View style={styles.row}>
              <VeloraText variant="h3">{item.from}</VeloraText>
              <VeloraText variant="label" color={theme.colors.success}>Completed</VeloraText>
            </View>
            <VeloraText variant="body" color={theme.colors.textSecondary}>→ {item.to}</VeloraText>
            <View style={styles.footer}>
              <VeloraText variant="caption" color={theme.colors.textMuted}>{item.time}</VeloraText>
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
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
});
