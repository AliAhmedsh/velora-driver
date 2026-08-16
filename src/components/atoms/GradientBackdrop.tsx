import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

type Props = {
  colors: string[];
  style?: ViewStyle;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
};

/** Decorative gradient only — never intercept touches on iOS. */
export function GradientBackdrop({ colors, style, start, end }: Props) {
  return (
    <LinearGradient
      pointerEvents="none"
      colors={colors}
      start={start ?? { x: 0, y: 0 }}
      end={end ?? { x: 1, y: 1 }}
      style={[StyleSheet.absoluteFillObject, style]}
    />
  );
}
