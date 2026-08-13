import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@components/atoms/Button';
import { Input } from '@components/atoms/Input';
import { VeloraText } from '@components/atoms/VeloraText';
import { useTheme } from '@hooks/useTheme';
import { MainStackParamList } from '@navigation/types';
import { spacing, radius, shadow } from '@theme/spacing';
import { Vehicle, fetchMyVehicles, registerVehicle } from '../../../services/documentService';

type Props = NativeStackScreenProps<MainStackParamList, 'VehicleRegistration'>;

export function VehicleRegistrationScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [color, setColor] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      setVehicles(await fetchMyVehicles());
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async () => {
    if (!make.trim() || !model.trim() || !registrationNumber.trim()) {
      Alert.alert('Missing details', 'Fill in make, model, and registration number.');
      return;
    }
    setSubmitting(true);
    try {
      await registerVehicle({
        make: make.trim(),
        model: model.trim(),
        year: parseInt(year, 10) || new Date().getFullYear(),
        color: color.trim(),
        registrationNumber: registrationNumber.trim(),
      });
      setMake('');
      setModel('');
      setYear('');
      setColor('');
      setRegistrationNumber('');
      setShowForm(false);
      await load();
      Alert.alert('Vehicle added', 'Submitted for verification.');
    } catch (e: any) {
      Alert.alert('Could not register vehicle', e?.message ?? 'Try again');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FlatList
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{ paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.xxl }}
      data={vehicles}
      keyExtractor={item => item.id}
      ListHeaderComponent={
        <View>
          <View style={styles.header}>
            <Pressable onPress={() => navigation.goBack()}>
              <VeloraText variant="label" color={theme.colors.primary}>← Back</VeloraText>
            </Pressable>
            <VeloraText variant="h2" style={styles.title}>My vehicles</VeloraText>
          </View>

          {showForm ? (
            <View style={[styles.content, styles.card, shadow.sm, { backgroundColor: theme.colors.card, borderColor: theme.colors.border, gap: spacing.md }]}>
              <Input label="Make" value={make} onChangeText={setMake} placeholder="e.g. Suzuki" />
              <Input label="Model" value={model} onChangeText={setModel} placeholder="e.g. Alto" />
              <Input label="Year" value={year} onChangeText={setYear} placeholder="e.g. 2021" keyboardType="number-pad" />
              <Input label="Color" value={color} onChangeText={setColor} placeholder="e.g. White" />
              <Input label="Registration number" value={registrationNumber} onChangeText={setRegistrationNumber} placeholder="e.g. LEA-1234" autoCapitalize="characters" />
              <Button label="Submit for verification" onPress={handleSubmit} loading={submitting} fullWidth />
            </View>
          ) : (
            <View style={styles.content}>
              <Button label="+ Add vehicle" variant="outline" fullWidth onPress={() => setShowForm(true)} />
            </View>
          )}
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.content}>
          <View style={[styles.card, shadow.sm, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <VeloraText variant="bodyMedium">{item.make} {item.model} ({item.year})</VeloraText>
            <VeloraText variant="caption" color={theme.colors.textSecondary}>{item.registrationNumber} · {item.color}</VeloraText>
            <VeloraText variant="caption" color={item.verificationStatus === 'approved' ? theme.colors.success : theme.colors.accent}>
              {item.verificationStatus}
            </VeloraText>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingHorizontal: spacing.xxl, marginBottom: spacing.lg },
  title: { marginTop: spacing.sm },
  content: { paddingHorizontal: spacing.xxl },
  card: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, marginBottom: spacing.md },
});
