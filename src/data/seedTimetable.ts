import { ClassItem } from '../types';

type Seed = Omit<ClassItem, 'id' | 'order'>;

const L = 'IT03 Classroom';
const LAB = 'Computer Lab';

// Third Year IT (IT03) weekly timetable. Room numbers weren't printed on the
// source timetable, so generic room names are used - edit in-app as a class rep.
export const SEED_TIMETABLE: Seed[] = [
  // Monday
  { day: 'Monday', subjectCode: 'ITM301', room: L, startTime: '09:00 AM', endTime: '10:00 AM', type: 'Lecture' },
  { day: 'Monday', subjectCode: 'ITM302', room: L, startTime: '10:15 AM', endTime: '12:15 PM', type: 'Lecture' },
  { day: 'Monday', subjectCode: 'ITM302 Gr-A', room: LAB, startTime: '01:15 PM', endTime: '04:15 PM', type: 'Practical' },
  { day: 'Monday', subjectCode: 'CTE308 Gr-B', room: LAB, startTime: '01:15 PM', endTime: '04:15 PM', type: 'Practical' },
  // Tuesday
  { day: 'Tuesday', subjectCode: 'CTE309', room: L, startTime: '09:00 AM', endTime: '10:00 AM', type: 'Lecture' },
  { day: 'Tuesday', subjectCode: 'CTE308', room: L, startTime: '10:15 AM', endTime: '12:15 PM', type: 'Lecture' },
  { day: 'Tuesday', subjectCode: 'CTE309 Gr-B', room: LAB, startTime: '01:15 PM', endTime: '04:15 PM', type: 'Practical' },
  { day: 'Tuesday', subjectCode: 'CTE308 Gr-A', room: LAB, startTime: '01:15 PM', endTime: '04:15 PM', type: 'Practical' },
  // Wednesday
  { day: 'Wednesday', subjectCode: 'ITM302', room: L, startTime: '09:00 AM', endTime: '10:00 AM', type: 'Lecture' },
  { day: 'Wednesday', subjectCode: 'EDP101', room: L, startTime: '10:15 AM', endTime: '12:15 PM', type: 'Lecture' },
  { day: 'Wednesday', subjectCode: 'CTE309 Gr-A', room: LAB, startTime: '01:15 PM', endTime: '04:15 PM', type: 'Practical' },
  // Thursday
  { day: 'Thursday', subjectCode: 'HOD', room: 'HOD Office', startTime: '08:00 AM', endTime: '09:00 AM', type: 'Reserved' },
  { day: 'Thursday', subjectCode: 'EDP101', room: L, startTime: '09:00 AM', endTime: '10:00 AM', type: 'Lecture' },
  { day: 'Thursday', subjectCode: 'ITM301', room: L, startTime: '10:15 AM', endTime: '12:15 PM', type: 'Lecture' },
  { day: 'Thursday', subjectCode: 'ITM302 Gr-B', room: LAB, startTime: '01:15 PM', endTime: '04:15 PM', type: 'Practical' },
  // Friday
  { day: 'Friday', subjectCode: 'CTE308', room: L, startTime: '09:00 AM', endTime: '10:00 AM', type: 'Lecture' },
  { day: 'Friday', subjectCode: 'CTE309', room: L, startTime: '10:15 AM', endTime: '12:15 PM', type: 'Lecture' },
  { day: 'Friday', subjectCode: 'EDP101', room: L, startTime: '01:15 PM', endTime: '02:15 PM', type: 'Tutorial' },
];
