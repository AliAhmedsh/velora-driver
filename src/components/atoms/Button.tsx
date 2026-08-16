import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';
import { VeloraText } from './VeloraText';
import { useTheme } from '@hooks/useTheme';
import { radius, spacing } from '@theme/spacing';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';

type ButtonProps = TouchableOpacityProps & {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
};

export function Button({
  label,
  variant = 'primary',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const { theme } = useTheme();
  const isDisabled = disabled || loading;

  const variantStyles: Record<ButtonVariant, ViewStyle> = {
    primary: {
      backgroundColor: theme.colors.primary,
      borderWidth: 0,
    },
    secondary: {
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderWidth: 0,
    },
    outline: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
    },
  };

  const textColors: Record<ButtonVariant, string> = {
    primary: theme.colors.white,
    secondary: theme.colors.text,
    ghost: theme.colors.primary,
    outline: theme.colors.primary,
  };

  const spinnerColors: Record<ButtonVariant, string> = {
    primary: theme.colors.white,
    secondary: theme.colors.primary,
    ghost: theme.colors.primary,
    outline: theme.colors.primary,
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={isDisabled}
      accessibilityRole="button"
      delayPressIn={0}
      style={[
        styles.base,
        variantStyles[variant],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style as ViewStyle,
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={spinnerColors[variant]} />
      ) : (
        <VeloraText variant="button" color={textColors[variant]} align="center">
          {label}
        </VeloraText>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },
});
