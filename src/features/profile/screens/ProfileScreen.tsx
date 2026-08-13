import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VeloraText } from '@components/atoms/VeloraText';
import { useTheme } from '@hooks/useTheme';
import { useAuth } from '@app/providers/AuthProvider';
import { useMainStackNavigation } from '@navigation/useMainStackNavigation';
import { spacing, radius, shadow } from '@theme/spacing';
import { fetchProfile, getTierProgress } from '../../../services/profileService';

type Profile = {
  full_name?: string;
  phone?: string;
  rating?: number;
  tier?: string;
  total_rides?: number;
  referral_code?: string;
};

export function ProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const navigation = useMainStackNavigation();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    fetchProfile().then(setProfile).catch(() => {});
  }, []);

  const name = profile?.full_name ?? 'Velora Driver';
  const tier = profile?.tier ?? 'standard';
  const totalRides = profile?.total_rides ?? 0;
  const tierProgress = getTierProgress(totalRides, tier);

  const menu = [
    { label: 'Documents & verification', action: () => navigation.navigate('Documents') },
    { label: 'My vehicles', action: () => navigation.navigate('VehicleRegistration') },
    { label: 'Notifications', action: () => navigation.navigate('Notifications') },
    {
      label: 'Invite drivers',
      action: () => Alert.alert('Your referral code', profile?.referral_code ?? 'Loading...'),
      value: profile?.referral_code,
    },
    { label: 'Help & Support', action: () => navigation.navigate('Support') },
    { label: 'Dark mode', action: toggleTheme, value: isDark ? 'On' : 'Off' },
  ];

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
          <VeloraText variant="h1" color={theme.colors.textOnPrimary}>{name.charAt(0).toUpperCase()}</VeloraText>
        </View>
        <VeloraText variant="h2" style={styles.name}>{name}</VeloraText>
        <VeloraText variant="body" color={theme.colors.textSecondary}>{profile?.rating ?? 4.9} ★ · {totalRides} rides</VeloraText>

        <View style={[styles.tierCard, shadow.sm, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={styles.tierRow}>
            <VeloraText variant="bodyMedium" color={theme.colors.accent}>{tier.toUpperCase()} DRIVER</VeloraText>
            {tierProgress.next && (
              <VeloraText variant="caption" color={theme.colors.textSecondary}>
                {tierProgress.ridesToNext} rides to {tierProgress.next}
              </VeloraText>
            )}
          </View>
          <View style={[styles.progressTrack, { backgroundColor: theme.colors.border }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: theme.colors.accent, width: `${Math.round(tierProgress.progress * 100)}%` },
              ]}
            />
          </View>
        </View>
      </View>

      <View style={styles.menu}>
        {menu.map(item => (
          <Pressable
            key={item.label}
            onPress={item.action}
            style={[styles.menuItem, shadow.sm, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <VeloraText variant="bodyMedium" style={styles.menuLabel}>{item.label}</VeloraText>
            {item.value ? <VeloraText variant="caption" color={theme.colors.textMuted}>{item.value}</VeloraText> : null}
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.logout} onPress={signOut}>
        <VeloraText variant="bodyMedium" color={theme.colors.error}>Log out</VeloraText>
      </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { alignItems: 'center', paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxl },
  avatar: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  name: { marginBottom: spacing.xs },
  tierCard: { width: '100%', padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, marginTop: spacing.lg, gap: spacing.sm },
  tierRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
  menu: { paddingHorizontal: spacing.xxl, gap: spacing.md },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1 },
  menuLabel: { flex: 1 },
  logout: { alignItems: 'center', paddingVertical: spacing.xxxl },
});
