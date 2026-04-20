import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { AuthGuard } from "@/components/auth-guard";
import { Target } from "lucide-react";

export const Route = createFileRoute("/portal/plan")({
  component: () => (
    <AuthGuard allow={["student"]}>
      <AppLayout>
        <h1 className="font-display font-extrabold text-3xl mb-2">Study <span className="text-gradient">Plan</span></h1>
        <p className="text-sm text-muted-foreground mb-6">Generate your weekly plan from the main portal page.</p>
        <div className="glass-glow rounded-3xl p-12 text-center">
          <Target className="h-12 w-12 mx-auto text-violet mb-3" />
          <p className="text-sm">Head back to the dashboard and click "Generate plan" for your personalized AI weekly schedule.</p>
        </div>
      </AppLayout>
    </AuthGuard>
  ),
});
