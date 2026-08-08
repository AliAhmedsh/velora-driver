import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { VeloraText } from '@components/atoms/VeloraText';
import { Button } from '@components/atoms/Button';
import { useTheme } from '@hooks/useTheme';
import { spacing, radius, shadow } from '@theme/spacing';

export function WalletScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
        style={[styles.hero, { paddingTop: insets.top + spacing.xl }]}>
        <VeloraText variant="caption" color={theme.colors.brown200}>Wallet balance</VeloraText>
        <VeloraText variant="hero" color={theme.colors.textOnPrimary} style={styles.balance}>
          PKR 12,450
        </VeloraText>
      </LinearGradient>

      <View style={styles.content}>
        <Button label="Top Up Wallet" fullWidth onPress={() => {}} />

        <VeloraText variant="h3" style={styles.section}>Recent transactions</VeloraText>

        {[
          { label: 'Trip payment', amount: '- PKR 2,400', date: 'Today' },
          { label: 'Wallet top-up', amount: '+ PKR 5,000', date: 'Yesterday' },
          { label: 'Trip payment', amount: '- PKR 1,850', date: '3 days ago' },
        ].map(item => (
          <View
            key={item.label + item.date}
            style={[
              styles.row,
              shadow.sm,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}>
            <View>
              <VeloraText variant="bodyMedium">{item.label}</VeloraText>
              <VeloraText variant="caption" color={theme.colors.textSecondary}>{item.date}</VeloraText>
            </View>
            <VeloraText
              variant="label"
              color={item.amount.startsWith('+') ? theme.colors.success : theme.colors.text}>
              {item.amount}
            </VeloraText>
          </View>
        ))}
      </View>
    </View>
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
  balance: { marginTop: spacing.sm },
  content: { padding: spacing.xxl },
  section: { marginTop: spacing.xxl, marginBottom: spacing.lg },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
});
