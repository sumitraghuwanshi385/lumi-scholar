import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Brain, AlertTriangle, TrendingUp, Lightbulb, CheckCircle2 } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { STUDENTS, avatarUrl } from "@/data/students";

export const Route = createFileRoute("/insights")({
  component: Insights,
  head: () => ({
    meta: [
      { title: "AI Insights — AurorIQ" },
      { name: "description", content: "AI predictions, risk detection and personalized recommendations for every student." },
    ],
  }),
});

function Insights() {
  const atRisk = STUDENTS.filter((s) => s.performance === "At Risk" || s.performance === "Critical").slice(0, 4);
  const sample = STUDENTS[0];
  const recommendations = [
    { tag: "Study Habits", text: `Practice algebra word problems daily for 20 minutes`, gradient: "gradient-violet" },
    { tag: "Resources", text: `Watch Khan Academy videos on photosynthesis — biology score dropped 12%`, gradient: "gradient-electric" },
    { tag: "Counseling", text: `Attendance on Mondays is 35% lower — schedule a brief check-in`, gradient: "gradient-coral" },
    { tag: "Parental", text: `Share weekly progress digest with parent — engagement up 18% historically`, gradient: "gradient-emerald" },
  ];

  return (
    <AppLayout>
      <div className="mb-6 flex items-center gap-4">
        <div className="relative">
          <div className="h-14 w-14 rounded-2xl gradient-aurora glow-violet flex items-center justify-center">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <span className="absolute inset-0 rounded-2xl gradient-aurora animate-pulse-ring" />
        </div>
        <div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl">
            <span className="text-gradient">AI Insights</span>
          </h1>
          <p className="text-muted-foreground text-sm">Predictions, risk signals and personalized roadmaps</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Prediction */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="glass-glow rounded-3xl p-6 lg:col-span-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-violet mb-2">
            <TrendingUp className="h-3.5 w-3.5" /> PERFORMANCE PREDICTION
          </div>
          <p className="text-lg sm:text-xl">
            Based on current trends, <span className="font-bold">{sample.name}</span> is predicted to score{" "}
            <span className="text-gradient font-display font-extrabold text-3xl">
              {Math.min(98, Math.round(sample.gpa * 22 + 8))}
            </span>{" "}
            in the spring finals.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald animate-pulse" />
            87% confidence · model v2.4
          </div>
        </motion.div>

        {/* Risk count */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-glow rounded-3xl p-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-coral mb-2">
            <AlertTriangle className="h-3.5 w-3.5" /> RISK DETECTION
          </div>
          <div className="font-display font-extrabold text-4xl text-gradient">{atRisk.length}</div>
          <p className="text-sm text-muted-foreground mt-1">students at risk this semester</p>
          <div className="mt-4 flex -space-x-2">
            {atRisk.map((s) => (
              <img key={s.id} src={avatarUrl(s.name)} alt={s.name} className="h-9 w-9 rounded-full ring-2 ring-card bg-muted" />
            ))}
          </div>
        </motion.div>

        {/* Recommendations */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass-glow rounded-3xl p-6 lg:col-span-3">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-4 w-4 text-gold" />
            <h3 className="font-display font-bold text-lg">Personalized recommendations for {sample.name}</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {recommendations.map((r, i) => (
              <motion.div
                key={r.text}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.05 }}
                className="flex items-start gap-3 p-4 rounded-2xl bg-accent/30 hover:bg-accent/60 transition-colors group"
              >
                <span className={`h-9 w-9 rounded-xl ${r.gradient} flex items-center justify-center text-white shrink-0`}>
                  <Lightbulb className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{r.tag}</span>
                  <p className="text-sm mt-0.5">{r.text}</p>
                </div>
                <button aria-label="Mark done"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald">
                  <CheckCircle2 className="h-5 w-5" />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
