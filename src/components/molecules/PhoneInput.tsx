import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Input } from '@components/atoms/Input';
import { VeloraText } from '@components/atoms/VeloraText';
import { useTheme } from '@hooks/useTheme';
import { radius, spacing } from '@theme/spacing';

type PhoneInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
};

export function PhoneInput({ value, onChangeText, label = 'Phone number' }: PhoneInputProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.wrapper}>
      <VeloraText variant="label" color={theme.colors.textSecondary} style={styles.label}>
        {label}
      </VeloraText>
      <View
        style={[
          styles.row,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}>
        <View style={[styles.prefix, { backgroundColor: theme.colors.surfaceElevated }]}>
          <VeloraText variant="bodyMedium" color={theme.colors.primary}>+92</VeloraText>
        </View>
        <Input
          value={value}
          onChangeText={onChangeText}
          placeholder="300 1234567"
          keyboardType="phone-pad"
          maxLength={10}
          style={styles.input}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  label: { marginBottom: spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  prefix: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderRightWidth: 1,
    borderRightColor: 'transparent',
  },
  input: {
    flex: 1,
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
  },
});
