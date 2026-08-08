import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { typography } from '@theme/typography';
import { useTheme } from '@hooks/useTheme';

type Variant = keyof typeof typography;

type VeloraTextProps = TextProps & {
  variant?: Variant;
  color?: string;
  align?: TextStyle['textAlign'];
};

export function VeloraText({
  variant = 'body',
  color,
  align,
  style,
  children,
  ...rest
}: VeloraTextProps) {
  const { theme } = useTheme();

  return (
    <Text
      style={[
        typography[variant],
        { color: color ?? theme.colors.text, textAlign: align },
        style,
      ]}
      {...rest}>
      {children}
    </Text>
  );
}
