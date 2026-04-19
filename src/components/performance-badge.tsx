import type { Performance } from "@/data/students";
import { performanceGradient } from "@/data/students";
import { Award, AlertTriangle, TrendingUp, Zap } from "lucide-react";

const ICONS: Record<Performance, React.ComponentType<{ className?: string }>> = {
  Excellent: Award,
  Good: TrendingUp,
  "At Risk": Zap,
  Critical: AlertTriangle,
};

export function PerformanceBadge({ performance, className = "" }: { performance: Performance; className?: string }) {
  const Icon = ICONS[performance];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-white ${performanceGradient(performance)} ${className}`}
    >
      <Icon className="h-3 w-3" />
      {performance}
    </span>
  );
}
