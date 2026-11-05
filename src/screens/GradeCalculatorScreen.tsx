import React, { useEffect, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, EmptyState, Field, Header, Screen } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { isFirebaseConfigured } from '../firebase';
import { computeResult, deleteGradeRecord, gradeFor, saveGradeRecord, subscribeGradeHistory } from '../services/grades';
import { colors } from '../theme';
import { GradeRecord, Subject } from '../types';
import { formatDateTime } from '../utils/format';

export default function GradeCalculatorScreen() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [name, setName] = useState('');
  const [marks, setMarks] = useState('');
  const [errors, setErrors] = useState<{ name?: string; marks?: string }>({});
  const [result, setResult] = useState<ReturnType<typeof computeResult> | null>(null);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<GradeRecord[]>([]);

  useEffect(() => {
    if (!user || !isFirebaseConfigured) return;
    return subscribeGradeHistory(user.uid, setHistory);
  }, [user]);

  const addSubject = () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = 'Subject name is required';
    const n = Number(marks);
    if (marks.trim() === '' || Number.isNaN(n) || n < 0 || n > 100) e.marks = 'Enter a value between 0 and 100';
    setErrors(e);
    if (Object.keys(e).length) return;
    setSubjects((s) => [...s, { name: name.trim(), marks: Math.round(n) }]);
    setName('');
    setMarks('');
    setResult(null); // result is stale once subjects change
  };

  const removeSubject = (i: number) => {
    setSubjects((s) => s.filter((_, idx) => idx !== i));
    setResult(null);
  };

  const calculate = () => {
    if (subjects.length === 0) {
      Alert.alert('Add at least one subject first');
      return;
    }
    setResult(computeResult(subjects));
  };

  const reset = () => {
    setSubjects([]);
    setResult(null);
    setErrors({});
  };

  const save = async () => {
    if (!user || !result) return;
    setSaving(true);
    try {
      await saveGradeRecord(user.uid, subjects);
      Alert.alert('Saved', 'Added to your grade history.');
    } catch (e) {
      Alert.alert('Could not save', (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const message = result
    ? result.gpa >= 3.5
      ? 'Excellent! You have solid standing. Keep this pace up to graduate with high honors.'
      : result.gpa >= 3.0
      ? "Good work. You're on track - a little more focus on weaker subjects could push you into the honors range."
      : result.gpa >= 2.0
      ? "You're passing, but there's room to improve. Consider revisiting subjects with lower marks."
      : 'Your current average is below a comfortable passing margin. Consider seeking academic support.'
    : '';

  return (
    <Screen>
      <Header subtitle="UniVerse" title="Grade Calculator" />
      <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: -8, marginBottom: 6 }}>
        Calculate your academic performance instantly
      </Text>

      <Card>
        <Field label="Subject name" value={name} onChangeText={setName} placeholder="e.g. Computational Mathematics" error={errors.name} />
        <Field label="Marks (%)" value={marks} onChangeText={setMarks} placeholder="0 - 100" keyboardType="number-pad" maxLength={3} error={errors.marks} />
        <Button title="+ Add Subject" variant="outline" onPress={addSubject} style={{ marginTop: 16 }} />
      </Card>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, marginBottom: 10 }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>Active Subjects</Text>
        <Text style={{ fontSize: 11, color: colors.textSecondary }}>
          {subjects.length === 1 ? '1 course listed' : `${subjects.length} courses listed`}
        </Text>
      </View>

      {subjects.map((s, i) => (
        <Card key={`${s.name}-${i}`} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>{s.name}</Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
              Marks <Text style={{ color: colors.primary, fontWeight: '700' }}>{s.marks}%</Text> · Grade {gradeFor(s.marks).letter}
            </Text>
          </View>
          <Pressable hitSlop={10} onPress={() => removeSubject(i)}>
            <Ionicons name="trash-outline" size={19} color={colors.danger} />
          </Pressable>
        </Card>
      ))}

      <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary, marginTop: 14 }}>Grading Scale Reference</Text>
      <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 6, lineHeight: 18 }}>
        A+ 90-100 (4.0)   A 80-89 (4.0)   B 70-79 (3.0){'\n'}C 60-69 (2.0)   D 50-59 (1.0)   F below 50 (0.0)
      </Text>

      <View style={{ flexDirection: 'row', marginTop: 18 }}>
        <Button title="Calculate GPA" onPress={calculate} style={{ flex: 1, marginRight: 8 }} />
        <Button title="Reset" variant="outline" onPress={reset} style={{ width: 90 }} />
      </View>

      {result && (
        <View
          style={{
            backgroundColor: result.pass ? colors.successBg : '#FDE8E6',
            borderRadius: 16,
            padding: 18,
            marginTop: 18,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>Calculation Result</Text>
            <Text style={{ fontSize: 10, fontWeight: '700', color: result.pass ? colors.success : colors.danger }}>
              {result.pass ? 'PASS' : 'FAIL'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', marginTop: 14 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: colors.textSecondary }}>Your GPA</Text>
              <Text style={{ fontSize: 22, fontWeight: '700', color: result.pass ? colors.success : colors.danger }}>
                {result.gpa.toFixed(2)} / 4.0
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: colors.textSecondary }}>Overall Performance</Text>
              <Text style={{ fontSize: 22, fontWeight: '700', color: result.pass ? colors.success : colors.danger }}>
                {result.letter} · {result.averageMarks.toFixed(1)}%
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 12 }}>{message}</Text>
          <Button title="Save to history" variant="outline" onPress={save} loading={saving} style={{ marginTop: 14, height: 46 }} />
        </View>
      )}

      <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginTop: 28, marginBottom: 10 }}>
        Grade History
      </Text>
      {history.length === 0 ? (
        <EmptyState title="No saved calculations" hint="Calculate a GPA and tap “Save to history” to keep it across sessions." />
      ) : (
        history.map((h) => (
          <Card key={h.id}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary }}>
                  GPA {h.gpa.toFixed(2)} · {h.letter} ({h.averageMarks.toFixed(1)}%)
                </Text>
                <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>{formatDateTime(h.createdAt)}</Text>
              </View>
              <Pressable
                hitSlop={10}
                onPress={() =>
                  Alert.alert('Delete record', 'Remove this saved calculation?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => user && deleteGradeRecord(user.uid, h.id) },
                  ])
                }
              >
                <Ionicons name="trash-outline" size={19} color={colors.danger} />
              </Pressable>
            </View>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 8 }}>
              {h.subjects.map((s) => `${s.name} ${s.marks}`).join('  ·  ')}
            </Text>
            <Pressable
              onPress={() => {
                setSubjects(h.subjects);
                setResult(null);
              }}
              style={{ marginTop: 10 }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primary }}>Load into calculator</Text>
            </Pressable>
          </Card>
        ))
      )}
    </Screen>
  );
}
