import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { VeloraText } from '@components/atoms/VeloraText';
import { useTheme } from '@hooks/useTheme';
import { MainStackParamList } from '@navigation/types';
import { spacing, radius, shadow } from '@theme/spacing';
import {
  DOCUMENT_TYPES,
  DriverDocument,
  fetchMyDocuments,
  uploadDriverDocument,
} from '../../../services/documentService';

type Props = NativeStackScreenProps<MainStackParamList, 'Documents'>;

const STATUS_COLORS: Record<DriverDocument['verificationStatus'], string> = {
  pending: '#C9A66B',
  approved: '#3D8B5F',
  rejected: '#C45C4A',
  expired: '#A67C52',
};

export function DocumentsScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [documents, setDocuments] = useState<DriverDocument[]>([]);
  const [uploadingType, setUploadingType] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setDocuments(await fetchMyDocuments());
    } catch {
      // ignore — table may not be migrated yet
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const statusFor = (docType: string) =>
    documents.find(d => d.docType === docType)?.verificationStatus;

  const handleUpload = async (docType: (typeof DOCUMENT_TYPES)[number]['id']) => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    const asset = result.assets?.[0];
    if (!asset?.uri) return;

    setUploadingType(docType);
    try {
      await uploadDriverDocument(docType, asset.uri, asset.type ?? 'image/jpeg');
      await load();
      Alert.alert('Uploaded', 'Document submitted for review.');
    } catch (e: any) {
      Alert.alert('Upload failed', e?.message ?? 'Try again');
    } finally {
      setUploadingType(null);
    }
  };

  return (
    <View style={[styles.flex, { backgroundColor: theme.colors.background, paddingTop: insets.top + spacing.md }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <VeloraText variant="label" color={theme.colors.primary}>← Back</VeloraText>
        </Pressable>
        <VeloraText variant="h2" style={styles.title}>Verification documents</VeloraText>
        <VeloraText variant="caption" color={theme.colors.textSecondary}>
          Upload clear photos of each document. Our team reviews within 24 hours.
        </VeloraText>
      </View>

      <FlatList
        data={DOCUMENT_TYPES}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + spacing.xxl }]}
        renderItem={({ item }) => {
          const status = statusFor(item.id);
          return (
            <Pressable
              onPress={() => handleUpload(item.id)}
              style={[styles.card, shadow.sm, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <View style={styles.cardBody}>
                <VeloraText variant="bodyMedium">{item.label}</VeloraText>
                <VeloraText variant="caption" color={theme.colors.textSecondary}>
                  {uploadingType === item.id ? 'Uploading...' : status ? `Status: ${status}` : 'Tap to upload'}
                </VeloraText>
              </View>
              {status && (
                <View style={[styles.badge, { backgroundColor: STATUS_COLORS[status] }]}>
                  <VeloraText variant="caption" color="#FFF">{status}</VeloraText>
                </View>
              )}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingHorizontal: spacing.xxl, marginBottom: spacing.lg, gap: spacing.xs },
  title: { marginTop: spacing.sm },
  list: { paddingHorizontal: spacing.xxl },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  cardBody: { flex: 1, gap: spacing.xs },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.full },
});
