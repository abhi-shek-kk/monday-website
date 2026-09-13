import { PrismaClient, Role, AccountStatus, WingType } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  // 1. Initial Admin Provisioning Check
  const adminUsername = process.env.ADMIN_INITIAL_USERNAME || "adminaids";
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD;

  if (!adminPassword || adminPassword.trim() === "") {
    throw new Error(
      "CRITICAL: ADMIN_INITIAL_PASSWORD environment variable is missing or empty. " +
        "Please set ADMIN_INITIAL_PASSWORD in your .env environment file before seeding."
    );
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const adminUser = await prisma.user.upsert({
    where: { username: adminUsername },
    update: {
      passwordHash,
      role: Role.ADMIN,
      status: AccountStatus.APPROVED,
    },
    create: {
      username: adminUsername,
      passwordHash,
      role: Role.ADMIN,
      status: AccountStatus.APPROVED,
      email: "admin.aids@sbcollege.ac.in",
    },
  });

  console.log(`[Seed Success] Initial Admin User verified: ${adminUser.username} (${adminUser.role})`);

  // 2. Structural Co-curricular Wings
  const wingsData = [
    {
      type: WingType.NSS,
      name: "National Service Scheme (NSS)",
      description: "Department NSS Wing dedicated to community service and social outreach.",
    },
    {
      type: WingType.SPORTS_WING,
      name: "Sports Wing",
      description: "Department Sports & Athletics Wing promoting physical fitness and sportsmanship.",
    },
    {
      type: WingType.TECH_TEAM,
      name: "Tech Team",
      description: "Technical & Development Wing responsible for coding, hackathons, and web projects.",
    },
    {
      type: WingType.NCC,
      name: "National Cadet Corps (NCC)",
      description: "Department NCC Wing fostering discipline, leadership, and national service.",
    },
  ];

  for (const wing of wingsData) {
    await prisma.wing.upsert({
      where: { type: wing.type },
      update: {
        name: wing.name,
        description: wing.description,
      },
      create: {
        type: wing.type,
        name: wing.name,
        description: wing.description,
      },
    });
  }
  console.log(`[Seed Success] Structural Co-curricular Wings seeded (${wingsData.length} wings).`);

  // 3. Structural Academic Reference Subjects/Courses (S1 to S8)
  const initialSubjects = [
    { code: "AIDS101", name: "Introduction to Artificial Intelligence & Data Science", semester: 1, description: "Foundational concepts of AI, Data Science, linear algebra, and problem-solving methodologies." },
    { code: "AIDS102", name: "Programming in C & Problem Solving", semester: 1, description: "Fundamentals of procedural programming, control structures, arrays, pointers, and memory management." },
    { code: "AIDS103", name: "Python Programming for Data Analytics", semester: 2, description: "Core Python syntax, data manipulation with NumPy and Pandas, and visualization libraries." },
    { code: "AIDS104", name: "Discrete Mathematics & Probability", semester: 2, description: "Mathematical logic, set theory, combinatorics, discrete probability distributions, and random variables." },
    { code: "AIDS201", name: "Data Structures & Algorithm Analysis", semester: 3, description: "Linear and non-linear data structures, searching, sorting, and asymptotic time-space analysis." },
    { code: "AIDS202", name: "Object-Oriented Programming with Java", semester: 3, description: "OOP principles, encapsulation, inheritance, polymorphism, and exception handling in Java." },
    { code: "AIDS203", name: "Database Management Systems & SQL", semester: 4, description: "Relational database design, ER modeling, normalization, complex SQL queries, and transaction management." },
    { code: "AIDS204", name: "Statistical Methods for Data Science", semester: 4, description: "Inferential statistics, hypothesis testing, ANOVA, regression analysis, and confidence intervals." },
    { code: "AIDS301", name: "Machine Learning Fundamentals", semester: 5, description: "Supervised and unsupervised learning, regression, decision trees, SVMs, clustering, and model evaluation." },
    { code: "AIDS302", name: "Web Application Development", semester: 5, description: "Modern web stack, RESTful APIs, frontend frameworks, backend integration, and web deployment." },
    { code: "AIDS303", name: "Deep Learning & Neural Networks", semester: 6, description: "Artificial neural networks, backpropagation, CNNs for vision, RNNs, and deep learning frameworks." },
    { code: "AIDS304", name: "Big Data Analytics & Cloud Technologies", semester: 6, description: "Distributed computing, Hadoop, Spark ecosystem, cloud infrastructure, and pipeline architecture." },
    { code: "AIDS401", name: "Natural Language Processing & Computer Vision", semester: 7, description: "Text preprocessing, LLMs, transformers, image processing, segmentation, and object detection." },
    { code: "AIDS402", name: "AI Ethics, Governance & Security", semester: 7, description: "Responsible AI practices, bias mitigation, privacy preservation, AI policy, and cybersecurity basics." },
    { code: "AIDS403", name: "Capstone AI Project & Internship", semester: 8, description: "Applied AI capstone development, model deployment, documentation, and industry internship." },
  ];

  for (const sub of initialSubjects) {
    await prisma.subject.upsert({
      where: { code: sub.code },
      update: {
        name: sub.name,
        semester: sub.semester,
        description: sub.description,
      },
      create: sub,
    });
  }
  console.log(`[Seed Success] Structural Academic Subjects seeded (${initialSubjects.length} subjects).`);

  console.log("Database seed completed cleanly.");
}

main()
  .catch((e) => {
    console.error("Seed Execution Failed:", e.message || e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
