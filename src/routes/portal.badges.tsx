import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Trophy } from "lucide-react";

export const Route = createFileRoute("/portal/badges")({
  component: () => (
    <AuthGuard allow={["student"]}>
      <Badges />
    </AuthGuard>
  ),
});

function Badges() {
  const { user } = useAuth();
  const [items, setItems] = useState<{ id: string; badge_name: string; description: string | null; earned_date: string }[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("students").select("id").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) supabase.from("achievements").select("*").eq("student_id", data.id).then(({ data: a }) => setItems((a ?? []) as typeof items));
    });
  }, [user]);

  return (
    <AppLayout>
      <h1 className="font-display font-extrabold text-3xl mb-2">My <span className="text-gradient">Achievements</span></h1>
      <p className="text-sm text-muted-foreground mb-6">Badges you've earned along the way.</p>
      {items.length === 0 ? (
        <div className="glass-glow rounded-3xl p-12 text-center">
          <Trophy className="h-12 w-12 mx-auto text-gold mb-3" />
          <p className="text-sm text-muted-foreground">No badges yet — keep showing up and they'll start rolling in!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((a) => (
            <div key={a.id} className="glass-glow rounded-3xl p-6 text-center hover-lift">
              <div className="h-16 w-16 mx-auto rounded-2xl gradient-gold flex items-center justify-center mb-3">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <div className="font-display font-bold">{a.badge_name}</div>
              {a.description && <div className="text-xs text-muted-foreground mt-1">{a.description}</div>}
              <div className="text-[10px] text-muted-foreground mt-2">{new Date(a.earned_date).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
