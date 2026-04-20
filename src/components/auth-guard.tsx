import { useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useAuth, type AppRole } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children, allow }: { children: ReactNode; allow?: AppRole[] }) {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    if (allow && role && !allow.includes(role)) {
      navigate({ to: role === "teacher" ? "/dashboard" : "/portal" });
    }
  }, [user, role, loading, allow, navigate]);

  if (loading || !user || (allow && role && !allow.includes(role))) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center">
        <div className="aurora-3 fixed inset-0 -z-10"><span /><span /><span /><span /></div>
        <div className="glass-glow rounded-3xl p-8 flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-violet" />
          <div className="text-sm text-muted-foreground">Loading…</div>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
