import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, EmptyState, Field, Header, Pill, SetupBanner } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { isFirebaseConfigured } from '../firebase';
import { addClass, deleteClass, publishSeedTimetable, subscribeClasses } from '../services/timetable';
import { colors, radius } from '../theme';
import { ClassItem, ClassType, Day, DAYS } from '../types';

const SHORT: Record<Day, string> = {
  Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun',
};
const TYPE_STYLE: Record<ClassType, { bg: string; text: string; accent: string }> = {
  Lecture: { bg: '#E8F0FE', text: '#3B6FE0', accent: colors.primary },
  Practical: { bg: '#E4F9F1', text: '#1FA97A', accent: '#1FA97A' },
  Tutorial: { bg: '#FFF1E0', text: '#E08A2C', accent: '#E08A2C' },
  Reserved: { bg: '#F0F0F5', text: '#8A8A9E', accent: '#B5B5C5' },
};
const CLASS_TYPES: ClassType[] = ['Lecture', 'Practical', 'Tutorial'];

/** Dates (day-of-month) for the current Mon-Sun week, so the strip matches the real calendar. */
function currentWeek(): { day: Day; date: number }[] {
  const now = new Date();
  const mondayOffset = (now.getDay() + 6) % 7; // Mon=0 ... Sun=6
  return DAYS.map((day, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - mondayOffset + i);
    return { day, date: d.getDate() };
  });
}

export default function TimetableScreen() {
  const { isRep } = useAuth();
  const week = useMemo(currentWeek, []);
  const today = DAYS[(new Date().getDay() + 6) % 7];
  const [selectedDay, setSelectedDay] = useState<Day>(today);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    return subscribeClasses(
      (items) => {
        setClasses(items);
        setLoading(false);
        setError(undefined);
      },
      (e) => {
        setError(e.message);
        setLoading(false);
      }
    );
  }, []);

  const dayClasses = classes.filter((c) => c.day === selectedDay);

  const publishStarter = () => {
    Alert.alert(
      'Publish IT03 timetable',
      'This replaces the current timetable for every student with the Third Year IT (IT03) schedule. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Publish',
          onPress: async () => {
            try {
              await publishSeedTimetable();
            } catch (e) {
              Alert.alert('Could not publish', (e as Error).message);
            }
          },
        },
      ]
    );
  };

  const confirmDelete = (c: ClassItem) => {
    Alert.alert('Remove class', `Remove ${c.subjectCode} on ${c.day} for everyone?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteClass(c.id).catch((e) => Alert.alert('Error', e.message)) },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgScreen }} edges={['top']}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <Header
          subtitle="UniVerse"
          title="Class Timetable"
          right={
            isRep ? (
              <Pressable
                onPress={() => setAdding(true)}
                style={{
                  width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Ionicons name="add" size={26} color="#fff" />
              </Pressable>
            ) : undefined
          }
        />
        {!isFirebaseConfigured && <SetupBanner />}
      </View>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
          {week.map(({ day, date }) => {
            const active = day === selectedDay;
            return (
              <Pressable
                key={day}
                onPress={() => setSelectedDay(day)}
                style={{
                  width: 48, height: 62, borderRadius: radius.md, marginRight: 8,
                  alignItems: 'center', justifyContent: 'center',
                  backgroundColor: active ? colors.primary : colors.bgCard,
                  borderWidth: 1, borderColor: active ? colors.primary : colors.border,
                }}
              >
                <Text style={{ fontSize: 10, color: active ? '#fff' : colors.textSecondary }}>{SHORT[day]}</Text>
                <Text style={{ fontSize: 16, fontWeight: '700', marginTop: 2, color: active ? '#fff' : colors.textPrimary }}>
                  {date}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 16 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>{selectedDay}</Text>
        <Text style={{ fontSize: 10, color: colors.success }}>● Live Schedule</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : error ? (
        <EmptyState title="Couldn't load timetable" hint={error} />
      ) : (
        <FlatList
          data={dayClasses}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ padding: 20 }}
          ListEmptyComponent={
            classes.length === 0 ? (
              <View>
                <EmptyState
                  title="No timetable published yet"
                  hint={isRep ? 'Publish the IT03 starter timetable below, or add classes one by one with +.' : 'Your class representative will publish it soon.'}
                />
                {isRep && <Button title="Publish IT03 timetable" onPress={publishStarter} />}
              </View>
            ) : (
              <EmptyState title="No classes" hint={`Nothing scheduled on ${selectedDay}.`} />
            )
          }
          ListFooterComponent={
            isRep && classes.length > 0 ? (
              <Button title="Re-publish IT03 timetable" variant="outline" onPress={publishStarter} style={{ marginTop: 6 }} />
            ) : undefined
          }
          renderItem={({ item }) => {
            const t = TYPE_STYLE[item.type] ?? TYPE_STYLE.Lecture;
            return (
              <Card style={{ flexDirection: 'row', paddingLeft: 0, overflow: 'hidden' }}>
                <View style={{ width: 4, backgroundColor: t.accent, marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary, flexShrink: 1 }}>
                      {item.subjectCode}
                    </Text>
                    <Pill text={item.type.toUpperCase()} bg={t.bg} color={t.text} />
                  </View>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 6 }}>📍 {item.room}</Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                    {item.startTime} – {item.endTime}
                  </Text>
                </View>
                {isRep && (
                  <Pressable hitSlop={10} onPress={() => confirmDelete(item)} style={{ paddingRight: 4 }}>
                    <Ionicons name="trash-outline" size={19} color={colors.danger} />
                  </Pressable>
                )}
              </Card>
            );
          }}
        />
      )}

      <AddClassModal visible={adding} defaultDay={selectedDay} onClose={() => setAdding(false)} />
    </SafeAreaView>
  );
}

function AddClassModal({ visible, defaultDay, onClose }: { visible: boolean; defaultDay: Day; onClose: () => void }) {
  const [day, setDay] = useState<Day>(defaultDay);
  const [subjectCode, setSubjectCode] = useState('');
  const [room, setRoom] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [type, setType] = useState<ClassType>('Lecture');
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (visible) setDay(defaultDay);
  }, [visible, defaultDay]);

  const timeOk = (t: string) => /^(0?[1-9]|1[0-2]):[0-5]\d\s?(AM|PM)$/i.test(t.trim());

  const submit = async () => {
    const e: Record<string, string> = {};
    if (!subjectCode.trim()) e.subjectCode = 'Subject code is required';
    if (!room.trim()) e.room = 'Room is required';
    if (!timeOk(startTime)) e.startTime = 'Use format 09:00 AM';
    if (!timeOk(endTime)) e.endTime = 'Use format 10:00 AM';
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      const norm = (t: string) => {
        const m = t.trim().match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i)!;
        return `${m[1].padStart(2, '0')}:${m[2]} ${m[3].toUpperCase()}`;
      };
      await addClass({ day, subjectCode: subjectCode.trim(), room: room.trim(), startTime: norm(startTime), endTime: norm(endTime), type });
      setSubjectCode(''); setRoom(''); setStartTime(''); setEndTime(''); setErrors({});
      onClose();
    } catch (err) {
      Alert.alert('Could not add class', (err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const chip = (label: string, active: boolean, onPress: () => void) => (
    <Pressable
      key={label}
      onPress={onPress}
      style={{
        paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, marginRight: 6, marginBottom: 6,
        backgroundColor: active ? colors.primary : colors.primaryLight,
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: '700', color: active ? '#fff' : colors.primary }}>{label}</Text>
    </Pressable>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 20 }}
      >
        <View style={{ backgroundColor: colors.bgCard, borderRadius: radius.lg, padding: 20, maxHeight: '90%' }}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>Add Class</Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 14, marginBottom: 6 }}>Day</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {DAYS.map((d) => chip(SHORT[d], d === day, () => setDay(d)))}
            </View>
            <Field label="Subject code" value={subjectCode} onChangeText={setSubjectCode} placeholder="ITM302 Gr-A" autoCapitalize="characters" error={errors.subjectCode} />
            <Field label="Room" value={room} onChangeText={setRoom} placeholder="Room 302" error={errors.room} />
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Field label="Start" value={startTime} onChangeText={setStartTime} placeholder="09:00 AM" autoCapitalize="characters" error={errors.startTime} />
              </View>
              <View style={{ flex: 1 }}>
                <Field label="End" value={endTime} onChangeText={setEndTime} placeholder="10:00 AM" autoCapitalize="characters" error={errors.endTime} />
              </View>
            </View>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 14, marginBottom: 6 }}>Type</Text>
            <View style={{ flexDirection: 'row' }}>{CLASS_TYPES.map((t) => chip(t, t === type, () => setType(t)))}</View>
            <View style={{ flexDirection: 'row', marginTop: 18 }}>
              <Button title="Cancel" variant="outline" onPress={onClose} style={{ flex: 1, marginRight: 8 }} />
              <Button title="Add" onPress={submit} loading={busy} style={{ flex: 1 }} />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
