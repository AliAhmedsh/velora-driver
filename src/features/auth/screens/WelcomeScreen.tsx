import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '@components/atoms/Button';
import { GradientBackdrop } from '@components/atoms/GradientBackdrop';
import { VeloraText } from '@components/atoms/VeloraText';
import { useTheme } from '@hooks/useTheme';
import { spacing } from '@theme/spacing';
import { AuthStackParamList } from '@navigation/types';

export function WelcomeScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primaryDark }]}>
      <GradientBackdrop
        colors={[theme.colors.gradientStart, theme.colors.gradientEnd, theme.colors.primaryDark]}
      />
      <View style={styles.content}>
        <View style={styles.logoInner}>
          <VeloraText variant="hero" color={theme.colors.accent}>V</VeloraText>
        </View>
        <VeloraText variant="hero" color={theme.colors.white} align="center">Velora Driver</VeloraText>
        <VeloraText variant="body" color={theme.colors.brown200} align="center" style={styles.tagline}>
          Earn with premium rides
        </VeloraText>
      </View>
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.xxl }]}>
        <Button label="Get started" fullWidth onPress={() => navigation.navigate('SignUp')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xxxl },
  logoInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  tagline: { marginTop: spacing.sm },
  footer: { paddingHorizontal: spacing.xxl, paddingTop: spacing.lg },
});
