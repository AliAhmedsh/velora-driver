import React from 'react';
import { TextInput, TextInputProps, StyleSheet, View } from 'react-native';
import { VeloraText } from './VeloraText';
import { useTheme } from '@hooks/useTheme';
import { radius, spacing, shadow } from '@theme/spacing';
import { typography } from '@theme/typography';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
};

export function Input({ label, error, style, ...rest }: InputProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.wrapper}>
      {label ? (
        <VeloraText variant="label" color={theme.colors.textSecondary} style={styles.label}>
          {label}
        </VeloraText>
      ) : null}
      <TextInput
        placeholderTextColor={theme.colors.textMuted}
        style={[
          styles.input,
          typography.body,
          {
            backgroundColor: theme.colors.surface,
            borderColor: error ? theme.colors.error : theme.colors.border,
            color: theme.colors.text,
          },
          shadow.sm,
          style,
        ]}
        {...rest}
      />
      {error ? (
        <VeloraText variant="caption" color={theme.colors.error} style={styles.error}>
          {error}
        </VeloraText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  label: { marginBottom: spacing.xs },
  input: {
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    minHeight: 52,
  },
  error: { marginTop: spacing.xs },
});
