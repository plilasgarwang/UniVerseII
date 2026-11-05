import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Share, Text, View } from 'react-native';
import { Barcode } from '../components/Barcode';
import { Button, Card, Field, Header, Screen } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { clearCard, loadCard, saveCard } from '../services/cardStorage';
import { colors } from '../theme';
import { LibraryCard } from '../types';

export default function LibraryCardScreen() {
  const { user, profile } = useAuth();
  const [card, setCard] = useState<LibraryCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!user) return;
    const c = await loadCard(user.uid);
    setCard(c);
    setEditing(!c);
    setName(c?.name ?? profile?.name ?? '');
    setDepartment(c?.department ?? '');
    setIdNumber(c?.idNumber ?? '');
    setExpiry(c?.expiry ?? '');
    setLoading(false);
  }, [user, profile?.name]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!idNumber.trim()) e.idNumber = 'ID number is required';
    setErrors(e);
    if (Object.keys(e).length || !user) return;
    const c: LibraryCard = {
      name: name.trim(),
      department: department.trim(),
      idNumber: idNumber.trim(),
      expiry: expiry.trim(),
    };
    await saveCard(user.uid, c);
    setCard(c);
    setEditing(false);
  };

  const share = async () => {
    if (!card) return;
    await Share.share({
      message: `UniVerse - Digital Library Card\nName: ${card.name}\nID: UNV-${card.idNumber}`,
    });
  };

  const remove = () => {
    Alert.alert('Remove card', 'Delete the saved card details from this device?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          if (user) await clearCard(user.uid);
          setCard(null);
          setEditing(true);
          setIdNumber('');
          setDepartment('');
          setExpiry('');
        },
      },
    ]);
  };

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator color={colors.primary} style={{ marginTop: 60 }} />
      </Screen>
    );
  }

  if (editing || !card) {
    return (
      <Screen>
        <Header subtitle="UniVerse" title={card ? 'Edit Library Card' : 'Set Up Your Library Card'} />
        <Field label="Full name" value={name} onChangeText={setName} placeholder="Full Name" error={errors.name} />
        <Field label="Department" value={department} onChangeText={setDepartment} placeholder="Computer Science & Engineering" />
        <Field label="Student ID number" value={idNumber} onChangeText={setIdNumber} placeholder="02230139" keyboardType="number-pad" error={errors.idNumber} />
        <Field label="Expiry" value={expiry} onChangeText={setExpiry} placeholder="May 2027" />
        <Button title="Save and Generate Card" onPress={save} style={{ marginTop: 22 }} />
        {card && <Button title="Cancel" variant="outline" onPress={() => setEditing(false)} style={{ marginTop: 10 }} />}
      </Screen>
    );
  }

  const code = `UNV-${card.idNumber}`;

  return (
    <Screen>
      <Header subtitle="UniVerse" title="Library Card" />

      <View style={{ backgroundColor: colors.cardNavy, borderRadius: 16, padding: 20 }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>UniVerse CST University</Text>
        <Text style={{ fontSize: 11, color: '#B8BEDC', marginTop: 2 }}>Official Digital Credential</Text>

        <View style={{ flexDirection: 'row', marginTop: 18, alignItems: 'center' }}>
          <View
            style={{
              width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 26, fontWeight: '700' }}>
              {card.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={{ fontSize: 9, color: '#8891C4' }}>NAME</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>{card.name}</Text>
            <Text style={{ fontSize: 9, color: '#8891C4', marginTop: 8 }}>DEPARTMENT</Text>
            <Text style={{ fontSize: 12, color: '#fff' }}>{card.department || '—'}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', marginTop: 18 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 9, color: '#8891C4' }}>ID NUMBER</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>{card.idNumber}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 9, color: '#8891C4' }}>EXPIRES</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>{card.expiry || '—'}</Text>
          </View>
        </View>
        <View
          style={{
            alignSelf: 'flex-start', backgroundColor: colors.successBg, borderRadius: 20,
            paddingHorizontal: 10, paddingVertical: 4, marginTop: 14,
          }}
        >
          <Text style={{ fontSize: 9, fontWeight: '700', color: colors.success }}>ACTIVE</Text>
        </View>
      </View>

      <Card style={{ marginTop: 16, alignItems: 'center' }}>
        <View style={{ width: '100%', height: 80 }}>
          <Barcode value={code} height={80} />
        </View>
        <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textPrimary, marginTop: 8 }}>{code}</Text>
        <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 4, textAlign: 'center' }}>
          Present this barcode at any UniVerse library terminal
        </Text>
      </Card>
      <Text style={{ fontSize: 10, color: colors.textSecondary, textAlign: 'center' }}>
        Data stored on this device for offline access
      </Text>

      <View style={{ flexDirection: 'row', marginTop: 16 }}>
        <Button title="Share Card" variant="outline" onPress={share} style={{ flex: 1, marginRight: 8 }} />
        <Button title="Edit" onPress={() => setEditing(true)} style={{ flex: 1 }} />
      </View>
      <Button title="Remove card" variant="danger" onPress={remove} style={{ marginTop: 10 }} />
    </Screen>
  );
}
