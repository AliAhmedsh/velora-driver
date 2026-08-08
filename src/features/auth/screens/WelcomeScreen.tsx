import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Button } from '@components/atoms/Button';
import { VeloraText } from '@components/atoms/VeloraText';
import { useTheme } from '@hooks/useTheme';
import { spacing } from '@theme/spacing';
import { AuthStackParamList } from '@navigation/types';

export function WelcomeScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(withTiming(1.04, { duration: 1800 }), withTiming(1, { duration: 1800 })),
      -1,
      true,
    );
  }, [scale]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <LinearGradient
      colors={[theme.colors.gradientStart, theme.colors.gradientEnd, theme.colors.primaryDark]}
      style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.logoRing, logoStyle]}>
          <View style={styles.logoInner}>
            <VeloraText variant="hero" color={theme.colors.accent}>V</VeloraText>
          </View>
        </Animated.View>
        <VeloraText variant="hero" color={theme.colors.textOnPrimary} align="center">
          Velora Driver
        </VeloraText>
        <VeloraText
          variant="h3"
          color={theme.colors.brown200}
          align="center"
          style={styles.tagline}>
          Drive premium. Earn more.
        </VeloraText>
        <View style={styles.divider} />
        <VeloraText variant="body" color={theme.colors.brown200} align="center">
          Smart queue · Fair fares · Fast payouts
        </VeloraText>
      </View>

      <View style={styles.footer}>
        <Button label="Get Started" fullWidth onPress={() => navigation.navigate('Phone')} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  logoRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(201, 166, 107, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  logoInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagline: { marginTop: spacing.sm, marginBottom: spacing.xxxl },
  divider: {
    width: 48,
    height: 3,
    backgroundColor: 'rgba(201, 166, 107, 0.6)',
    borderRadius: 2,
    marginBottom: spacing.lg,
  },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.massive,
  },
});
