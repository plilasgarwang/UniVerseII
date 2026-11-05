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
import { addNotice, deleteNotice, subscribeNotices } from '../services/notices';
import { categoryStyles, colors, radius } from '../theme';
import { Notice, NoticeCategory, NOTICE_CATEGORIES } from '../types';
import { formatDateTime } from '../utils/format';

type Filter = 'All Updates' | NoticeCategory;
const FILTERS: Filter[] = ['All Updates', ...NOTICE_CATEGORIES];

export default function NoticeFeedScreen() {
  const { user, isRep } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [filter, setFilter] = useState<Filter>('All Updates');
  const [selected, setSelected] = useState<Notice | null>(null);
  const [composing, setComposing] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    const unsub = subscribeNotices(
      (n) => {
        setNotices(n);
        setLoading(false);
        setError(undefined);
      },
      (e) => {
        setError(e.message);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  const visible = useMemo(
    () => (filter === 'All Updates' ? notices : notices.filter((n) => n.category === filter)),
    [notices, filter]
  );

  const canDelete = (n: Notice) => isRep || n.authorId === user?.uid;

  const confirmDelete = (n: Notice) => {
    Alert.alert('Delete notice', `Delete "${n.title}" for everyone?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteNotice(n.id);
            setSelected(null);
          } catch (e) {
            Alert.alert('Could not delete', (e as Error).message);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgScreen }} edges={['top']}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <Header
          subtitle="UniVerse"
          title="Notice Feed"
          right={
            <Pressable
              onPress={() => setComposing(true)}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="add" size={26} color="#fff" />
            </Pressable>
          }
        />
        {!isFirebaseConfigured && <SetupBanner />}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
          {FILTERS.map((f) => {
            const active = f === filter;
            return (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: radius.md,
                  marginRight: 8,
                  backgroundColor: active ? colors.primary : colors.bgCard,
                  borderWidth: 1,
                  borderColor: active ? colors.primary : colors.border,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: active ? '700' : '400', color: active ? '#fff' : colors.textSecondary }}>
                  {f}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : error ? (
        <EmptyState title="Couldn't load notices" hint={error} />
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(n) => n.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 30 }}
          ListEmptyComponent={
            <EmptyState title="No notices yet" hint="Tap + to publish the first one. Everyone sees it instantly." />
          }
          renderItem={({ item }) => {
            const s = categoryStyles[item.category] ?? categoryStyles.Academic;
            return (
              <Card onPress={() => setSelected(item)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Pill text={item.category} bg={s.bg} color={s.text} />
                  {canDelete(item) && (
                    <Pressable hitSlop={10} onPress={() => confirmDelete(item)}>
                      <Ionicons name="trash-outline" size={20} color={colors.danger} />
                    </Pressable>
                  )}
                </View>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginTop: 10 }}>
                  {item.title}
                </Text>
                <Text numberOfLines={2} style={{ fontSize: 13, color: colors.textSecondary, marginTop: 6 }}>
                  {item.description}
                </Text>
                <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 10 }}>
                  {formatDateTime(item.createdAt)}
                </Text>
              </Card>
            );
          }}
        />
      )}

      <NoticeDetailModal
        notice={selected}
        canDelete={selected ? canDelete(selected) : false}
        onClose={() => setSelected(null)}
        onDelete={() => selected && confirmDelete(selected)}
      />
      <ComposeModal
        visible={composing}
        onClose={() => setComposing(false)}
        onPublish={async (title, description, category) => {
          if (!user) return;
          await addNotice({
            title,
            description,
            category,
            authorId: user.uid,
            authorEmail: user.email ?? '',
          });
        }}
      />
    </SafeAreaView>
  );
}

function ModalShell({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 20 }}
      >
        <View
          style={{
            backgroundColor: colors.bgCard,
            borderRadius: radius.lg,
            padding: 20,
            maxHeight: '90%',
          }}
        >
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function NoticeDetailModal({
  notice,
  canDelete,
  onClose,
  onDelete,
}: {
  notice: Notice | null;
  canDelete: boolean;
  onClose: () => void;
  onDelete: () => void;
}) {
  const s = notice ? categoryStyles[notice.category] ?? categoryStyles.Academic : categoryStyles.Academic;
  return (
    <ModalShell visible={!!notice} onClose={onClose}>
      {notice && (
        <>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Pill text={notice.category} bg={s.bg} color={s.text} />
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>
          <Text style={{ fontSize: 19, fontWeight: '700', color: colors.textPrimary, marginTop: 14 }}>
            {notice.title}
          </Text>
          <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 6 }}>
            {formatDateTime(notice.createdAt)} · {notice.authorEmail}
          </Text>
          <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 14 }} />
          <ScrollView style={{ maxHeight: 320 }}>
            <Text style={{ fontSize: 14, lineHeight: 21, color: colors.textPrimary }}>{notice.description}</Text>
          </ScrollView>
          <View style={{ flexDirection: 'row', marginTop: 20 }}>
            {canDelete && (
              <Button title="Delete" variant="danger" onPress={onDelete} style={{ flex: 1, marginRight: 8 }} />
            )}
            <Button title="Close" onPress={onClose} style={{ flex: 1 }} />
          </View>
        </>
      )}
    </ModalShell>
  );
}

function ComposeModal({
  visible,
  onClose,
  onPublish,
}: {
  visible: boolean;
  onClose: () => void;
  onPublish: (title: string, description: string, category: NoticeCategory) => Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<NoticeCategory>('Academic');
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  const reset = () => {
    setTitle('');
    setDescription('');
    setCategory('Academic');
    setErrors({});
  };

  const submit = async () => {
    const e: typeof errors = {};
    if (!title.trim()) e.title = 'Title is required';
    if (!description.trim()) e.description = 'Description is required';
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      await onPublish(title.trim(), description.trim(), category);
      reset();
      onClose();
    } catch (err) {
      Alert.alert('Could not publish', (err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell visible={visible} onClose={onClose}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>Add New Notice</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </Pressable>
        </View>
        <Field label="Notice Title" value={title} onChangeText={setTitle} placeholder="Mid-Term Examination Roster" error={errors.title} />
        <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 14, marginBottom: 6 }}>Category</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {NOTICE_CATEGORIES.map((c) => {
            const active = c === category;
            const s = categoryStyles[c];
            return (
              <Pressable
                key={c}
                onPress={() => setCategory(c)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: radius.pill,
                  marginRight: 8,
                  marginBottom: 8,
                  backgroundColor: active ? s.text : s.bg,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: active ? '#fff' : s.text }}>{c}</Text>
              </Pressable>
            );
          })}
        </View>
        <Field
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Dear students, please find the details below..."
          multiline
          error={errors.description}
        />
        <View style={{ flexDirection: 'row', marginTop: 20 }}>
          <Button title="Cancel" variant="outline" onPress={onClose} style={{ flex: 1, marginRight: 8 }} />
          <Button title="Publish Notice" onPress={submit} loading={busy} style={{ flex: 1 }} />
        </View>
      </ScrollView>
    </ModalShell>
  );
}
