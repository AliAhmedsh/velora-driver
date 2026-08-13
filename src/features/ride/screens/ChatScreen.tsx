import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Linking, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Input } from '@components/atoms/Input';
import { VeloraText } from '@components/atoms/VeloraText';
import { useTheme } from '@hooks/useTheme';
import { useAppSelector } from '@hooks/useAppDispatch';
import { MainStackParamList } from '@navigation/types';
import { spacing, radius } from '@theme/spacing';
import { ChatMessage, fetchChatMessages, sendChatMessage, subscribeToChat } from '../../../services/chatService';

type Props = NativeStackScreenProps<MainStackParamList, 'Chat'>;

export function ChatScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const ride = useAppSelector(state => state.ride.activeRide);
  const rideId = ride?.id;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList>(null);

  const load = useCallback(async () => {
    if (!rideId) return;
    setMessages(await fetchChatMessages(rideId));
  }, [rideId]);

  useEffect(() => {
    load();
    if (!rideId) return;
    const unsubscribe = subscribeToChat(rideId, load);
    return () => {
      unsubscribe();
    };
  }, [rideId, load]);

  const handleSend = async () => {
    if (!draft.trim() || !rideId) return;
    const body = draft.trim();
    setDraft('');
    await sendChatMessage(rideId, body);
    load();
  };

  if (!rideId) {
    return (
      <View style={[styles.flex, styles.center, { backgroundColor: theme.colors.background }]}>
        <VeloraText variant="body">No active ride to chat about.</VeloraText>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Pressable onPress={() => navigation.goBack()}>
          <VeloraText variant="label" color={theme.colors.primary}>← Back</VeloraText>
        </Pressable>
        <VeloraText variant="h3">{ride?.riderName ?? 'Chat'}</VeloraText>
        <Pressable onPress={() => Linking.openURL('tel:+92000000000')}>
          <VeloraText variant="label" color={theme.colors.primary}>Call</VeloraText>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.isMine
                ? [styles.mine, { backgroundColor: theme.colors.primary }]
                : [styles.theirs, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }],
            ]}>
            <VeloraText variant="body" color={item.isMine ? theme.colors.textOnPrimary : theme.colors.text}>
              {item.body}
            </VeloraText>
          </View>
        )}
      />

      <View style={[styles.inputRow, { paddingBottom: insets.bottom + spacing.md }]}>
        <Input
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder="Type a message..."
          onSubmitEditing={handleSend}
        />
        <Pressable onPress={handleSend} style={[styles.sendBtn, { backgroundColor: theme.colors.primary }]}>
          <VeloraText variant="label" color={theme.colors.textOnPrimary}>Send</VeloraText>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.md,
  },
  list: { paddingHorizontal: spacing.xxl, paddingVertical: spacing.md, gap: spacing.sm },
  bubble: { maxWidth: '78%', padding: spacing.md, borderRadius: radius.lg, marginBottom: spacing.xs },
  mine: { alignSelf: 'flex-end' },
  theirs: { alignSelf: 'flex-start', borderWidth: 1 },
  inputRow: { flexDirection: 'row', paddingHorizontal: spacing.xxl, alignItems: 'center', gap: spacing.sm },
  input: { flex: 1 },
  sendBtn: { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, borderRadius: radius.lg },
});
