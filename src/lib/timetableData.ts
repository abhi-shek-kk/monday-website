export interface TimetableCell {
  period: number; // 1 to 6
  span?: number; // 1 (default) or multi-period continuous span (e.g., 2 or 3)
  code: string;
  name: string;
  category: "DSC" | "LAB" | "MDC" | "LANG" | "ENG" | "MENTOR";
}

export interface DaySchedule {
  day: string; // e.g. "DAY 1"
  label: string; // e.g. "Order Day 1"
  cells: TimetableCell[];
}

export interface SemesterTimetable {
  semester: string; // "S1"
  title: string;
  isAvailable: boolean;
  schedule: DaySchedule[];
}

export const TIMETABLE_DATA: Record<string, SemesterTimetable> = {
  S1: {
    semester: "S1",
    title: "Semester 1 — BSc AI & Data Science",
    isAvailable: true,
    schedule: [
      {
        day: "DAY 1",
        label: "Order Day 1",
        cells: [
          { period: 1, code: "AIDS101", name: "Introduction to AI & Data Science", category: "DSC" },
          { period: 2, code: "AIDS102", name: "Programming in C & Problem Solving", category: "DSC" },
          { period: 3, code: "ENG-101", name: "English & Technical Communication", category: "ENG" },
          { period: 4, code: "LANG-101", name: "Second Language", category: "LANG" },
          { period: 5, span: 2, code: "AIDS102-L", name: "Programming in C Lab", category: "LAB" },
        ],
      },
      {
        day: "DAY 2",
        label: "Order Day 2",
        cells: [
          { period: 1, code: "AIDS102", name: "Programming in C & Problem Solving", category: "DSC" },
          { period: 2, code: "MDC-101", name: "Multi-Disciplinary Course", category: "MDC" },
          { period: 3, code: "AIDS101", name: "Introduction to AI & Data Science", category: "DSC" },
          { period: 4, span: 3, code: "AIDS101-L", name: "AI & Data Science Tools Lab", category: "LAB" },
        ],
      },
      {
        day: "DAY 3",
        label: "Order Day 3",
        cells: [
          { period: 1, code: "ENG-101", name: "English & Technical Communication", category: "ENG" },
          { period: 2, code: "AIDS101", name: "Introduction to AI & Data Science", category: "DSC" },
          { period: 3, code: "LANG-101", name: "Second Language", category: "LANG" },
          { period: 4, code: "MDC-101", name: "Multi-Disciplinary Course", category: "MDC" },
          { period: 5, code: "AIDS102", name: "Programming in C & Problem Solving", category: "DSC" },
          { period: 6, code: "VAC-101", name: "Value Added / Skill Course", category: "MENTOR" },
        ],
      },
      {
        day: "DAY 4",
        label: "Order Day 4",
        cells: [
          { period: 1, span: 2, code: "AIDS102-L", name: "Programming in C Lab", category: "LAB" },
          { period: 3, code: "AIDS101", name: "Introduction to AI & Data Science", category: "DSC" },
          { period: 4, code: "ENG-101", name: "English & Technical Communication", category: "ENG" },
          { period: 5, code: "MDC-101", name: "Multi-Disciplinary Course", category: "MDC" },
          { period: 6, code: "MENTOR", name: "Academic Mentoring", category: "MENTOR" },
        ],
      },
      {
        day: "DAY 5",
        label: "Order Day 5",
        cells: [
          { period: 1, code: "LANG-101", name: "Second Language", category: "LANG" },
          { period: 2, code: "AIDS102", name: "Programming in C & Problem Solving", category: "DSC" },
          { period: 3, code: "MDC-101", name: "Multi-Disciplinary Course", category: "MDC" },
          { period: 4, code: "AIDS101", name: "Introduction to AI & Data Science", category: "DSC" },
          { period: 5, span: 2, code: "AIDS101-L", name: "AI & Data Tools Lab", category: "LAB" },
        ],
      },
    ],
  },
  S3: {
    semester: "S3",
    title: "Semester 3 — BSc AI & Data Science",
    isAvailable: false,
    schedule: [],
  },
  S5: {
    semester: "S5",
    title: "Semester 5 — BSc AI & Data Science",
    isAvailable: false,
    schedule: [],
  },
  S7: {
    semester: "S7",
    title: "Semester 7 — BSc AI & Data Science",
    isAvailable: false,
    schedule: [],
  },
};
