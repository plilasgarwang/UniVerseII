import React, { useState } from 'react';
import { Alert, Pressable, Switch, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Field, Screen } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';
import { friendlyAuthError } from '../utils/errors';
import { AuthStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

export default function SignupScreen({ navigation }: Props) {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isRep, setIsRep] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = async () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!email.trim()) e.email = 'Email is required';
    if (password.length < 8) e.password = 'Password must be at least 8 characters';
    if (password !== confirm) e.confirm = 'Passwords do not match';
    if (!agreed) e.agreed = 'Please agree to the Terms of Service';
    setErrors(e);
    if (Object.keys(e).length) return;

    setBusy(true);
    try {
      await signUp(name, email, password, isRep);
      // AuthContext flips to the signed-in navigator automatically.
    } catch (err) {
      Alert.alert('Signup failed', friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Text style={{ fontSize: 22, fontWeight: '700', color: colors.textPrimary, marginTop: 12 }}>
        Create Account
      </Text>
      <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>
        Join your university community hub today.
      </Text>

      <Field label="Full Name" placeholder="Palden Garwang" value={name} onChangeText={setName} error={errors.name} />
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
        placeholder="Minimum 8 characters"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        error={errors.password}
      />
      <Field
        label="Confirm Password"
        placeholder="Repeat your password"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        error={errors.confirm}
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 18 }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '600' }}>I'm a class representative</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
            Lets you publish the class timetable for your classmates.
          </Text>
        </View>
        <Switch
          value={isRep}
          onValueChange={setIsRep}
          trackColor={{ true: colors.primary, false: colors.border }}
        />
      </View>

      <Pressable
        onPress={() => setAgreed(!agreed)}
        style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}
      >
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            borderWidth: 2,
            borderColor: colors.primary,
            backgroundColor: agreed ? colors.primary : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 10,
          }}
        >
          {agreed ? <Text style={{ color: '#fff', fontSize: 14, lineHeight: 16 }}>✓</Text> : null}
        </View>
        <Text style={{ color: colors.textSecondary, fontSize: 12, flex: 1 }}>
          I agree to the Terms of Service & Privacy Policy
        </Text>
      </Pressable>
      {errors.agreed ? <Text style={{ color: colors.danger, fontSize: 12, marginTop: 4 }}>{errors.agreed}</Text> : null}

      <Button title="Sign Up" onPress={submit} loading={busy} style={{ marginTop: 20 }} />

      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Already have an account? </Text>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>Log In</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
