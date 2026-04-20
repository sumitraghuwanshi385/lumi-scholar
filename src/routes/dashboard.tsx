import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Activity, AlertTriangle, Trophy, Plus, BellRing, ChevronRight, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { AuthGuard } from "@/components/auth-guard";
import { StatCard } from "@/components/stat-card";
import { useStudents, performanceFromGpa, performanceGradient, avatarUrl } from "@/lib/students-db";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [{ title: "Dashboard — AurorIQ" }],
  }),
});

function DashboardPage() {
  return (
    <AuthGuard allow={["teacher"]}>
      <Dashboard />
    </AuthGuard>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const { students, loading, refresh } = useStudents();

  const total = students.length;
  const avgGpa = total ? students.reduce((a, s) => a + Number(s.gpa), 0) / total : 0;
  const avgScore = Math.round(avgGpa * 20 + 20);
  const atRisk = students.filter((s) => {
    const p = performanceFromGpa(Number(s.gpa), Number(s.attendance_pct));
    return p === "At Risk" || p === "Critical";
  }).length;
  const top = students.filter((s) => performanceFromGpa(Number(s.gpa), Number(s.attendance_pct)) === "Excellent").length;
  const avgAtt = total ? Math.round(students.reduce((a, s) => a + Number(s.attendance_pct), 0) / total) : 0;
  const passRate = total ? Math.round((students.filter((s) => performanceFromGpa(Number(s.gpa), Number(s.attendance_pct)) !== "Critical").length / total) * 100) : 0;
  const topStudents = [...students].sort((a, b) => Number(b.gpa) - Number(a.gpa)).slice(0, 5);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", grade: "10", section: "A", parent_contact: "", gpa: "3.0", attendance_pct: "90" });
  const [submitting, setSubmitting] = useState(false);

  const addStudent = async () => {
    if (!user) return;
    if (!form.name.trim()) { toast.error("Name required"); return; }
    setSubmitting(true);
    const { error } = await supabase.from("students").insert({
      teacher_id: user.id,
      name: form.name.trim(),
      grade: form.grade,
      section: form.section,
      gpa: Number(form.gpa),
      attendance_pct: Number(form.attendance_pct),
      parent_contact: form.parent_contact || null,
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Student added");
    setOpen(false);
    setForm({ name: "", grade: "10", section: "A", parent_contact: "", gpa: "3.0", attendance_pct: "90" });
    refresh();
  };

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Teacher · Spring Semester</div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl">
            Welcome <span className="text-gradient">back</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Live insights from your classroom data.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="inline-flex items-center gap-2 rounded-xl gradient-violet glow-violet px-4 py-2.5 text-sm font-semibold text-white hover-lift">
                <Plus className="h-4 w-4" /> Add Student
              </button>
            </DialogTrigger>
            <DialogContent className="glass-glow border-border">
              <DialogHeader><DialogTitle className="font-display">Add a new student</DialogTitle></DialogHeader>
              <div className="space-y-3 mt-2">
                <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Grade</Label><Input value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} /></div>
                  <div><Label>Section</Label><Input value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>GPA (0-4)</Label><Input type="number" step="0.01" value={form.gpa} onChange={(e) => setForm({ ...form, gpa: e.target.value })} /></div>
                  <div><Label>Attendance %</Label><Input type="number" value={form.attendance_pct} onChange={(e) => setForm({ ...form, attendance_pct: e.target.value })} /></div>
                </div>
                <div><Label>Parent contact</Label><Input value={form.parent_contact} onChange={(e) => setForm({ ...form, parent_contact: e.target.value })} placeholder="+1 (555) 123-4567" /></div>
              </div>
              <DialogFooter className="mt-4">
                <button onClick={addStudent} disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-xl gradient-aurora glow-violet px-5 py-2.5 text-sm font-semibold text-white hover-lift disabled:opacity-60">
                  {submitting ? "Saving…" : "Save student"}
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Link to="/alerts" className="inline-flex items-center gap-2 rounded-xl glass px-4 py-2.5 text-sm font-semibold hover-lift">
            <BellRing className="h-4 w-4 text-coral" /> Alerts
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Students" value={total} icon={<Users className="h-5 w-5" />} gradient="violet" delay={0} />
        <StatCard label="Avg Score" value={avgScore} suffix="/100" icon={<Activity className="h-5 w-5" />} gradient="electric" delay={0.05} />
        <StatCard label="At Risk" value={atRisk} icon={<AlertTriangle className="h-5 w-5" />} gradient="coral" delay={0.1} />
        <StatCard label="Top Performers" value={top} icon={<Trophy className="h-5 w-5" />} gradient="gold" delay={0.15} />
      </div>

      {loading ? (
        <div className="glass-glow rounded-3xl p-16 flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-violet" />
          <div className="text-sm text-muted-foreground">Loading your students…</div>
        </div>
      ) : total === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-glow rounded-3xl p-16 text-center">
          <div className="mx-auto h-24 w-24 rounded-3xl gradient-aurora glow-violet flex items-center justify-center mb-5">
            <Users className="h-12 w-12 text-white" />
          </div>
          <h2 className="font-display font-bold text-2xl">Your roster is empty</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Add your first student to unlock AI predictions, attendance heatmaps, and personalized study plans.
          </p>
          <button onClick={() => setOpen(true)} className="mt-6 inline-flex items-center gap-2 rounded-xl gradient-aurora glow-violet px-5 py-2.5 text-sm font-semibold text-white hover-lift">
            <Plus className="h-4 w-4" /> Add your first student
          </button>
        </motion.div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-5">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-glow rounded-3xl p-6 lg:col-span-2">
            <h3 className="font-display font-bold text-lg mb-4">Class snapshot</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Stat label="Avg GPA" value={avgGpa.toFixed(2)} />
              <Stat label="Attendance" value={`${avgAtt}%`} />
              <Stat label="On track" value={`${passRate}%`} />
              <Stat label="At risk" value={atRisk} />
            </div>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {students.slice(0, 6).map((s) => {
                const p = performanceFromGpa(Number(s.gpa), Number(s.attendance_pct));
                return (
                  <Link key={s.id} to="/students/$id" params={{ id: s.id }} className="flex items-center gap-2 p-2 rounded-xl bg-accent/30 hover:bg-accent/60">
                    <img src={avatarUrl(s.name)} alt="" className="h-8 w-8 rounded-full bg-muted" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold truncate">{s.name}</div>
                      <div className="text-[10px] text-muted-foreground">GPA {Number(s.gpa).toFixed(2)}</div>
                    </div>
                    <span className={`h-2 w-2 rounded-full ${performanceGradient(p)}`} />
                  </Link>
                );
              })}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-glow rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg">Leaderboard</h3>
              <Trophy className="h-4 w-4 text-gold" />
            </div>
            <ul className="space-y-2.5">
              {topStudents.map((s, i) => (
                <Link key={s.id} to="/students/$id" params={{ id: s.id }} className="flex items-center gap-3 p-2 rounded-xl hover:bg-accent/40 transition-colors group">
                  <span className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white ${
                    i === 0 ? "gradient-gold" : i === 1 ? "gradient-electric" : i === 2 ? "gradient-coral" : "bg-muted text-foreground"
                  }`}>{i + 1}</span>
                  <img src={avatarUrl(s.name)} alt={s.name} className="h-9 w-9 rounded-full bg-muted" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{s.name}</div>
                    <div className="text-[11px] text-muted-foreground">GPA {Number(s.gpa).toFixed(2)} · Grade {s.grade}</div>
                  </div>
                  <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ))}
            </ul>
          </motion.div>
        </div>
      )}
    </AppLayout>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-accent/40 p-3">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-display font-bold text-lg">{value}</div>
    </div>
  );
}
