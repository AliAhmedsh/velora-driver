import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@components/atoms/Button';
import { VeloraText } from '@components/atoms/VeloraText';
import { PhoneInput } from '@components/molecules/PhoneInput';
import { useTheme } from '@hooks/useTheme';
import { spacing } from '@theme/spacing';
import { AuthStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Phone'>;

export function PhoneScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');

  const isValid = phone.length >= 10;

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + spacing.xxxl, paddingBottom: insets.bottom + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled">
        <VeloraText variant="hero" style={styles.title}>Welcome</VeloraText>
        <VeloraText variant="body" color={theme.colors.textSecondary} style={styles.subtitle}>
          Enter your phone number to continue with Velora Driver
        </VeloraText>

        <View style={styles.form}>
          <PhoneInput value={phone} onChangeText={setPhone} />
        </View>

        <Button
          label="Continue"
          fullWidth
          disabled={!isValid}
          onPress={() => navigation.navigate('OTP', { phone: `+92${phone}` })}
        />

        <VeloraText
          variant="caption"
          color={theme.colors.textMuted}
          align="center"
          style={styles.legal}>
          By continuing, you agree to Velora's Terms of Service and Privacy Policy
        </VeloraText>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.xxl },
  title: { marginBottom: spacing.sm },
  subtitle: { marginBottom: spacing.xxxl },
  form: { marginBottom: spacing.xxl },
  legal: { marginTop: spacing.xl },
});
