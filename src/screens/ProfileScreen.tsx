import React from 'react';
import { Alert, Text, View } from 'react-native';
import { Button, Card, Header, Pill, Screen } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

export default function ProfileScreen() {
  const { user, profile, isRep, logout } = useAuth();
  const email = profile?.email || user?.email || 'Unknown user';
  const name = profile?.name || user?.displayName || '';

  const confirmLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of UniVerse?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const row = (label: string, value: string, last = false) => (
    <View
      style={{
        flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12,
        borderBottomWidth: last ? 0 : 1, borderBottomColor: colors.border,
      }}
    >
      <Text style={{ fontSize: 12, color: colors.textSecondary }}>{label}</Text>
      <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textPrimary }}>{value}</Text>
    </View>
  );

  return (
    <Screen>
      <Header subtitle="UniVerse" title="Profile" />
      <View style={{ alignItems: 'center', marginTop: 12 }}>
        <View
          style={{
            width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary,
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 28, fontWeight: '700', color: '#fff' }}>
            {(name || email).charAt(0).toUpperCase()}
          </Text>
        </View>
        {name ? <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginTop: 14 }}>{name}</Text> : null}
        <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: name ? 2 : 14 }}>{email}</Text>
        <View style={{ flexDirection: 'row', marginTop: 10 }}>
          <Pill text="ACTIVE ACCOUNT" bg={colors.successBg} color={colors.success} />
          <View style={{ width: 8 }} />
          <Pill
            text={isRep ? 'CLASS REPRESENTATIVE' : 'STUDENT'}
            bg={colors.primaryLight}
            color={colors.primary}
          />
        </View>
      </View>

      <Card style={{ marginTop: 28 }}>
        {row('App Version', 'UniVerse v2.0 (React Native)')}
        {row('Notices & timetable', 'Firebase Firestore (live sync)')}
        {row('Grade history', 'Firebase Firestore')}
        {row('Library card', 'On-device storage', true)}
      </Card>

      <Button title="Log Out" variant="danger" onPress={confirmLogout} style={{ marginTop: 14 }} />
    </Screen>
  );
}
