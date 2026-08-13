import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Input } from '@components/atoms/Input';
import { VeloraText } from '@components/atoms/VeloraText';
import { useTheme } from '@hooks/useTheme';
import { spacing } from '@theme/spacing';
import { getSignInValidationError } from '../../../utils/phone';

type AuthCredentialsFieldsProps = {
  identifier: string;
  password: string;
  onIdentifierChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
};

export function AuthCredentialsFields({
  identifier,
  password,
  onIdentifierChange,
  onPasswordChange,
}: AuthCredentialsFieldsProps) {
  const { theme } = useTheme();
  const validationError = getSignInValidationError(identifier, password);

  return (
    <View style={styles.form}>
      <Input
        label="Email or phone"
        value={identifier}
        onChangeText={onIdentifierChange}
        placeholder="you@example.com or 0322 9280780"
        keyboardType="default"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Input
        label="Password"
        value={password}
        onChangeText={onPasswordChange}
        placeholder="Minimum 6 characters"
        secureTextEntry
        autoCapitalize="none"
      />
      {validationError ? (
        <VeloraText variant="caption" color={theme.colors.textMuted}>
          {validationError}
        </VeloraText>
      ) : (
        <VeloraText variant="caption" color={theme.colors.textMuted}>
          Phone: 10 digits (e.g. 03229280780). Password: 6+ characters.
        </VeloraText>
      )}
    </View>
  );
}

export function useAuthFormValidation(identifier: string, password: string) {
  const validationError = getSignInValidationError(identifier, password);
  return { validationError, isValid: validationError === null };
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg },
});
