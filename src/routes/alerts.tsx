import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Bell, AlertTriangle, Info, AlertCircle, CheckCircle2 } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { STUDENTS, avatarUrl } from "@/data/students";

export const Route = createFileRoute("/alerts")({
  component: Alerts,
  head: () => ({
    meta: [
      { title: "Alerts — AurorIQ" },
      { name: "description", content: "Real-time alerts for grade drops, attendance dips and missing assignments." },
    ],
  }),
});

type Severity = "Critical" | "Warning" | "Info";

const ALERTS: { id: number; studentIdx: number; type: string; message: string; severity: Severity; time: string }[] = [
  { id: 1, studentIdx: 14, type: "Grade drop", message: "Math score fell from 78 → 54 in the last test", severity: "Critical", time: "12m ago" },
  { id: 2, studentIdx: 5, type: "Attendance", message: "Attendance below 75% for 2 weeks", severity: "Warning", time: "1h ago" },
  { id: 3, studentIdx: 9, type: "Assignments", message: "3 missing submissions in Computer Science", severity: "Warning", time: "3h ago" },
  { id: 4, studentIdx: 2, type: "Behavior", message: "Sudden drop in classroom participation", severity: "Info", time: "Yesterday" },
  { id: 5, studentIdx: 18, type: "Grade drop", message: "English consistently below class average", severity: "Critical", time: "Yesterday" },
  { id: 6, studentIdx: 11, type: "Attendance", message: "Late on 4 consecutive Mondays", severity: "Info", time: "2d ago" },
];

const sevStyles: Record<Severity, { bar: string; chip: string; icon: React.ComponentType<{ className?: string }> }> = {
  Critical: { bar: "gradient-coral", chip: "bg-coral/15 text-coral", icon: AlertTriangle },
  Warning: { bar: "gradient-gold", chip: "bg-gold/20 text-gold", icon: AlertCircle },
  Info: { bar: "gradient-electric", chip: "bg-electric/15 text-electric", icon: Info },
};

function Alerts() {
  return (
    <AppLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl flex items-center gap-3">
            <span className="relative">
              <Bell className="h-8 w-8 text-coral" />
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full gradient-coral animate-pulse-ring" />
            </span>
            <span>Alerts <span className="text-gradient">Center</span></span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{ALERTS.length} active signals across your students</p>
        </div>
        <button className="hidden sm:inline-flex items-center gap-2 rounded-xl glass px-4 py-2.5 text-sm font-semibold hover-lift">
          <CheckCircle2 className="h-4 w-4 text-emerald" /> Mark all read
        </button>
      </div>

      <div className="space-y-3">
        {ALERTS.map((a, i) => {
          const s = STUDENTS[a.studentIdx % STUDENTS.length];
          const style = sevStyles[a.severity];
          const Icon = style.icon;
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className="glass-glow rounded-2xl overflow-hidden flex hover-lift"
            >
              <div className={`w-1.5 ${style.bar}`} />
              <div className="flex-1 flex items-center gap-3 p-4">
                <img src={avatarUrl(s.name)} alt={s.name} className="h-11 w-11 rounded-xl bg-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{s.name}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${style.chip} inline-flex items-center gap-1`}>
                      <Icon className="h-3 w-3" /> {a.severity}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{a.type}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{a.message}</p>
                </div>
                <span className="text-[11px] text-muted-foreground hidden sm:block">{a.time}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </AppLayout>
  );
}
