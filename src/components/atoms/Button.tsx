import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { VeloraText } from './VeloraText';
import { useTheme } from '@hooks/useTheme';
import { radius, spacing } from '@theme/spacing';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';

type ButtonProps = PressableProps & {
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

  if (variant === 'primary') {
    return (
      <Pressable
        disabled={isDisabled}
        style={({ pressed }) => [
          fullWidth && styles.fullWidth,
          pressed && !isDisabled && styles.pressed,
          style as ViewStyle,
        ]}
        {...rest}>
        <LinearGradient
          colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.base,
            isDisabled && styles.disabled,
            fullWidth && styles.fullWidth,
          ]}>
          {loading ? (
            <ActivityIndicator color={theme.colors.textOnPrimary} />
          ) : (
            <VeloraText
              variant="button"
              color={theme.colors.textOnPrimary}
              align="center">
              {label}
            </VeloraText>
          )}
        </LinearGradient>
      </Pressable>
    );
  }

  const variantStyles: Record<ButtonVariant, ViewStyle> = {
    secondary: {
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 0,
    },
    ghost: { backgroundColor: 'transparent' },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
    },
    primary: {},
  };

  const textColors: Record<ButtonVariant, string> = {
    primary: theme.colors.textOnPrimary,
    secondary: theme.colors.text,
    ghost: theme.colors.primary,
    outline: theme.colors.primary,
  };

  return (
    <Pressable
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style as ViewStyle,
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={theme.colors.primary} />
      ) : (
        <VeloraText variant="button" color={textColors[variant]} align="center">
          {label}
        </VeloraText>
      )}
    </Pressable>
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
  pressed: { opacity: 0.92, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.5 },
});
