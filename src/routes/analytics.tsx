import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Trophy, TrendingDown, Download } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { STUDENTS, avatarUrl } from "@/data/students";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, Legend,
} from "recharts";

export const Route = createFileRoute("/analytics")({
  component: Analytics,
  head: () => ({
    meta: [
      { title: "Analytics — AurorIQ" },
      { name: "description", content: "Class distribution, subject difficulty and improvement trends across the school." },
    ],
  }),
});

function Analytics() {
  // Distribution buckets
  const buckets = [
    { range: "0-40", count: 0 }, { range: "40-55", count: 0 }, { range: "55-70", count: 0 },
    { range: "70-85", count: 0 }, { range: "85-100", count: 0 },
  ];
  STUDENTS.forEach((s) => {
    const avg = s.scores.reduce((a, b) => a + b.score, 0) / s.scores.length;
    if (avg < 40) buckets[0].count++;
    else if (avg < 55) buckets[1].count++;
    else if (avg < 70) buckets[2].count++;
    else if (avg < 85) buckets[3].count++;
    else buckets[4].count++;
  });

  const subjects = ["Math", "Science", "English", "History", "Computer Science"].map((subject) => {
    const all = STUDENTS.flatMap((s) => s.scores.filter((sc) => sc.subject === subject).map((sc) => sc.score));
    return { subject, avg: Math.round(all.reduce((a, b) => a + b, 0) / all.length) };
  });

  const trend = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"].map((m, i) => {
    const monthScores = STUDENTS.map((s) => s.trend[i].score);
    return {
      m,
      avg: Math.round(monthScores.reduce((a, b) => a + b, 0) / monthScores.length),
      top: Math.max(...monthScores),
      bottom: Math.min(...monthScores),
    };
  });

  const top10 = [...STUDENTS].sort((a, b) => b.gpa - a.gpa).slice(0, 10);
  const bottom = [...STUDENTS].sort((a, b) => a.gpa - b.gpa).slice(0, 5);

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl">
            <span className="text-gradient">Analytics</span> & Reports
          </h1>
          <p className="text-muted-foreground text-sm mt-1">School-wide performance signals</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl gradient-violet glow-violet px-4 py-2.5 text-sm font-semibold text-white hover-lift">
          <Download className="h-4 w-4" /> Export PDF
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          className="glass-glow rounded-3xl p-6 lg:col-span-2">
          <h3 className="font-display font-bold text-lg mb-1">Performance distribution</h3>
          <p className="text-xs text-muted-foreground mb-3">Number of students per score band</p>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={buckets} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="bar1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--violet)" />
                    <stop offset="100%" stopColor="var(--electric)" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="range" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="count" fill="url(#bar1)" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-glow rounded-3xl p-6">
          <h3 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-gold" /> Top 10
          </h3>
          <ul className="space-y-2">
            {top10.map((s, i) => (
              <li key={s.id} className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-accent/40 transition-colors">
                <span className={`h-6 w-6 rounded-full text-[10px] font-bold flex items-center justify-center text-white ${
                  i === 0 ? "gradient-gold" : i === 1 ? "gradient-electric" : i === 2 ? "gradient-coral" : "bg-muted text-foreground"
                }`}>{i + 1}</span>
                <img src={avatarUrl(s.name)} alt="" className="h-7 w-7 rounded-full bg-muted" />
                <span className="text-xs font-semibold flex-1 truncate">{s.name}</span>
                <span className="text-xs font-display font-bold">{s.gpa}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass-glow rounded-3xl p-6 lg:col-span-2">
          <h3 className="font-display font-bold text-lg mb-1">Improvement trends</h3>
          <p className="text-xs text-muted-foreground mb-3">Average · Top · Bottom (6 months)</p>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={trend} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} domain={[40, 100]} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="avg" stroke="var(--violet)" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="top" stroke="var(--gold)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="bottom" stroke="var(--coral)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-glow rounded-3xl p-6">
          <h3 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-coral" /> Needs attention
          </h3>
          <ul className="space-y-2">
            {bottom.map((s) => (
              <li key={s.id} className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-accent/40 transition-colors">
                <img src={avatarUrl(s.name)} alt="" className="h-8 w-8 rounded-full bg-muted" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate">{s.name}</div>
                  <div className="text-[10px] text-muted-foreground">GPA {s.gpa} · {s.attendance}% attend.</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full gradient-coral text-white">{s.performance}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="glass-glow rounded-3xl p-6 lg:col-span-3">
          <h3 className="font-display font-bold text-lg mb-1">Subject averages</h3>
          <p className="text-xs text-muted-foreground mb-3">School-wide mean per subject</p>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={subjects} layout="vertical" margin={{ top: 10, right: 30, bottom: 0, left: 60 }}>
                <defs>
                  <linearGradient id="barH" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="var(--coral)" />
                    <stop offset="100%" stopColor="var(--gold)" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 6" horizontal={false} />
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                <YAxis dataKey="subject" type="category" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} width={110} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="avg" fill="url(#barH)" radius={[0, 12, 12, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
