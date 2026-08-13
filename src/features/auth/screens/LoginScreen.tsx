import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@components/atoms/Button';
import { VeloraText } from '@components/atoms/VeloraText';
import { useTheme } from '@hooks/useTheme';
import { spacing } from '@theme/spacing';
import { signIn } from '../../../services/authService';
import { signInWithGoogle } from '../../../services/googleAuth';
import { getAuthErrorMessage } from '../../../utils/authErrors';
import {
  AuthCredentialsFields,
  useAuthFormValidation,
} from '../components/AuthCredentialsFields';
import { AuthStackParamList } from '@navigation/types';
import { GOOGLE_WEB_CLIENT_ID } from '@env';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { validationError } = useAuthFormValidation(identifier, password);

  const handleSignIn = async () => {
    if (validationError) {
      Alert.alert('Check your details', validationError);
      return;
    }

    setLoading(true);
    try {
      await signIn(identifier, password);
    } catch (error) {
      Alert.alert('Sign in failed', getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      Alert.alert('Google sign-in failed', getAuthErrorMessage(error));
    } finally {
      setGoogleLoading(false);
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
        <VeloraText variant="hero" style={styles.title}>Sign in</VeloraText>
        <VeloraText variant="body" color={theme.colors.textSecondary} style={styles.subtitle}>
          Welcome back. Enter your email or phone and password.
        </VeloraText>

        <AuthCredentialsFields
          identifier={identifier}
          password={password}
          onIdentifierChange={setIdentifier}
          onPasswordChange={setPassword}
        />

        <Button
          label="Sign in"
          fullWidth
          loading={loading}
          onPress={handleSignIn}
          style={styles.primaryAction}
        />

        <Button
          label="Create an account"
          variant="ghost"
          fullWidth
          onPress={() => navigation.navigate('SignUp')}
        />

        {GOOGLE_WEB_CLIENT_ID ? (
          <Button
            label="Continue with Google"
            variant="outline"
            fullWidth
            loading={googleLoading}
            onPress={handleGoogle}
            style={styles.google}
          />
        ) : null}

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
  google: { marginTop: spacing.md },
});
