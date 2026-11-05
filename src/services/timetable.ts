import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import { ClassItem } from '../types';
import { SEED_TIMETABLE } from '../data/seedTimetable';

const classesRef = collection(db, 'timetable');

/** "01:15 PM" -> minutes since midnight, used for sorting within a day. */
export function timeToMinutes(t: string): number {
  const m = t.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return 0;
  let h = parseInt(m[1], 10) % 12;
  if (m[3].toUpperCase() === 'PM') h += 12;
  return h * 60 + parseInt(m[2], 10);
}

export function subscribeClasses(onData: (items: ClassItem[]) => void, onError?: (e: Error) => void) {
  return onSnapshot(
    classesRef,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ClassItem, 'id'>) }));
      items.sort((a, b) => a.order - b.order);
      onData(items);
    },
    (err) => onError?.(err)
  );
}

export async function addClass(input: Omit<ClassItem, 'id' | 'order'>) {
  await addDoc(classesRef, { ...input, order: timeToMinutes(input.startTime) });
}

export async function deleteClass(id: string) {
  await deleteDoc(doc(db, 'timetable', id));
}

/** Publishes the starter IT03 timetable (class reps only; replaces anything already there). */
export async function publishSeedTimetable() {
  const existing = await getDocs(classesRef);
  const batch = writeBatch(db);
  existing.forEach((d) => batch.delete(d.ref));
  SEED_TIMETABLE.forEach((c) => {
    batch.set(doc(classesRef), { ...c, order: timeToMinutes(c.startTime) });
  });
  await batch.commit();
}
