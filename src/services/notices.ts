import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Notice, NoticeCategory } from '../types';
import { sendPushToEveryone } from './notifications';

const noticesRef = collection(db, 'notices');

/** Real-time listener: callback fires immediately and again on every change from any device. */
export function subscribeNotices(
  onData: (notices: Notice[]) => void,
  onError?: (e: Error) => void
) {
  const q = query(noticesRef, orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      onData(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Notice, 'id'>) }))
      );
    },
    (err) => onError?.(err)
  );
}

// ---- Create ----
export async function addNotice(input: {
  title: string;
  description: string;
  category: NoticeCategory;
  authorId: string;
  authorEmail: string;
  authorName: string;
  pinned?: boolean;
}) {
  await addDoc(noticesRef, { ...input, pinned: !!input.pinned, createdAt: Date.now() });
  // Fire-and-forget: alert every other signed-up device about the new notice.
  sendPushToEveryone(`New notice: ${input.title}`, input.description, input.authorId).catch(() => {});
}

// ---- Update ----
// Only the content fields are editable; author and creation time never change.
export async function updateNotice(
  id: string,
  changes: { title: string; description: string; category: NoticeCategory; pinned?: boolean }
) {
  const data: Record<string, unknown> = {
    title: changes.title,
    description: changes.description,
    category: changes.category,
    updatedAt: Date.now(),
  };
  if (changes.pinned !== undefined) data.pinned = changes.pinned;
  await updateDoc(doc(db, 'notices', id), data);
}

/** Pin / unpin without touching the content (class reps only - enforced by the Firestore rules). */
export async function setNoticePinned(id: string, pinned: boolean) {
  await updateDoc(doc(db, 'notices', id), { pinned });
}

// ---- Delete ----
export async function deleteNotice(id: string) {
  await deleteDoc(doc(db, 'notices', id));
}
