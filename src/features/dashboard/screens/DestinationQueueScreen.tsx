import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, TextInput, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@components/atoms/Button';
import { VeloraText } from '@components/atoms/VeloraText';
import { useTheme } from '@hooks/useTheme';
import { MainStackParamList } from '@navigation/types';
import { spacing, radius, shadow } from '@theme/spacing';
import {
  fetchDestinationQueue,
  saveDestinationQueue,
  type QueueItem,
} from '../../../services/queueService';

type Props = NativeStackScreenProps<MainStackParamList, 'DestinationQueue'>;

const EMPTY_SLOTS: QueueItem[] = [
  { city_name: '', priority: 1, eta: '' },
  { city_name: '', priority: 2, eta: '' },
  { city_name: '', priority: 3, eta: '' },
];

export function DestinationQueueScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<QueueItem[]>(EMPTY_SLOTS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDestinationQueue().then(existing => {
      if (existing.length === 0) return;
      const merged = EMPTY_SLOTS.map(slot => {
        const match = existing.find(e => e.priority === slot.priority);
        return match ? { ...slot, ...match } : slot;
      });
      setItems(merged);
    });
  }, []);

  const updateItem = (priority: number, field: 'city_name' | 'eta', value: string) => {
    setItems(prev =>
      prev.map(item => (item.priority === priority ? { ...item, [field]: value } : item)),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const toSave = items.filter(i => i.city_name.trim().length > 0);
      await saveDestinationQueue(toSave);
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <VeloraText variant="label" color={theme.colors.primary}>← Back</VeloraText>
        </Pressable>
        <VeloraText variant="h2">Destination queue</VeloraText>
        <VeloraText variant="caption" color={theme.colors.textSecondary} style={styles.sub}>
          Set up to 3 cities with ETA. Priority 1 is matched first.
        </VeloraText>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing.xxl }]}>
        {items.map(item => (
          <View
            key={item.priority}
            style={[
              styles.card,
              shadow.sm,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}>
            <View style={[styles.badge, { backgroundColor: theme.colors.accent }]}>
              <VeloraText variant="label" color={theme.colors.textOnPrimary}>
                Priority {item.priority}
              </VeloraText>
            </View>
            <TextInput
              placeholder="City name"
              placeholderTextColor={theme.colors.textMuted}
              value={item.city_name}
              onChangeText={v => updateItem(item.priority, 'city_name', v)}
              style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
            />
            <TextInput
              placeholder="ETA (e.g. 6:00 PM)"
              placeholderTextColor={theme.colors.textMuted}
              value={item.eta ?? ''}
              onChangeText={v => updateItem(item.priority, 'eta', v)}
              style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
            />
          </View>
        ))}
        <Button label={saving ? 'Saving…' : 'Save queue'} fullWidth onPress={handleSave} disabled={saving} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingHorizontal: spacing.xxl, paddingBottom: spacing.lg },
  backBtn: { marginBottom: spacing.md },
  sub: { marginTop: spacing.xs },
  scroll: { paddingHorizontal: spacing.xxl, paddingTop: spacing.md },
  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    fontSize: 16,
  },
});
