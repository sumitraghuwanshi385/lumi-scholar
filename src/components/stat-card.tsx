import { type ReactNode } from "react";
import { motion } from "framer-motion";

export function StatCard({
  label, value, suffix, icon, gradient, delay = 0,
}: {
  label: string; value: string | number; suffix?: string; icon: ReactNode;
  gradient: "violet" | "electric" | "coral" | "emerald" | "gold";
  delay?: number;
}) {
  const gradMap = {
    violet: "gradient-violet glow-violet",
    electric: "gradient-electric glow-electric",
    coral: "gradient-coral glow-coral",
    emerald: "gradient-emerald glow-emerald",
    gold: "gradient-gold",
  } as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.2, 0.8, 0.2, 1] }}
      className="glass-glow rounded-2xl p-5 hover-lift"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`h-11 w-11 rounded-xl ${gradMap[gradient]} flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
      <div className="font-display text-3xl font-bold tracking-tight">
        {value}
        {suffix && <span className="text-base text-muted-foreground font-medium ml-1">{suffix}</span>}
      </div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </motion.div>
  );
}
