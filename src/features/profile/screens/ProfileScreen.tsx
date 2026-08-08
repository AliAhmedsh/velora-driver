import React from 'react';
import { ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VeloraText } from '@components/atoms/VeloraText';
import { useTheme } from '@hooks/useTheme';
import { useAuth } from '@app/providers/AuthProvider';
import { spacing, radius, shadow } from '@theme/spacing';

const MENU = [
  { label: 'Emergency contacts', icon: '!' },
  { label: 'Notifications', icon: '◉' },
  { label: 'Language', icon: '◐', value: 'English' },
  { label: 'Dark mode', icon: '◑' },
  { label: 'Help & Support', icon: '?' },
];

export function ProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
          <VeloraText variant="h1" color={theme.colors.textOnPrimary}>H</VeloraText>
        </View>
        <VeloraText variant="h2" style={styles.name}>Hassan Khan</VeloraText>
        <VeloraText variant="body" color={theme.colors.textSecondary}>+92 300 1234567</VeloraText>
      </View>

      <View style={styles.menu}>
        {MENU.map(item => (
          <Pressable
            key={item.label}
            onPress={item.label === 'Dark mode' ? toggleTheme : undefined}
            style={[
              styles.menuItem,
              shadow.sm,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}>
            <View style={[styles.menuIcon, { backgroundColor: theme.colors.surfaceElevated }]}>
              <VeloraText variant="label" color={theme.colors.primary}>{item.icon}</VeloraText>
            </View>
            <VeloraText variant="bodyMedium" style={styles.menuLabel}>{item.label}</VeloraText>
            {item.label === 'Dark mode' ? (
              <VeloraText variant="caption" color={theme.colors.textMuted}>
                {isDark ? 'On' : 'Off'}
              </VeloraText>
            ) : item.value ? (
              <VeloraText variant="caption" color={theme.colors.textMuted}>{item.value}</VeloraText>
            ) : null}
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.logout} onPress={signOut}>
        <VeloraText variant="bodyMedium" color={theme.colors.error}>Log out</VeloraText>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  name: { marginBottom: spacing.xs },
  menu: { paddingHorizontal: spacing.xxl, gap: spacing.md },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuLabel: { flex: 1 },
  logout: { alignItems: 'center', paddingVertical: spacing.xxxl },
});
