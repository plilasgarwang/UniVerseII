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
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, EmptyState, Field, Header, Pill, SetupBanner } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { isFirebaseConfigured } from '../firebase';
import {
  addNotice,
  deleteNotice,
  setNoticePinned,
  subscribeNotices,
  updateNotice,
} from '../services/notices';
import { categoryStyles, colors, radius } from '../theme';
import { Notice, NoticeCategory, NOTICE_CATEGORIES } from '../types';
import { formatDateTime, formatRelative, isNew } from '../utils/format';

type Filter = 'All Updates' | NoticeCategory;
const FILTERS: Filter[] = ['All Updates', ...NOTICE_CATEGORIES];

type Row =
  | { type: 'header'; key: string; label: string; icon: keyof typeof Ionicons.glyphMap }
  | { type: 'notice'; key: string; notice: Notice };

const styleFor = (c: string) => categoryStyles[c] ?? categoryStyles.Academic;
const authorLabel = (n: Notice) => n.authorName || n.authorEmail.split('@')[0] || 'Unknown';

export default function NoticeFeedScreen() {
  const { user, profile, isRep } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [filter, setFilter] = useState<Filter>('All Updates');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Notice | null>(null);
  const [composer, setComposer] = useState<{ open: boolean; editing: Notice | null }>({
    open: false,
    editing: null,
  });

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    return subscribeNotices(
      (n) => {
        setNotices(n);
        setLoading(false);
        setError(undefined);
        // keep an open detail view in sync with live edits from other devices
        setSelected((cur) => (cur ? n.find((x) => x.id === cur.id) ?? null : null));
      },
      (e) => {
        setError(e.message);
        setLoading(false);
      }
    );
  }, []);

  const canManage = (n: Notice) => isRep || n.authorId === user?.uid;

  const rows: Row[] = useMemo(() => {
    const q = search.trim().toLowerCase();
    const visible = notices.filter(
      (n) =>
        (filter === 'All Updates' || n.category === filter) &&
        (!q || n.title.toLowerCase().includes(q) || n.description.toLowerCase().includes(q))
    );
    const pinned = visible.filter((n) => n.pinned);
    const rest = visible.filter((n) => !n.pinned);
    const out: Row[] = [];
    if (pinned.length) {
      out.push({ type: 'header', key: 'h-pinned', label: 'Pinned', icon: 'pin' });
      pinned.forEach((n) => out.push({ type: 'notice', key: n.id, notice: n }));
    }
    if (rest.length) {
      out.push({ type: 'header', key: 'h-latest', label: pinned.length ? 'Latest' : 'Latest notices', icon: 'megaphone-outline' });
      rest.forEach((n) => out.push({ type: 'notice', key: n.id, notice: n }));
    }
    return out;
  }, [notices, filter, search]);

  const confirmDelete = (n: Notice) => {
    Alert.alert('Delete notice', `Remove "${n.title}" from the notice board for everyone?`, [
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

  const togglePin = async (n: Notice) => {
    try {
      await setNoticePinned(n.id, !n.pinned);
    } catch (e) {
      Alert.alert('Could not update pin', (e as Error).message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgScreen }} edges={['top']}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <Header
          subtitle="UniVerse"
          title="Notice Board"
          right={
            <Pressable
              onPress={() => setComposer({ open: true, editing: null })}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.primary,
                borderRadius: 22,
                paddingHorizontal: 14,
                height: 40,
              }}
            >
              <Ionicons name="create-outline" size={18} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13, marginLeft: 6 }}>Post</Text>
            </Pressable>
          }
        />
        {!isFirebaseConfigured && <SetupBanner />}

        {/* Search */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.bgCard,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.md,
            paddingHorizontal: 12,
            height: 44,
            marginBottom: 12,
          }}
        >
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search notices"
            placeholderTextColor={colors.textSecondary}
            style={{ flex: 1, marginLeft: 8, fontSize: 14, color: colors.textPrimary }}
            returnKeyType="search"
          />
          {search ? (
            <Pressable onPress={() => setSearch('')} hitSlop={10}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </Pressable>
          ) : null}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: active ? '700' : '400',
                    color: active ? '#fff' : colors.textSecondary,
                  }}
                >
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
          data={rows}
          keyExtractor={(r) => r.key}
          contentContainerStyle={{ padding: 20, paddingBottom: 30 }}
          ListEmptyComponent={
            <EmptyState
              title={search || filter !== 'All Updates' ? 'No matching notices' : 'The board is empty'}
              hint={
                search || filter !== 'All Updates'
                  ? 'Try a different search or category.'
                  : 'Tap Post to put up the first announcement. Everyone sees it instantly.'
              }
            />
          }
          renderItem={({ item }) =>
            item.type === 'header' ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: 4 }}>
                <Ionicons name={item.icon} size={15} color={colors.primary} />
                <Text
                  style={{
                    marginLeft: 6,
                    fontSize: 12,
                    fontWeight: '800',
                    letterSpacing: 1,
                    color: colors.primary,
                    textTransform: 'uppercase',
                  }}
                >
                  {item.label}
                </Text>
                <View style={{ flex: 1, height: 1, backgroundColor: colors.border, marginLeft: 10 }} />
              </View>
            ) : (
              <NoticeCard notice={item.notice} onPress={() => setSelected(item.notice)} />
            )
          }
        />
      )}

      <NoticeDetailModal
        notice={selected}
        canManage={selected ? canManage(selected) : false}
        isRep={isRep}
        onClose={() => setSelected(null)}
        onEdit={() => {
          const n = selected;
          setSelected(null);
          setComposer({ open: true, editing: n });
        }}
        onDelete={() => selected && confirmDelete(selected)}
        onTogglePin={() => selected && togglePin(selected)}
      />

      <ComposeModal
        visible={composer.open}
        editing={composer.editing}
        isRep={isRep}
        onClose={() => setComposer({ open: false, editing: null })}
        onSubmit={async ({ title, description, category, pinned }) => {
          if (composer.editing) {
            await updateNotice(composer.editing.id, {
              title,
              description,
              category,
              // only class reps may change the pin; students never send the field
              pinned: isRep ? pinned : undefined,
            });
          } else {
            if (!user) return;
            await addNotice({
              title,
              description,
              category,
              authorId: user.uid,
              authorEmail: user.email ?? '',
              authorName: profile?.name || user.displayName || '',
              pinned: isRep ? pinned : false,
            });
          }
        }}
      />
    </SafeAreaView>
  );
}

/** One announcement on the board: coloured edge, author, relative time - no checkbox/trash like a to-do item. */
function NoticeCard({ notice, onPress }: { notice: Notice; onPress: () => void }) {
  const s = styleFor(notice.category);
  const fresh = isNew(notice.createdAt);
  const pinned = !!notice.pinned;
  const author = authorLabel(notice);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          backgroundColor: pinned ? s.bg : colors.bgCard,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: pinned ? s.text : colors.border,
          marginBottom: 14,
          overflow: 'hidden',
          shadowColor: '#1E1E2D',
          shadowOpacity: 0.06,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
          elevation: 2,
        },
        pressed && { opacity: 0.88 },
      ]}
    >
      <View style={{ width: 6, backgroundColor: s.text }} />
      <View style={{ flex: 1, padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pill text={notice.category} bg={pinned ? '#FFFFFF' : s.bg} color={s.text} />
          {fresh && (
            <View
              style={{
                marginLeft: 8,
                backgroundColor: colors.danger,
                borderRadius: 6,
                paddingHorizontal: 6,
                paddingVertical: 2,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 }}>NEW</Text>
            </View>
          )}
          <View style={{ flex: 1 }} />
          {pinned && <Ionicons name="pin" size={16} color={s.text} style={{ marginRight: 8 }} />}
          <Text style={{ fontSize: 11, color: colors.textSecondary }}>{formatRelative(notice.createdAt)}</Text>
        </View>

        <Text style={{ fontSize: 17, fontWeight: '800', color: colors.textPrimary, marginTop: 12, lineHeight: 23 }}>
          {notice.title}
        </Text>
        <Text numberOfLines={3} style={{ fontSize: 13, color: colors.textSecondary, marginTop: 6, lineHeight: 19 }}>
          {notice.description}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14 }}>
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
              {author.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text numberOfLines={1} style={{ flexShrink: 1, fontSize: 12, color: colors.textSecondary, marginLeft: 8 }}>
            Posted by <Text style={{ fontWeight: '700', color: colors.textPrimary }}>{author}</Text>
          </Text>
          {notice.updatedAt ? (
            <Text style={{ fontSize: 11, color: colors.textSecondary, marginLeft: 6, fontStyle: 'italic' }}>· edited</Text>
          ) : null}
          <View style={{ flex: 1 }} />
          <Text style={{ fontSize: 12, fontWeight: '700', color: s.text }}>Read ›</Text>
        </View>
      </View>
    </Pressable>
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
            overflow: 'hidden',
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
  canManage,
  isRep,
  onClose,
  onEdit,
  onDelete,
  onTogglePin,
}: {
  notice: Notice | null;
  canManage: boolean;
  isRep: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
}) {
  const s = notice ? styleFor(notice.category) : styleFor('Academic');
  return (
    <ModalShell visible={!!notice} onClose={onClose}>
      {notice && (
        <>
          {/* coloured header band, like the top of a pinned announcement sheet */}
          <View
            style={{
              backgroundColor: s.bg,
              paddingHorizontal: 20,
              paddingVertical: 14,
              flexDirection: 'row',
              alignItems: 'center',
              borderBottomWidth: 3,
              borderBottomColor: s.text,
            }}
          >
            <Ionicons name={notice.pinned ? 'pin' : 'megaphone-outline'} size={18} color={s.text} />
            <Text style={{ marginLeft: 8, fontSize: 12, fontWeight: '800', letterSpacing: 1, color: s.text }}>
              {notice.pinned ? 'PINNED · ' : ''}
              {notice.category.toUpperCase()}
            </Text>
            <View style={{ flex: 1 }} />
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={s.text} />
            </Pressable>
          </View>

          <ScrollView style={{ maxHeight: 420 }} contentContainerStyle={{ padding: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: colors.textPrimary, lineHeight: 27 }}>
              {notice.title}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>
                  {authorLabel(notice).charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>{authorLabel(notice)}</Text>
                <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                  {formatDateTime(notice.createdAt)}
                  {notice.updatedAt ? `  ·  Edited ${formatRelative(notice.updatedAt)}` : ''}
                </Text>
              </View>
            </View>
            <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 16 }} />
            <Text style={{ fontSize: 15, lineHeight: 23, color: colors.textPrimary }}>{notice.description}</Text>
          </ScrollView>

          <View style={{ padding: 16, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
            {canManage && (
              <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                <Button
                  title="Edit"
                  variant="outline"
                  onPress={onEdit}
                  style={{ flex: 1, height: 44, marginRight: 8 }}
                />
                {isRep && (
                  <Button
                    title={notice.pinned ? 'Unpin' : 'Pin'}
                    variant="outline"
                    onPress={onTogglePin}
                    style={{ flex: 1, height: 44, marginRight: 8 }}
                  />
                )}
                <Button title="Delete" variant="danger" onPress={onDelete} style={{ flex: 1, height: 44 }} />
              </View>
            )}
            <Button title="Close" onPress={onClose} style={{ height: 46 }} />
          </View>
        </>
      )}
    </ModalShell>
  );
}

function ComposeModal({
  visible,
  editing,
  isRep,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  editing: Notice | null;
  isRep: boolean;
  onClose: () => void;
  onSubmit: (v: { title: string; description: string; category: NoticeCategory; pinned: boolean }) => Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<NoticeCategory>('Academic');
  const [pinned, setPinned] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  // Load the notice being edited (or blank values for a new post) each time the form opens.
  useEffect(() => {
    if (!visible) return;
    setTitle(editing?.title ?? '');
    setDescription(editing?.description ?? '');
    setCategory(editing?.category ?? 'Academic');
    setPinned(!!editing?.pinned);
    setErrors({});
  }, [visible, editing]);

  const submit = async () => {
    const e: typeof errors = {};
    if (!title.trim()) e.title = 'Title is required';
    if (!description.trim()) e.description = 'Description is required';
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      await onSubmit({ title: title.trim(), description: description.trim(), category, pinned });
      onClose();
    } catch (err) {
      Alert.alert(editing ? 'Could not save changes' : 'Could not publish', (err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell visible={visible} onClose={onClose}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>
            {editing ? 'Edit Notice' : 'Post a Notice'}
          </Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </Pressable>
        </View>

        <Field
          label="Notice Title"
          value={title}
          onChangeText={setTitle}
          placeholder="Mid-Term Examination Roster"
          error={errors.title}
        />

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

        {isRep && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
            <Ionicons name="pin" size={18} color={colors.primary} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>Pin to top of the board</Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>Important notices stay above the rest.</Text>
            </View>
            <Switch
              value={pinned}
              onValueChange={setPinned}
              trackColor={{ true: colors.primary, false: colors.border }}
            />
          </View>
        )}

        <View style={{ flexDirection: 'row', marginTop: 20 }}>
          <Button title="Cancel" variant="outline" onPress={onClose} style={{ flex: 1, marginRight: 8 }} />
          <Button
            title={editing ? 'Save Changes' : 'Publish'}
            onPress={submit}
            loading={busy}
            style={{ flex: 1 }}
          />
        </View>
      </ScrollView>
    </ModalShell>
  );
}
