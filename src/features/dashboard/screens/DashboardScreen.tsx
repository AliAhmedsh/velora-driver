import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Pressable, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { VeloraText } from '@components/atoms/VeloraText';
import { useTheme } from '@hooks/useTheme';
import { spacing, radius, shadow } from '@theme/spacing';

const PRIORITIES = [
  { city: 'Lahore', eta: '6:00 PM', priority: 1 },
  { city: 'Peshawar', eta: 'Tomorrow 10 AM', priority: 2 },
  { city: 'Karachi', eta: 'Aug 10, 8 AM', priority: 3 },
];

export function DashboardScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [isOnline, setIsOnline] = useState(false);
  const [autoMatch, setAutoMatch] = useState(false);

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.gradientStart, theme.colors.background]}
        style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <View style={styles.headerRow}>
          <View>
            <VeloraText variant="caption" color="rgba(250,247,242,0.75)">
              Driver dashboard
            </VeloraText>
            <VeloraText variant="h2" color={theme.colors.textOnPrimary}>
              Hassan Khan
            </VeloraText>
          </View>
          <View style={[styles.ratingBadge, { backgroundColor: theme.colors.accent }]}>
            <VeloraText variant="label" color={theme.colors.textOnPrimary}>4.9 ★</VeloraText>
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
              onValueChange={setIsOnline}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.white}
            />
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}>
        <View style={styles.earningsRow}>
          <View
            style={[
              styles.earnCard,
              shadow.sm,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}>
            <VeloraText variant="caption" color={theme.colors.textSecondary}>Today</VeloraText>
            <VeloraText variant="h2" color={theme.colors.primary}>PKR 4,850</VeloraText>
          </View>
          <View
            style={[
              styles.earnCard,
              shadow.sm,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}>
            <VeloraText variant="caption" color={theme.colors.textSecondary}>This week</VeloraText>
            <VeloraText variant="h2" color={theme.colors.primary}>PKR 28,200</VeloraText>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <VeloraText variant="h3">Destination queue</VeloraText>
          <Pressable>
            <VeloraText variant="label" color={theme.colors.primary}>Edit</VeloraText>
          </Pressable>
        </View>

        <View
          style={[
            styles.queueCard,
            shadow.sm,
            { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
          ]}>
          <VeloraText variant="caption" color={theme.colors.textSecondary}>Current city</VeloraText>
          <VeloraText variant="bodyMedium" style={styles.currentCity}>Islamabad</VeloraText>

          {PRIORITIES.map(item => (
            <View key={item.priority} style={styles.priorityRow}>
              <View style={[styles.priorityDot, { backgroundColor: theme.colors.accent }]}>
                <VeloraText variant="caption" color={theme.colors.textOnPrimary}>{item.priority}</VeloraText>
              </View>
              <View style={styles.priorityInfo}>
                <VeloraText variant="bodyMedium">{item.city}</VeloraText>
                <VeloraText variant="caption" color={theme.colors.textMuted}>{item.eta}</VeloraText>
              </View>
            </View>
          ))}

          <View style={styles.autoRow}>
            <VeloraText variant="bodyMedium">Auto match</VeloraText>
            <Switch
              value={autoMatch}
              onValueChange={setAutoMatch}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.white}
            />
          </View>
        </View>

        <LinearGradient
          colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
          style={[styles.cta, shadow.md]}>
          <VeloraText variant="h3" color={theme.colors.textOnPrimary}>
            Platinum C2C Plan
          </VeloraText>
          <VeloraText variant="caption" color={theme.colors.brown200} style={styles.ctaSub}>
            Higher priority matching · Premium benefits
          </VeloraText>
        </LinearGradient>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
  ratingBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  onlineCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  onlineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scroll: { paddingHorizontal: spacing.xxl, paddingTop: spacing.lg },
  earningsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xxl },
  earnCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  queueCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.xxl,
  },
  currentCity: { marginTop: spacing.xs, marginBottom: spacing.lg },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
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
  cta: {
    padding: spacing.xl,
    borderRadius: radius.xl,
  },
  ctaSub: { marginTop: spacing.xs },
});
