import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { PerformanceBadge } from "@/components/performance-badge";
import { STUDENTS, avatarUrl, performanceGradient, type Performance } from "@/data/students";

export const Route = createFileRoute("/students/")({
  component: StudentRoster,
  head: () => ({
    meta: [
      { title: "Students — AurorIQ" },
      { name: "description", content: "Browse, search and filter your full student roster with performance signals." },
    ],
  }),
});

const FILTERS: (Performance | "All")[] = ["All", "Excellent", "Good", "At Risk", "Critical"];

function StudentRoster() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [sort, setSort] = useState<"name" | "gpa" | "attendance">("gpa");

  const filtered = useMemo(() => {
    return STUDENTS
      .filter((s) =>
        (filter === "All" || s.performance === filter) &&
        (q === "" || s.name.toLowerCase().includes(q.toLowerCase()) || s.id.toLowerCase().includes(q.toLowerCase())),
      )
      .sort((a, b) => {
        if (sort === "name") return a.name.localeCompare(b.name);
        if (sort === "attendance") return b.attendance - a.attendance;
        return b.gpa - a.gpa;
      });
  }, [q, filter, sort]);

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl">
          Student <span className="text-gradient">Roster</span>
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {filtered.length} of {STUDENTS.length} students · live performance signals
        </p>
      </div>

      {/* Controls */}
      <div className="glass-glow rounded-2xl p-4 mb-6 flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or ID…"
            className="w-full bg-background/60 rounded-xl pl-10 pr-4 py-2.5 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-ring transition"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === f ? "gradient-violet text-white glow-violet" : "glass hover-lift"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="bg-background/60 rounded-xl px-3 py-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="gpa">Sort: GPA</option>
            <option value="attendance">Sort: Attendance</option>
            <option value="name">Sort: Name</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="glass-glow rounded-3xl p-12 text-center">
          <div className="mx-auto h-20 w-20 rounded-full gradient-aurora opacity-50 mb-4" />
          <h3 className="font-display font-bold text-xl">No students match</h3>
          <p className="text-sm text-muted-foreground mt-1">Try clearing filters or searching a different name.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.4) }}
            >
              <Link
                to="/students/$id"
                params={{ id: s.id }}
                className="block glass-glow rounded-3xl overflow-hidden hover-lift group"
              >
                <div className={`h-20 ${performanceGradient(s.performance)} relative`}>
                  <div className="absolute inset-0 opacity-30 mix-blend-overlay"
                    style={{ background: "radial-gradient(circle at 30% 50%, white, transparent 60%)" }} />
                </div>
                <div className="px-5 pb-5 -mt-10">
                  <div className="flex items-end justify-between">
                    <img
                      src={avatarUrl(s.name)}
                      alt={s.name}
                      className="h-20 w-20 rounded-2xl bg-card ring-4 ring-card object-cover"
                    />
                    <PerformanceBadge performance={s.performance} />
                  </div>
                  <div className="mt-3">
                    <div className="font-display font-bold text-base truncate">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.id} · Grade {s.grade}-{s.section}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className="rounded-xl bg-accent/40 px-3 py-2">
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">GPA</div>
                      <div className="font-display font-bold">{s.gpa}</div>
                    </div>
                    <div className="rounded-xl bg-accent/40 px-3 py-2">
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Attendance</div>
                      <div className="font-display font-bold">{s.attendance}%</div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
