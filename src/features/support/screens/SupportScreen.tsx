import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Linking, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@components/atoms/Button';
import { Input } from '@components/atoms/Input';
import { VeloraText } from '@components/atoms/VeloraText';
import { useTheme } from '@hooks/useTheme';
import { MainStackParamList } from '@navigation/types';
import { spacing, radius, shadow } from '@theme/spacing';
import { SupportTicket, createTicket, fetchMyTickets } from '../../../services/supportService';

type Props = NativeStackScreenProps<MainStackParamList, 'Support'>;

const FAQ = [
  { q: 'How is commission calculated?', a: 'A percentage of the trip fare is deducted automatically per service type (set in commission rules).' },
  { q: 'How do I get paid?', a: 'Earnings go to your in-app wallet after each trip. Request a payout via bank, Easypaisa, or JazzCash from the Wallet tab.' },
  { q: 'Document verification?', a: 'Upload CNIC, license, and vehicle registration from Profile → Documents. Review takes up to 24 hours.' },
  { q: 'Destination queue?', a: 'Set up to 3 preferred cities so we prioritize matching you with trips headed there.' },
];

const STATUS_COLORS: Record<SupportTicket['status'], string> = {
  open: '#C9A66B',
  in_progress: '#8B5E3C',
  resolved: '#3D8B5F',
  closed: '#A67C52',
};

export function SupportScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      setTickets(await fetchMyTickets());
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) return;
    setSubmitting(true);
    try {
      await createTicket(subject.trim(), 'general', message.trim());
      setSubject('');
      setMessage('');
      setShowForm(false);
      await load();
      Alert.alert('Ticket submitted', 'Our support team will respond shortly.');
    } catch (e: any) {
      Alert.alert('Could not submit', e?.message ?? 'Try again');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FlatList
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxl }}
      data={tickets}
      keyExtractor={item => item.id}
      ListHeaderComponent={
        <View>
          <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
            <Pressable onPress={() => navigation.goBack()}>
              <VeloraText variant="label" color={theme.colors.primary}>← Back</VeloraText>
            </Pressable>
            <VeloraText variant="h2" style={styles.title}>Driver support</VeloraText>
          </View>

          <View style={styles.content}>
            {FAQ.map(item => (
              <View key={item.q} style={[styles.card, shadow.sm, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <VeloraText variant="bodyMedium">{item.q}</VeloraText>
                <VeloraText variant="caption" color={theme.colors.textSecondary} style={styles.answer}>{item.a}</VeloraText>
              </View>
            ))}

            <Pressable onPress={() => Linking.openURL('mailto:driversupport@velora.app')} style={[styles.card, shadow.sm, { backgroundColor: theme.colors.accent }]}>
              <VeloraText variant="bodyMedium" color={theme.colors.textOnPrimary}>Email driversupport@velora.app</VeloraText>
            </Pressable>

            <VeloraText variant="h3" style={styles.sectionTitle}>My tickets</VeloraText>

            {showForm ? (
              <View style={[styles.card, shadow.sm, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, gap: spacing.md }]}>
                <Input label="Subject" value={subject} onChangeText={setSubject} placeholder="e.g. Wallet balance issue" />
                <Input label="Message" value={message} onChangeText={setMessage} placeholder="Describe your issue..." multiline numberOfLines={4} />
                <Button label="Submit ticket" onPress={handleSubmit} loading={submitting} fullWidth />
              </View>
            ) : (
              <Button label="+ New support ticket" variant="outline" fullWidth onPress={() => setShowForm(true)} style={styles.newBtn} />
            )}
          </View>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.content}>
          <View style={[styles.ticketCard, shadow.sm, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.ticketRow}>
              <VeloraText variant="bodyMedium">{item.subject}</VeloraText>
              <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] }]}>
                <VeloraText variant="caption" color="#FFF">{item.status.replace('_', ' ')}</VeloraText>
              </View>
            </View>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingHorizontal: spacing.xxl, paddingBottom: spacing.lg },
  title: { marginTop: spacing.md },
  content: { paddingHorizontal: spacing.xxl },
  card: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, marginBottom: spacing.md },
  answer: { marginTop: spacing.sm },
  sectionTitle: { marginTop: spacing.sm, marginBottom: spacing.md },
  newBtn: { marginBottom: spacing.md },
  ticketCard: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, marginBottom: spacing.md },
  ticketRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.full },
});
