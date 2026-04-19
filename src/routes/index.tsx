import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, GraduationCap, Brain, TrendingUp, Bell, ShieldCheck, ArrowRight, Users } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "AurorIQ — Unlock Every Student's Potential with AI" },
      { name: "description", content: "AI-powered student performance, predictions, attendance heatmaps and personalized learning paths for modern schools." },
      { property: "og:title", content: "AurorIQ — AI Student Analytics" },
      { property: "og:description", content: "Predict performance. Spot risks early. Personalize learning. All powered by AI." },
    ],
  }),
});

function Landing() {
  return (
    <div className="relative min-h-screen mesh-bg overflow-hidden">
      <div className="aurora-3 absolute inset-0 -z-10"><span /><span /><span /><span /></div>

      {/* Floating shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-[10%] h-24 w-24 rounded-3xl gradient-coral opacity-40 blur-xl animate-float" />
        <div className="absolute top-40 right-[15%] h-32 w-32 rounded-full gradient-electric opacity-40 blur-xl animate-float" style={{ animationDelay: "-3s" }} />
        <div className="absolute bottom-32 left-[20%] h-20 w-20 rounded-full gradient-emerald opacity-40 blur-xl animate-float" style={{ animationDelay: "-6s" }} />
        <div className="absolute top-[60%] right-[8%] h-28 w-28 rounded-2xl gradient-gold opacity-35 blur-xl animate-float" style={{ animationDelay: "-1.5s" }} />
      </div>

      {/* Nav */}
      <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl gradient-aurora glow-violet flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl">AurorIQ</span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            to="/dashboard"
            className="hidden sm:inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-semibold hover-lift"
          >
            Sign in
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-semibold mb-8"
        >
          <Sparkles className="h-3.5 w-3.5 text-coral" />
          Now powered by next-gen AI predictions
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.05]"
        >
          Unlock every student's <br className="hidden sm:block" />
          <span className="text-gradient">potential with AI</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground font-sans"
        >
          Predict performance, surface at-risk students early, and deliver personalized learning roadmaps —
          all from one breathtakingly beautiful dashboard.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            to="/dashboard"
            className="group inline-flex items-center gap-2 rounded-full gradient-aurora glow-violet px-7 py-3.5 text-sm font-semibold text-white hover-lift"
          >
            <Users className="h-4 w-4" /> Teacher Dashboard
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/students"
            className="inline-flex items-center gap-2 rounded-full glass px-7 py-3.5 text-sm font-semibold hover-lift"
          >
            <GraduationCap className="h-4 w-4 text-violet" /> Explore as Student
          </Link>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.55 }}
          className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto"
        >
          {[
            { v: "24+", l: "Schools" },
            { v: "12K", l: "Students tracked" },
            { v: "94%", l: "Risk-detection accuracy" },
            { v: "+18%", l: "Avg. score lift" },
          ].map((s) => (
            <div key={s.l} className="glass rounded-2xl p-4">
              <div className="font-display font-bold text-2xl text-gradient">{s.v}</div>
              <div className="text-[11px] text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-28">
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: Brain, title: "AI Predictions", desc: "Forecast finals scores with confidence intervals using performance + engagement signals.", grad: "gradient-violet glow-violet" },
            { icon: TrendingUp, title: "Trend Detection", desc: "Beautiful charts surface subject-wise momentum and sudden drops instantly.", grad: "gradient-electric glow-electric" },
            { icon: Bell, title: "Smart Alerts", desc: "Severity-tagged notifications when attendance or grades fall outside the safe zone.", grad: "gradient-coral glow-coral" },
            { icon: Sparkles, title: "Personalized Roadmaps", desc: "AI generates step-by-step study plans tailored to each student's gaps and habits.", grad: "gradient-emerald glow-emerald" },
            { icon: ShieldCheck, title: "Privacy-first", desc: "Role-based access, audit logs and FERPA-aligned data handling out of the box.", grad: "gradient-gold" },
            { icon: GraduationCap, title: "Student Self-Portal", desc: "Students see their wins, set goals, and earn animated achievement badges.", grad: "gradient-violet glow-violet" },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="glass-glow rounded-3xl p-6 hover-lift"
            >
              <div className={`h-12 w-12 rounded-2xl ${f.grad} flex items-center justify-center text-white mb-4`}>
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display font-bold text-lg">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-1.5">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-border/50 py-8 text-center text-xs text-muted-foreground">
        Crafted with care · AurorIQ © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
