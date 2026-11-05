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
import { GradeRecord, Subject } from '../types';

/** Same scale as the Project I app: A+ 90-100 (4.0), A 80-89 (4.0), B 70-79 (3.0), C 60-69 (2.0), D 50-59 (1.0), F <50 (0.0) */
export function gradeFor(marks: number): { letter: string; points: number } {
  if (marks >= 90) return { letter: 'A+', points: 4.0 };
  if (marks >= 80) return { letter: 'A', points: 4.0 };
  if (marks >= 70) return { letter: 'B', points: 3.0 };
  if (marks >= 60) return { letter: 'C', points: 2.0 };
  if (marks >= 50) return { letter: 'D', points: 1.0 };
  return { letter: 'F', points: 0.0 };
}

export function computeResult(subjects: Subject[]) {
  const gpa = subjects.reduce((s, x) => s + gradeFor(x.marks).points, 0) / subjects.length;
  const averageMarks = subjects.reduce((s, x) => s + x.marks, 0) / subjects.length;
  const { letter } = gradeFor(Math.floor(averageMarks));
  return { gpa, averageMarks, letter, pass: averageMarks >= 50 };
}

const historyRef = (uid: string) => collection(db, 'users', uid, 'grades');

export async function saveGradeRecord(uid: string, subjects: Subject[]) {
  const { gpa, averageMarks, letter } = computeResult(subjects);
  await addDoc(historyRef(uid), { subjects, gpa, averageMarks, letter, createdAt: Date.now() });
}

export function subscribeGradeHistory(
  uid: string,
  onData: (records: GradeRecord[]) => void,
  onError?: (e: Error) => void
) {
  const q = query(historyRef(uid), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) =>
      onData(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<GradeRecord, 'id'>) }))),
    (err) => onError?.(err)
  );
}

export async function deleteGradeRecord(uid: string, id: string) {
  await deleteDoc(doc(db, 'users', uid, 'grades', id));
}
