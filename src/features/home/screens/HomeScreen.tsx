import React from 'react';
import { ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { VeloraText } from '@components/atoms/VeloraText';
import { ServiceCard } from '@components/molecules/ServiceCard';
import { useTheme } from '@hooks/useTheme';
import { spacing, radius, shadow } from '@theme/spacing';

const RECENT_TRIPS = [
  { id: '1', from: 'F-7 Markaz', to: 'Islamabad Airport', fare: 'PKR 2,400' },
  { id: '2', from: 'Blue Area', to: 'DHA Phase 2', fare: 'PKR 1,850' },
];

export function HomeScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.gradientStart, theme.colors.background]}
        style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <View style={styles.headerRow}>
          <View>
            <VeloraText variant="caption" color="rgba(250,247,242,0.75)">
              Good morning
            </VeloraText>
            <VeloraText variant="h2" color={theme.colors.textOnPrimary}>
              Ali Ahmed
            </VeloraText>
          </View>
          <View style={[styles.avatar, { backgroundColor: theme.colors.accent }]}>
            <VeloraText variant="h3" color={theme.colors.brown900}>A</VeloraText>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}>
        <ServiceCard
          featured
          title="Where to?"
          subtitle="Book a premium local ride in seconds"
          icon="→"
          onPress={() => {}}
        />

        <View style={styles.serviceRow}>
          <ServiceCard
            title="City to City"
            subtitle="Inter-city travel"
            icon="◎"
            accentColor={theme.colors.accent}
            onPress={() => {}}
          />
          <View style={styles.gap} />
          <ServiceCard
            title="Rental"
            subtitle="With driver"
            icon="◆"
            accentColor={theme.colors.primaryLight}
            onPress={() => {}}
          />
        </View>

        <VeloraText variant="h3" style={styles.sectionTitle}>Recent trips</VeloraText>

        {RECENT_TRIPS.map(trip => (
          <Pressable
            key={trip.id}
            style={[
              styles.tripCard,
              shadow.sm,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}>
            <View style={styles.tripDot} />
            <View style={styles.tripInfo}>
              <VeloraText variant="bodyMedium">{trip.from}</VeloraText>
              <VeloraText variant="caption" color={theme.colors.textSecondary}>
                → {trip.to}
              </VeloraText>
            </View>
            <VeloraText variant="label" color={theme.colors.primary}>{trip.fare}</VeloraText>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxl,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { paddingHorizontal: spacing.xxl, paddingTop: spacing.lg },
  serviceRow: { flexDirection: 'row', marginBottom: spacing.xxl },
  gap: { width: spacing.md },
  sectionTitle: { marginBottom: spacing.lg },
  tripCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  tripDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C9A66B',
    marginRight: spacing.md,
  },
  tripInfo: { flex: 1 },
});
