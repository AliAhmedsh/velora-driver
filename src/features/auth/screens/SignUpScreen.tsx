import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@components/atoms/Button';
import { VeloraText } from '@components/atoms/VeloraText';
import { useTheme } from '@hooks/useTheme';
import { spacing } from '@theme/spacing';
import { signUp } from '../../../services/authService';
import { getAuthErrorMessage } from '../../../utils/authErrors';
import {
  AuthCredentialsFields,
  useAuthFormValidation,
} from '../components/AuthCredentialsFields';
import { AuthStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export function SignUpScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { validationError } = useAuthFormValidation(identifier, password);

  const handleSignUp = async () => {
    if (validationError) {
      Alert.alert('Check your details', validationError);
      return;
    }

    setLoading(true);
    try {
      await signUp(identifier, password);
    } catch (error) {
      Alert.alert('Could not create account', getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + spacing.xxxl, paddingBottom: insets.bottom + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled">
        <VeloraText variant="hero" style={styles.title}>Create account</VeloraText>
        <VeloraText variant="body" color={theme.colors.textSecondary} style={styles.subtitle}>
          Join Velora Driver with your email or Pakistani phone number.
        </VeloraText>

        <AuthCredentialsFields
          identifier={identifier}
          password={password}
          onIdentifierChange={setIdentifier}
          onPasswordChange={setPassword}
        />

        <Button
          label="Create account"
          fullWidth
          loading={loading}
          onPress={handleSignUp}
          style={styles.primaryAction}
        />

        <Button
          label="Already have an account? Sign in"
          variant="ghost"
          fullWidth
          onPress={() => navigation.navigate('Login')}
        />

        <Button label="Back" variant="ghost" fullWidth onPress={() => navigation.goBack()} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.xxl },
  title: { marginBottom: spacing.sm },
  subtitle: { marginBottom: spacing.xxl },
  primaryAction: { marginTop: spacing.xxl, marginBottom: spacing.sm },
});
