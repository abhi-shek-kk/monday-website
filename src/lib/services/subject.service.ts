import { db } from "@/lib/db";

export interface PublicSubject {
  id: string;
  code: string;
  name: string;
  description: string | null;
  semester: number;
  faculties: Array<{
    id?: string;
    faculty: {
      fullName: string;
      designation: string;
    };
  }>;
  notes: Array<{
    id: string;
  }>;
}

export const DEFAULT_SUBJECTS: PublicSubject[] = [
  {
    id: "def-aids101",
    code: "AIDS101",
    name: "Introduction to Artificial Intelligence & Data Science",
    semester: 1,
    description: "Foundational concepts of AI, Data Science, linear algebra, and problem-solving methodologies.",
    faculties: [],
    notes: [],
  },
  {
    id: "def-aids102",
    code: "AIDS102",
    name: "Programming in C & Problem Solving",
    semester: 1,
    description: "Fundamentals of procedural programming, control structures, arrays, pointers, and memory management.",
    faculties: [],
    notes: [],
  },
  {
    id: "def-aids103",
    code: "AIDS103",
    name: "Python Programming for Data Analytics",
    semester: 2,
    description: "Core Python syntax, data manipulation with NumPy and Pandas, and visualization libraries.",
    faculties: [],
    notes: [],
  },
  {
    id: "def-aids104",
    code: "AIDS104",
    name: "Discrete Mathematics & Probability",
    semester: 2,
    description: "Mathematical logic, set theory, combinatorics, discrete probability distributions, and random variables.",
    faculties: [],
    notes: [],
  },
  {
    id: "def-aids201",
    code: "AIDS201",
    name: "Data Structures & Algorithm Analysis",
    semester: 3,
    description: "Linear and non-linear data structures, searching, sorting, and asymptotic time-space analysis.",
    faculties: [],
    notes: [],
  },
  {
    id: "def-aids202",
    code: "AIDS202",
    name: "Object-Oriented Programming with Java",
    semester: 3,
    description: "OOP principles, encapsulation, inheritance, polymorphism, and exception handling in Java.",
    faculties: [],
    notes: [],
  },
  {
    id: "def-aids203",
    code: "AIDS203",
    name: "Database Management Systems & SQL",
    semester: 4,
    description: "Relational database design, ER modeling, normalization, complex SQL queries, and transaction management.",
    faculties: [],
    notes: [],
  },
  {
    id: "def-aids204",
    code: "AIDS204",
    name: "Statistical Methods for Data Science",
    semester: 4,
    description: "Inferential statistics, hypothesis testing, ANOVA, regression analysis, and confidence intervals.",
    faculties: [],
    notes: [],
  },
  {
    id: "def-aids301",
    code: "AIDS301",
    name: "Machine Learning Fundamentals",
    semester: 5,
    description: "Supervised and unsupervised learning, regression, decision trees, SVMs, clustering, and model evaluation.",
    faculties: [],
    notes: [],
  },
  {
    id: "def-aids302",
    code: "AIDS302",
    name: "Web Application Development",
    semester: 5,
    description: "Modern web stack, RESTful APIs, frontend frameworks, backend integration, and web deployment.",
    faculties: [],
    notes: [],
  },
  {
    id: "def-aids303",
    code: "AIDS303",
    name: "Deep Learning & Neural Networks",
    semester: 6,
    description: "Artificial neural networks, backpropagation, CNNs for vision, RNNs, and deep learning frameworks.",
    faculties: [],
    notes: [],
  },
  {
    id: "def-aids304",
    code: "AIDS304",
    name: "Big Data Analytics & Cloud Technologies",
    semester: 6,
    description: "Distributed computing, Hadoop, Spark ecosystem, cloud infrastructure, and pipeline architecture.",
    faculties: [],
    notes: [],
  },
  {
    id: "def-aids401",
    code: "AIDS401",
    name: "Natural Language Processing & Computer Vision",
    semester: 7,
    description: "Text preprocessing, LLMs, transformers, image processing, segmentation, and object detection.",
    faculties: [],
    notes: [],
  },
  {
    id: "def-aids402",
    code: "AIDS402",
    name: "AI Ethics, Governance & Security",
    semester: 7,
    description: "Responsible AI practices, bias mitigation, privacy preservation, AI policy, and cybersecurity basics.",
    faculties: [],
    notes: [],
  },
  {
    id: "def-aids403",
    code: "AIDS403",
    name: "Capstone AI Project & Internship",
    semester: 8,
    description: "Applied AI capstone development, model deployment, documentation, and industry internship.",
    faculties: [],
    notes: [],
  },
];

export async function getPublicSubjects(semester?: number | null): Promise<PublicSubject[]> {
  try {
    const dbSubjects = await db.subject.findMany({
      where: semester ? { semester } : {},
      include: {
        faculties: {
          include: {
            faculty: {
              select: {
                fullName: true,
                designation: true,
              },
            },
          },
        },
        notes: {
          select: {
            id: true,
          },
        },
      },
      orderBy: [{ semester: "asc" }, { code: "asc" }],
    });

    if (dbSubjects && dbSubjects.length > 0) {
      return dbSubjects as PublicSubject[];
    }
  } catch (error) {
    console.error("Failed to query subjects from database, falling back to default catalog:", error);
  }

  // Fallback to default curriculum subjects if DB is uninitialized or unreachable
  if (semester) {
    return DEFAULT_SUBJECTS.filter((s) => s.semester === semester);
  }
  return DEFAULT_SUBJECTS;
}
