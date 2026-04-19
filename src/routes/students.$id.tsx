import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Phone, Sparkles, Calendar, Award } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { PerformanceBadge } from "@/components/performance-badge";
import { STUDENTS, avatarUrl, performanceGradient } from "@/data/students";
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, PolarRadiusAxis,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/students/$id")({
  loader: ({ params }) => {
    const student = STUDENTS.find((s) => s.id === params.id);
    if (!student) throw notFound();
    return { student };
  },
  component: StudentDetail,
  notFoundComponent: () => (
    <AppLayout>
      <div className="glass-glow rounded-3xl p-12 text-center">
        <h2 className="font-display font-bold text-2xl">Student not found</h2>
        <Link to="/students" className="inline-flex mt-4 items-center gap-2 text-violet font-semibold">
          <ArrowLeft className="h-4 w-4" /> Back to roster
        </Link>
      </div>
    </AppLayout>
  ),
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.student.name ?? "Student"} — AurorIQ` },
      { name: "description", content: `Performance, attendance and AI insights for ${loaderData?.student.name ?? "this student"}.` },
    ],
  }),
});

function StudentDetail() {
  const { student } = Route.useLoaderData();

  // Build attendance heatmap (12 weeks × 7 days)
  const heatmap: { date: string; status: string }[][] = [];
  const log = student.attendanceLog;
  for (let w = 0; w < 12; w++) heatmap.push(log.slice(w * 7, w * 7 + 7));

  return (
    <AppLayout>
      <Link to="/students" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to roster
      </Link>

      {/* Header banner */}
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="relative rounded-3xl overflow-hidden mb-6"
      >
        <div className={`h-40 sm:h-48 ${performanceGradient(student.performance)} relative`}>
          <div className="absolute inset-0 opacity-40 mix-blend-overlay"
            style={{ background: "radial-gradient(circle at 20% 30%, white, transparent 50%), radial-gradient(circle at 80% 70%, white, transparent 50%)" }} />
        </div>
        <div className="glass border-t-0 rounded-b-3xl px-5 sm:px-8 pb-6 pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-14 sm:-mt-16">
            <div className="flex items-end gap-4">
              <img
                src={avatarUrl(student.name)}
                alt={student.name}
                className="h-28 w-28 sm:h-32 sm:w-32 rounded-3xl bg-card ring-4 ring-card object-cover"
              />
              <div className="pb-2">
                <PerformanceBadge performance={student.performance} className="mb-2" />
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl leading-tight">{student.name}</h1>
                <div className="text-sm text-muted-foreground">{student.id} · Grade {student.grade}-{student.section}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:pb-2">
              <button className="inline-flex items-center gap-2 rounded-xl gradient-violet glow-violet text-white px-4 py-2 text-sm font-semibold hover-lift">
                <Sparkles className="h-4 w-4" /> AI Insights
              </button>
              <button className="inline-flex items-center gap-2 rounded-xl glass px-4 py-2 text-sm font-semibold hover-lift">
                <Mail className="h-4 w-4" /> Contact Parent
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Quick stats */}
        <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { l: "GPA", v: student.gpa },
            { l: "Attendance", v: `${student.attendance}%` },
            { l: "Avg score", v: Math.round(student.scores.reduce((a, b) => a + b.score, 0) / student.scores.length) },
            { l: "Achievements", v: student.achievements.length },
          ].map((s) => (
            <div key={s.l} className="glass rounded-2xl p-4">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.l}</div>
              <div className="font-display font-bold text-2xl mt-1 text-gradient">{s.v}</div>
            </div>
          ))}
        </div>

        {/* Radar */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-glow rounded-3xl p-6"
        >
          <h3 className="font-display font-bold text-lg mb-1">Subject mastery</h3>
          <p className="text-xs text-muted-foreground mb-3">Multi-subject performance map</p>
          <div className="h-72">
            <ResponsiveContainer>
              <RadarChart data={student.scores} outerRadius="75%">
                <defs>
                  <linearGradient id={`r-${student.id}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="var(--violet)" />
                    <stop offset="100%" stopColor="var(--electric)" />
                  </linearGradient>
                </defs>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar dataKey="score" stroke="var(--violet)" strokeWidth={2} fill={`url(#r-${student.id})`} fillOpacity={0.55} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Trend */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
          className="glass-glow rounded-3xl p-6 lg:col-span-2"
        >
          <h3 className="font-display font-bold text-lg mb-1">Grade trend</h3>
          <p className="text-xs text-muted-foreground mb-3">Last 6 months</p>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={student.trend} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id={`gt-${student.id}`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--coral)" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="var(--coral)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} domain={[40, 100]} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="score" stroke="var(--coral)" strokeWidth={2.5} fill={`url(#gt-${student.id})`} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Subjects breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-glow rounded-3xl p-6"
        >
          <h3 className="font-display font-bold text-lg mb-3">Subjects</h3>
          <div className="space-y-3">
            {student.scores.map((s, i) => (
              <div key={s.subject}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium">{s.subject}</span>
                  <span className="font-display font-bold">{s.score}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${s.score}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + i * 0.07 }}
                    className={`h-full ${
                      s.score >= 85 ? "gradient-emerald" : s.score >= 70 ? "gradient-electric" : s.score >= 55 ? "gradient-gold" : "gradient-coral"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Engagement */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}
          className="glass-glow rounded-3xl p-6"
        >
          <h3 className="font-display font-bold text-lg mb-3">Engagement</h3>
          <div className="space-y-4">
            {[
              { l: "Participation", v: student.engagement.participation, g: "gradient-violet" },
              { l: "Homework submission", v: student.engagement.homework, g: "gradient-electric" },
              { l: "Extra activities", v: student.engagement.activities, g: "gradient-emerald" },
            ].map((m) => (
              <div key={m.l}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium">{m.l}</span>
                  <span className="font-display font-bold">{m.v}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full ${m.g}`} style={{ width: `${m.v}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-border/50">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2 inline-flex items-center gap-1.5">
              <Award className="h-3 w-3" /> Achievements
            </div>
            <div className="flex flex-wrap gap-1.5">
              {student.achievements.length > 0 ? student.achievements.map((a) => (
                <span key={a} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold gradient-gold text-white">
                  {a}
                </span>
              )) : <span className="text-xs text-muted-foreground">No badges yet — keep going!</span>}
            </div>
          </div>
        </motion.div>

        {/* Attendance heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          className="glass-glow rounded-3xl p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-display font-bold text-lg">Attendance heatmap</h3>
              <p className="text-xs text-muted-foreground">Last 12 weeks</p>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-[11px]">
              <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-emerald" /> Present</span>
              <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-gold" /> Late</span>
              <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-coral" /> Absent</span>
            </div>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-2">
            {heatmap.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((d) => (
                  <div
                    key={d.date}
                    title={`${d.date} · ${d.status}`}
                    className={`h-4 w-4 rounded-sm ${
                      d.status === "present" ? "bg-emerald" : d.status === "late" ? "bg-gold" : "bg-coral"
                    } opacity-90 hover:opacity-100 hover:scale-125 transition-all`}
                  />
                ))}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Notes + parent */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}
          className="glass-glow rounded-3xl p-6 lg:col-span-2"
        >
          <h3 className="font-display font-bold text-lg mb-2">Teacher notes</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{student.notes}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
          className="glass-glow rounded-3xl p-6"
        >
          <h3 className="font-display font-bold text-lg mb-3">Parent contact</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-violet" /> {student.parentContact}</div>
            <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-electric" /> parent.{student.id.toLowerCase()}@school.edu</div>
            <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" /> Enrolled {student.enrolledDate}</div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
