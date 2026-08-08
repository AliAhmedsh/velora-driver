import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { VeloraText } from '@components/atoms/VeloraText';
import { useTheme } from '@hooks/useTheme';
import { radius, spacing, shadow } from '@theme/spacing';

type ServiceCardProps = {
  title: string;
  subtitle: string;
  icon: string;
  accentColor?: string;
  onPress?: () => void;
  featured?: boolean;
};

export function ServiceCard({
  title,
  subtitle,
  icon,
  accentColor,
  onPress,
  featured = false,
}: ServiceCardProps) {
  const { theme } = useTheme();
  const accent = accentColor ?? theme.colors.accent;

  if (featured) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [pressed && styles.pressed]}>
        <LinearGradient
          colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.featured, shadow.md]}>
          <View style={styles.featuredIcon}>
            <VeloraText variant="h2" color={accent}>{icon}</VeloraText>
          </View>
          <VeloraText variant="h2" color={theme.colors.textOnPrimary}>
            {title}
          </VeloraText>
          <VeloraText
            variant="body"
            color={theme.colors.brown200}
            style={styles.subtitle}>
            {subtitle}
          </VeloraText>
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        shadow.sm,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
        pressed && styles.pressed,
      ]}>
      <View style={[styles.iconWrap, { backgroundColor: `${accent}22` }]}>
        <VeloraText variant="h3" color={accent}>{icon}</VeloraText>
      </View>
      <VeloraText variant="h3" style={styles.cardTitle}>{title}</VeloraText>
      <VeloraText variant="caption" color={theme.colors.textSecondary}>
        {subtitle}
      </VeloraText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  featured: {
    borderRadius: radius.xl,
    padding: spacing.xxl,
    marginBottom: spacing.lg,
    minHeight: 140,
  },
  featuredIcon: { marginBottom: spacing.md },
  subtitle: { marginTop: spacing.xs },
  card: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    minHeight: 120,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: { marginBottom: spacing.xs },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
});
