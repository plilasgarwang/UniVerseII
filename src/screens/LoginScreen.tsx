import React, { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Field, Screen, SetupBanner } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { isFirebaseConfigured } from '../firebase';
import { colors } from '../theme';
import { friendlyAuthError } from '../utils/errors';
import { AuthStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const submit = async () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Email is required';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    if (Object.keys(e).length) return;

    setBusy(true);
    try {
      await signIn(email, password);
    } catch (err) {
      Alert.alert('Login failed', friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <View style={{ alignItems: 'center', marginTop: 40 }}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="globe-outline" size={32} color="#fff" />
        </View>
        <Text style={{ fontSize: 26, fontWeight: '700', color: colors.textPrimary, marginTop: 16 }}>
          UniVerse
        </Text>
        <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>
          Your Campus. Your Community.
        </Text>
      </View>

      <View style={{ marginTop: 24 }}>
        {!isFirebaseConfigured && <SetupBanner />}
        <Field
          label="University Email"
          placeholder="02230139.cst@rub.edu.bt"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          error={errors.email}
        />
        <Field
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={errors.password}
        />
        <Pressable onPress={() => navigation.navigate('ResetPassword')} style={{ alignSelf: 'flex-end', marginTop: 10 }}>
          <Text style={{ color: colors.primary, fontSize: 12 }}>Forgot Password?</Text>
        </Pressable>
        <Button title="Log In" onPress={submit} loading={busy} style={{ marginTop: 20 }} />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 28 }}>
        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Don't have an account? </Text>
        <Pressable onPress={() => navigation.navigate('Signup')}>
          <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>Sign Up</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
