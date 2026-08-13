import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Button } from '@components/atoms/Button';
import { VeloraText } from '@components/atoms/VeloraText';
import { useTheme } from '@hooks/useTheme';
import { spacing, radius, shadow } from '@theme/spacing';
import { fetchWalletBalance, fetchWalletTransactions } from '../../../services/walletService';
import { requestPayout, updateProfile } from '../../../services/profileService';
import { formatFare } from '@utils/locations';

const PAYOUT_METHODS: { id: 'bank' | 'easypaisa' | 'jazzcash'; label: string }[] = [
  { id: 'easypaisa', label: 'Easypaisa' },
  { id: 'jazzcash', label: 'JazzCash' },
  { id: 'bank', label: 'Bank transfer' },
];

export function WalletScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<
    Array<{ id: string; type: string; amount_pkr: number; description: string; created_at: string }>
  >([]);
  const [selectedMethod, setSelectedMethod] = useState<'bank' | 'easypaisa' | 'jazzcash'>('easypaisa');

  useEffect(() => {
    fetchWalletBalance()
      .then(setBalance)
      .catch(() => {});
    fetchWalletTransactions()
      .then(setTransactions)
      .catch(() => {});
  }, []);

  const handleRequestPayout = async () => {
    if (balance <= 0) {
      Alert.alert('No balance', 'You have no earnings available to withdraw yet.');
      return;
    }
    try {
      await updateProfile({ payout_method: selectedMethod });
      await requestPayout(balance, selectedMethod);
      Alert.alert(
        'Payout requested',
        `Your ${formatFare(balance)} payout via ${selectedMethod} has been submitted for review. Funds typically arrive within 1-2 business days.`,
      );
    } catch {
      Alert.alert('Could not request payout', 'Try again shortly.');
    }
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
        style={[styles.hero, { paddingTop: insets.top + spacing.xl }]}>
        <VeloraText variant="caption" color={theme.colors.brown200}>Wallet balance</VeloraText>
        <VeloraText variant="hero" color={theme.colors.textOnPrimary} style={styles.balance}>
          {formatFare(balance)}
        </VeloraText>
      </LinearGradient>

      <View style={styles.content}>
        <VeloraText variant="h3" style={styles.section}>Request payout</VeloraText>
        <View style={styles.methodRow}>
          {PAYOUT_METHODS.map(m => {
            const selected = selectedMethod === m.id;
            return (
              <Pressable
                key={m.id}
                onPress={() => setSelectedMethod(m.id)}
                style={[
                  styles.methodChip,
                  {
                    borderColor: selected ? theme.colors.primary : theme.colors.border,
                    backgroundColor: selected ? theme.colors.primary + '14' : theme.colors.surface,
                  },
                ]}>
                <VeloraText variant="caption" color={selected ? theme.colors.primary : theme.colors.textSecondary}>
                  {m.label}
                </VeloraText>
              </Pressable>
            );
          })}
        </View>
        <Button label={`Withdraw ${formatFare(balance)}`} fullWidth onPress={handleRequestPayout} style={styles.payoutBtn} />

        <VeloraText variant="h3" style={styles.section}>Recent transactions</VeloraText>

        {transactions.length === 0 ? (
          <VeloraText variant="caption" color={theme.colors.textMuted}>No transactions yet</VeloraText>
        ) : (
          transactions.map(item => (
            <View
              key={item.id}
              style={[
                styles.row,
                shadow.sm,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
              ]}>
              <View>
                <VeloraText variant="bodyMedium">{item.description ?? item.type}</VeloraText>
                <VeloraText variant="caption" color={theme.colors.textSecondary}>
                  {new Date(item.created_at).toLocaleDateString()}
                </VeloraText>
              </View>
              <VeloraText
                variant="label"
                color={item.amount_pkr >= 0 ? theme.colors.success : theme.colors.text}>
                {item.amount_pkr >= 0 ? '+' : ''}{formatFare(item.amount_pkr)}
              </VeloraText>
            </View>
          ))
        )}
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
  section: { marginBottom: spacing.lg, marginTop: spacing.md },
  methodRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  methodChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, borderWidth: 1 },
  payoutBtn: { marginBottom: spacing.xl },
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
