import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Users, Activity, AlertTriangle, Trophy, Plus, FileBarChart, BellRing, ChevronRight } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { StatCard } from "@/components/stat-card";
import { STATS, STUDENTS, RECENT_ACTIVITY, avatarUrl, performanceGradient } from "@/data/students";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  RadialBarChart, RadialBar, PolarAngleAxis,
} from "recharts";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Dashboard — AurorIQ" },
      { name: "description", content: "AI-powered overview of class performance, at-risk students and recent activity." },
    ],
  }),
});

const trendData = [
  { m: "Nov", avg: 71, top: 88 }, { m: "Dec", avg: 73, top: 90 },
  { m: "Jan", avg: 70, top: 89 }, { m: "Feb", avg: 75, top: 92 },
  { m: "Mar", avg: 78, top: 94 }, { m: "Apr", avg: 81, top: 96 },
];

const toneStyles = {
  success: "bg-emerald/15 text-emerald",
  warning: "bg-gold/20 text-gold",
  info: "bg-electric/15 text-electric",
  danger: "bg-coral/15 text-coral",
} as const;

function Dashboard() {
  const topStudents = [...STUDENTS].sort((a, b) => b.gpa - a.gpa).slice(0, 5);
  const passRate = Math.round((STUDENTS.filter((s) => s.performance !== "Critical").length / STUDENTS.length) * 100);

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Spring Semester · Grade 9–12</div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl">
            Good morning, <span className="text-gradient">Ms. Patel</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Here's what's happening across your classes today.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="inline-flex items-center gap-2 rounded-xl gradient-violet glow-violet px-4 py-2.5 text-sm font-semibold text-white hover-lift">
            <Plus className="h-4 w-4" /> Add Student
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl glass px-4 py-2.5 text-sm font-semibold hover-lift">
            <FileBarChart className="h-4 w-4" /> Report
          </button>
          <Link to="/alerts" className="inline-flex items-center gap-2 rounded-xl glass px-4 py-2.5 text-sm font-semibold hover-lift">
            <BellRing className="h-4 w-4 text-coral" /> Alerts
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Students" value={STATS.totalStudents} icon={<Users className="h-5 w-5" />} gradient="violet" delay={0} />
        <StatCard label="Average Score" value={STATS.averageScore} suffix="/100" icon={<Activity className="h-5 w-5" />} gradient="electric" delay={0.05} />
        <StatCard label="At Risk" value={STATS.atRisk} icon={<AlertTriangle className="h-5 w-5" />} gradient="coral" delay={0.1} />
        <StatCard label="Top Performers" value={STATS.topPerformers} icon={<Trophy className="h-5 w-5" />} gradient="gold" delay={0.15} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Trend chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-glow rounded-3xl p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-lg">Class performance trend</h3>
              <p className="text-xs text-muted-foreground">Class average vs top performers · last 6 months</p>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: "var(--violet)" }} /> Avg</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: "var(--gold)" }} /> Top</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={trendData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="gAvg" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--violet)" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="var(--violet)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gTop" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="var(--gold)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} domain={[60, 100]} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="avg" stroke="var(--violet)" strokeWidth={2.5} fill="url(#gAvg)" />
                <Area type="monotone" dataKey="top" stroke="var(--gold)" strokeWidth={2.5} fill="url(#gTop)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pass-rate radial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          className="glass-glow rounded-3xl p-6"
        >
          <h3 className="font-display font-bold text-lg">Class health</h3>
          <p className="text-xs text-muted-foreground">% of students on track</p>
          <div className="h-48 relative">
            <ResponsiveContainer>
              <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ name: "ok", value: passRate, fill: "var(--violet)" }]} startAngle={90} endAngle={-270}>
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar dataKey="value" cornerRadius={20} background={{ fill: "var(--muted)" }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="font-display text-4xl font-bold text-gradient">{passRate}%</div>
              <div className="text-[11px] text-muted-foreground mt-1">on track</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="rounded-xl bg-accent/40 p-3">
              <div className="text-xs text-muted-foreground">Attendance</div>
              <div className="font-display font-bold text-xl">{STATS.averageAttendance}%</div>
            </div>
            <div className="rounded-xl bg-accent/40 p-3">
              <div className="text-xs text-muted-foreground">Avg GPA</div>
              <div className="font-display font-bold text-xl">
                {(STUDENTS.reduce((a, b) => a + b.gpa, 0) / STUDENTS.length).toFixed(2)}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Activity feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}
          className="glass-glow rounded-3xl p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg">Recent activity</h3>
            <Link to="/alerts" className="text-xs text-violet font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all">
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="space-y-3">
            {RECENT_ACTIVITY.map((a) => (
              <li key={a.id} className="flex items-start gap-3 p-3 rounded-xl bg-accent/30 hover:bg-accent/60 transition-colors">
                <span className={`mt-0.5 h-7 w-7 rounded-full ${toneStyles[a.tone]} flex items-center justify-center text-[10px] font-bold`}>
                  {a.who.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm">
                    <span className="font-semibold">{a.who}</span>{" "}
                    <span className="text-muted-foreground">{a.action}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{a.time}</div>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Top students */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
          className="glass-glow rounded-3xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg">Leaderboard</h3>
            <Trophy className="h-4 w-4 text-gold" />
          </div>
          <ul className="space-y-2.5">
            {topStudents.map((s, i) => (
              <Link key={s.id} to="/students/$id" params={{ id: s.id }}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-accent/40 transition-colors group">
                <span className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white ${
                  i === 0 ? "gradient-gold" : i === 1 ? "gradient-electric" : i === 2 ? "gradient-coral" : "bg-muted text-foreground"
                }`}>{i + 1}</span>
                <img src={avatarUrl(s.name)} alt={s.name} className="h-9 w-9 rounded-full bg-muted" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{s.name}</div>
                  <div className="text-[11px] text-muted-foreground">GPA {s.gpa} · Grade {s.grade}</div>
                </div>
                <span className={`h-2 w-2 rounded-full ${performanceGradient(s.performance)}`} />
              </Link>
            ))}
          </ul>
        </motion.div>
      </div>
    </AppLayout>
  );
}
