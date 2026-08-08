import React, { useRef, useState } from 'react';
import { StyleSheet, TextInput, View, Pressable } from 'react-native';
import { VeloraText } from '@components/atoms/VeloraText';
import { useTheme } from '@hooks/useTheme';
import { radius, spacing } from '@theme/spacing';
import { typography } from '@theme/typography';

type OTPInputProps = {
  length?: number;
  onComplete?: (code: string) => void;
};

export function OTPInput({ length = 6, onComplete }: OTPInputProps) {
  const { theme } = useTheme();
  const [code, setCode] = useState<string[]>(Array(length).fill(''));
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/\D/g, '').slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);

    if (digit && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }

    if (next.every(d => d) && onComplete) {
      onComplete(next.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.row}>
      {code.map((digit, index) => (
        <Pressable
          key={index}
          onPress={() => inputs.current[index]?.focus()}
          style={[
            styles.cell,
            {
              borderColor: digit ? theme.colors.primary : theme.colors.border,
              backgroundColor: theme.colors.surface,
            },
          ]}>
          <TextInput
            ref={ref => {
              inputs.current[index] = ref;
            }}
            value={digit}
            onChangeText={text => handleChange(text, index)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
            keyboardType="number-pad"
            maxLength={1}
            style={[typography.h2, { color: theme.colors.text, textAlign: 'center' }]}
            selectTextOnFocus
          />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cell: {
    flex: 1,
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
