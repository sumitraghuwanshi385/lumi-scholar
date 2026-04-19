export type Performance = "Excellent" | "Good" | "At Risk" | "Critical";

export interface Student {
  id: string;
  name: string;
  grade: string;
  section: string;
  gpa: number;
  attendance: number;
  performance: Performance;
  parentContact: string;
  enrolledDate: string;
  scores: { subject: string; score: number }[];
  trend: { month: string; score: number }[];
  engagement: { participation: number; homework: number; activities: number };
  attendanceLog: { date: string; status: "present" | "absent" | "late" }[];
  notes: string;
  achievements: string[];
}

const SUBJECTS = ["Math", "Science", "English", "History", "Computer Science"];
const MONTHS = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];

const NAMES = [
  "Aanya Sharma", "Liam Chen", "Sofia Rodriguez", "Noah Patel", "Emma Williams",
  "Arjun Kapoor", "Isabella Kim", "Ethan Brooks", "Maya Singh", "Lucas Müller",
  "Zara Ahmed", "Oliver Tanaka", "Priya Nair", "Mateo Silva", "Hana Yamamoto",
  "Diego Morales", "Ananya Iyer", "Jasper Cole", "Layla Hassan", "Kai Nakamura",
  "Chloe Dubois", "Rohan Mehta", "Aisha Okafor", "Theo Bennett",
];

function seedRand(seed: number) {
  let x = Math.sin(seed) * 10000;
  return () => {
    x = Math.sin(x) * 10000;
    return x - Math.floor(x);
  };
}

function getPerformance(gpa: number, attendance: number): Performance {
  const score = gpa * 20 + attendance * 0.4;
  if (score >= 110) return "Excellent";
  if (score >= 90) return "Good";
  if (score >= 70) return "At Risk";
  return "Critical";
}

export const STUDENTS: Student[] = NAMES.map((name, i) => {
  const r = seedRand(i + 7);
  const baseScore = 55 + r() * 40;
  const attendance = Math.round(60 + r() * 38);
  const gpa = +(2.2 + (baseScore / 100) * 1.8).toFixed(2);
  const grade = String(9 + Math.floor(r() * 4));
  const section = ["A", "B", "C"][Math.floor(r() * 3)];

  const scores = SUBJECTS.map((subject, j) => ({
    subject,
    score: Math.max(35, Math.min(99, Math.round(baseScore + (r() - 0.5) * 28 + j * 2))),
  }));

  const trend = MONTHS.map((month, j) => {
    const drift = (r() - 0.4) * 12;
    return {
      month,
      score: Math.max(40, Math.min(98, Math.round(baseScore - 8 + j * 2.5 + drift))),
    };
  });

  const attendanceLog = Array.from({ length: 84 }).map((_, d) => {
    const v = r();
    const date = new Date();
    date.setDate(date.getDate() - (83 - d));
    const status = v > 1 - attendance / 100 ? "present" : v > 0.05 ? "late" : "absent";
    return { date: date.toISOString().slice(0, 10), status: status as "present" | "absent" | "late" };
  });

  const performance = getPerformance(gpa, attendance);
  const achievements = [
    ...(scores.some((s) => s.score >= 90) ? ["First 90+ Score"] : []),
    ...(attendance >= 95 ? ["Perfect Week"] : []),
    ...(trend[trend.length - 1].score - trend[0].score >= 8 ? ["Comeback Kid"] : []),
    ...(performance === "Excellent" ? ["Top Performer"] : []),
  ];

  return {
    id: `STU-${String(1000 + i)}`,
    name,
    grade,
    section,
    gpa,
    attendance,
    performance,
    parentContact: `+1 (555) ${100 + i}-${1000 + i * 7}`,
    enrolledDate: `202${Math.floor(r() * 4)}-0${Math.floor(r() * 9) + 1}-15`,
    scores,
    trend,
    engagement: {
      participation: Math.round(50 + r() * 50),
      homework: Math.round(50 + r() * 50),
      activities: Math.round(30 + r() * 70),
    },
    attendanceLog,
    notes:
      performance === "Excellent"
        ? "Consistent top performer. Encourage to mentor peers and consider olympiad-level challenges."
        : performance === "Good"
          ? "Solid foundations. Push slightly harder on weakest subject for breakthrough."
          : performance === "At Risk"
            ? "Showing early warning signs. Schedule a 1:1 and tighten homework follow-up."
            : "Immediate intervention needed. Loop in parents and the school counselor this week.",
    achievements,
  };
});

export const STATS = {
  totalStudents: STUDENTS.length,
  averageScore: Math.round(
    STUDENTS.reduce((acc, s) => acc + s.scores.reduce((a, b) => a + b.score, 0) / s.scores.length, 0) / STUDENTS.length,
  ),
  atRisk: STUDENTS.filter((s) => s.performance === "At Risk" || s.performance === "Critical").length,
  topPerformers: STUDENTS.filter((s) => s.performance === "Excellent").length,
  averageAttendance: Math.round(STUDENTS.reduce((acc, s) => acc + s.attendance, 0) / STUDENTS.length),
};

export const RECENT_ACTIVITY = [
  { id: 1, who: "Aanya Sharma", action: "scored 96 in Math midterm", time: "2m ago", tone: "success" as const },
  { id: 2, who: "AI Engine", action: "flagged 3 students for attendance drop", time: "18m ago", tone: "warning" as const },
  { id: 3, who: "Liam Chen", action: "submitted Computer Science project", time: "1h ago", tone: "info" as const },
  { id: 4, who: "Sofia Rodriguez", action: "earned 'Comeback Kid' badge", time: "3h ago", tone: "success" as const },
  { id: 5, who: "Mateo Silva", action: "missed 3 consecutive History classes", time: "5h ago", tone: "danger" as const },
];

export function avatarUrl(seed: string) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundType=gradientLinear&radius=50`;
}

export function performanceGradient(p: Performance): string {
  switch (p) {
    case "Excellent": return "gradient-emerald";
    case "Good": return "gradient-electric";
    case "At Risk": return "gradient-gold";
    case "Critical": return "gradient-coral";
  }
}

export function performanceTone(p: Performance): string {
  switch (p) {
    case "Excellent": return "text-emerald";
    case "Good": return "text-electric";
    case "At Risk": return "text-gold";
    case "Critical": return "text-coral";
  }
}
