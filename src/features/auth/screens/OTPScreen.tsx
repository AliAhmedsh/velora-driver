import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@components/atoms/Button';
import { VeloraText } from '@components/atoms/VeloraText';
import { OTPInput } from '@components/molecules/OTPInput';
import { useTheme } from '@hooks/useTheme';
import { spacing } from '@theme/spacing';
import { useAuth } from '@app/providers/AuthProvider';

import { AuthStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'OTP'>;

export function OTPScreen({ route }: Props) {
  const { theme } = useTheme();
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();
  const { phone } = route.params;
  const [loading, setLoading] = useState(false);

  const handleComplete = (code: string) => {
    if (code.length === 6) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        signIn();
      }, 800);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top + spacing.xxxl,
          paddingBottom: insets.bottom + spacing.xl,
        },
      ]}>
      <VeloraText variant="hero" style={styles.title}>Verify</VeloraText>
      <VeloraText variant="body" color={theme.colors.textSecondary}>
        Enter the 6-digit code sent to
      </VeloraText>
      <VeloraText variant="bodyMedium" color={theme.colors.primary} style={styles.phone}>
        {phone}
      </VeloraText>

      <View style={styles.otp}>
        <OTPInput onComplete={handleComplete} />
      </View>

      <Button label="Verify & Continue" fullWidth loading={loading} onPress={() => handleComplete('123456')} />

      <VeloraText
        variant="caption"
        color={theme.colors.textMuted}
        align="center"
        style={styles.resend}>
        Didn't receive code? Resend in 30s
      </VeloraText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.xxl },
  title: { marginBottom: spacing.sm },
  phone: { marginTop: spacing.xs, marginBottom: spacing.xxxl },
  otp: { marginBottom: spacing.xxl },
  resend: { marginTop: spacing.xl },
});
