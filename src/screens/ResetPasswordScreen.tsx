import React, { useState } from 'react';
import { Alert, Pressable, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Field, Screen } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';
import { friendlyAuthError } from '../utils/errors';
import { AuthStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

export default function ResetPasswordScreen({ navigation }: Props) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const submit = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    setError(undefined);
    setBusy(true);
    try {
      await resetPassword(email);
      Alert.alert('Reset link sent', 'Please check your email for the reset link.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Could not send reset link', friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Text style={{ fontSize: 22, fontWeight: '700', color: colors.textPrimary, marginTop: 40 }}>
        Reset Password
      </Text>
      <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 10 }}>
        Enter your university email address below. We'll send you a secure link to reset your account password.
      </Text>
      <Field
        label="University Email"
        placeholder="02230139.cst@rub.edu.bt"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        error={error}
      />
      <Button title="Send Reset Link" onPress={submit} loading={busy} style={{ marginTop: 24 }} />
      <Pressable onPress={() => navigation.goBack()} style={{ alignSelf: 'center', marginTop: 20 }}>
        <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>← Back to Log In</Text>
      </Pressable>
    </Screen>
  );
}
