export type NoticeCategory = 'Academic' | 'Facilities' | 'Student Life' | 'Events';
export const NOTICE_CATEGORIES: NoticeCategory[] = ['Academic', 'Facilities', 'Student Life', 'Events'];

export interface Notice {
  id: string;
  title: string;
  description: string;
  category: NoticeCategory;
  createdAt: number; // epoch ms
  authorId: string;
  authorEmail: string;
  authorName?: string; // older notices won't have this - fall back to the email
  updatedAt?: number; // set when the notice has been edited
  pinned?: boolean; // pinned notices stay at the top of the board
}

export type Day = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export const DAYS: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export type ClassType = 'Lecture' | 'Practical' | 'Tutorial' | 'Reserved';

export interface ClassItem {
  id: string;
  day: Day;
  subjectCode: string;
  room: string;
  startTime: string; // "09:00 AM"
  endTime: string;
  type: ClassType;
  order: number; // minutes since midnight, used for sorting
}

export interface Subject {
  name: string;
  marks: number;
}

export interface GradeRecord {
  id: string;
  subjects: Subject[];
  gpa: number;
  averageMarks: number;
  letter: string;
  createdAt: number;
}

export interface LibraryCard {
  name: string;
  department: string;
  idNumber: string;
  expiry: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: 'student' | 'rep';
}
