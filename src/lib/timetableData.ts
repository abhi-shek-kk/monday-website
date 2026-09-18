export interface TimetableCell {
  period: number; // 1 to 6
  span?: number; // 1 (default) or multi-period continuous span (e.g., 2 or 3)
  code: string;
  name: string;
  category: "DSC" | "LAB" | "MDC" | "AEC" | "MENTOR" | "SWAYAM" | "TECHLAB";
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
          { period: 1, code: "DSC-A", name: "AI and Data Science", category: "DSC" },
          { period: 2, code: "DSC-B", name: "Python Programming", category: "DSC" },
          { period: 3, code: "DSC-C", name: "Statistics", category: "DSC" },
          { period: 4, code: "AEC-ENG", name: "English", category: "AEC" },
          { period: 5, code: "AEC-LANG", name: "Cyriac / Hindi / Malayalam", category: "AEC" },
          { period: 6, code: "LAB-XL", name: "Lab (Excel)", category: "LAB" },
        ],
      },
      {
        day: "DAY 2",
        label: "Order Day 2",
        cells: [
          { period: 1, code: "DSC-C", name: "Statistics", category: "DSC" },
          { period: 2, span: 2, code: "DSC-B-LAB", name: "Python Lab", category: "LAB" },
          { period: 4, span: 2, code: "MDC", name: "Multi-Disciplinary Course", category: "MDC" },
          { period: 6, code: "LAB-XL", name: "Lab (Excel)", category: "LAB" },
        ],
      },
      {
        day: "DAY 3",
        label: "Order Day 3",
        cells: [
          { period: 1, code: "DSC-A", name: "AI and Data Science", category: "DSC" },
          { period: 2, code: "DSC-A", name: "AI and Data Science", category: "DSC" },
          { period: 3, code: "MDC", name: "Multi-Disciplinary Course", category: "MDC" },
          { period: 4, code: "DSC-B", name: "Python Programming", category: "DSC" },
          { period: 5, code: "AEC-LANG", name: "Cyriac / Hindi / Malayalam", category: "AEC" },
          { period: 6, code: "SWAYAM", name: "Swayam", category: "SWAYAM" },
        ],
      },
      {
        day: "DAY 4",
        label: "Order Day 4",
        cells: [
          { period: 1, code: "DSC-A", name: "AI and Data Science", category: "DSC" },
          { period: 2, code: "DSC-B", name: "Python Programming", category: "DSC" },
          { period: 3, code: "AEC-ENG", name: "English", category: "AEC" },
          { period: 4, code: "DSC-C", name: "Statistics", category: "DSC" },
          { period: 5, code: "MDC", name: "Multi-Disciplinary Course", category: "MDC" },
          { period: 6, code: "TECH-LAB", name: "Tech Lab", category: "TECHLAB" },
        ],
      },
      {
        day: "DAY 5",
        label: "Order Day 5",
        cells: [
          { period: 1, code: "DSC-A", name: "AI and Data Science", category: "DSC" },
          { period: 2, code: "DSC-C", name: "Statistics", category: "DSC" },
          { period: 3, code: "DSC-C", name: "Statistics", category: "DSC" },
          { period: 4, code: "AEC-ENG", name: "English", category: "AEC" },
          { period: 5, code: "AEC-LANG", name: "Cyriac / Hindi / Malayalam", category: "AEC" },
          { period: 6, code: "MENTOR", name: "Mentoring", category: "MENTOR" },
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
