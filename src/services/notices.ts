import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
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

export async function addNotice(input: {
  title: string;
  description: string;
  category: NoticeCategory;
  authorId: string;
  authorEmail: string;
}) {
  await addDoc(noticesRef, { ...input, createdAt: Date.now() });
  // Fire-and-forget: alert every other signed-up device about the new notice.
  sendPushToEveryone(`New notice: ${input.title}`, input.description, input.authorId).catch(() => {});
}

export async function deleteNotice(id: string) {
  await deleteDoc(doc(db, 'notices', id));
}
