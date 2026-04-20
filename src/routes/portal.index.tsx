import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Trophy, Target, TrendingUp, Loader2, Wand2 } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { generateStudyPlan } from "@/utils/ai.functions";
import { callAuthed } from "@/lib/call-authed";
import { toast } from "sonner";
import { ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";

export const Route = createFileRoute("/portal/")({
  component: Page,
  head: () => ({ meta: [{ title: "My Portal — AurorIQ" }] }),
});

const QUOTES = [
  "Small daily wins compound into extraordinary outcomes.",
  "You don't have to be great to start, but you have to start to be great.",
  "Progress, not perfection.",
  "Every expert was once a beginner.",
];

interface Score { id: string; subject: string; score: number; max_score: number }
interface Recommendation { id: string; recommendation: string; category: string; status: string }
interface Achievement { id: string; badge_name: string; description: string | null; earned_date: string }

function Page() {
  return (
    <AuthGuard allow={["student"]}>
      <Portal />
    </AuthGuard>
  );
}

function Portal() {
  const { user } = useAuth();
  const [studentId, setStudentId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string>("");
  const [scores, setScores] = useState<Score[]>([]);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [linking, setLinking] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);
  const [plan, setPlan] = useState<{ weekly_theme: string; tip_of_the_week: string; days: { day: string; blocks: { time: string; subject: string; activity: string; priority: string }[] }[] } | null>(null);

  const planFn = useServerFn(generateStudyPlan);
  const quote = QUOTES[new Date().getDate() % QUOTES.length];

  useEffect(() => {
    if (!user) return;
    supabase.from("students").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setStudentId(data.id);
        setStudentName(data.name);
        supabase.from("scores").select("*").eq("student_id", data.id).then(({ data: s }) => setScores((s ?? []) as unknown as Score[]));
        supabase.from("ai_recommendations").select("*").eq("student_id", data.id).order("created_at", { ascending: false }).then(({ data: r }) => setRecs((r ?? []) as Recommendation[]));
        supabase.from("achievements").select("*").eq("student_id", data.id).then(({ data: a }) => setAchievements((a ?? []) as Achievement[]));
      }
    });
  }, [user]);

  const linkAccount = async () => {
    if (!user?.email) return;
    setLinking(true);
    // Try to find an unlinked student with matching email/name and claim it
    const { data: candidates } = await supabase.from("students").select("*").is("user_id", null);
    if (!candidates?.length) {
      toast.error("Ask your teacher to add you first, then refresh.");
      setLinking(false);
      return;
    }
    toast.info("Ask your teacher to link your account from their dashboard.");
    setLinking(false);
  };

  const runPlan = async () => {
    if (!studentId) return;
    setPlanLoading(true);
    try {
      const result = await callAuthed(planFn, { studentId });
      setPlan(result);
      toast.success("Weekly plan ready!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
    setPlanLoading(false);
  };

  const toggleRec = async (rec: Recommendation) => {
    const newStatus = rec.status === "done" ? "pending" : "done";
    const { error } = await supabase.from("ai_recommendations").update({ status: newStatus }).eq("id", rec.id);
    if (error) { toast.error(error.message); return; }
    setRecs((prev) => prev.map((r) => r.id === rec.id ? { ...r, status: newStatus } : r));
  };

  if (!studentId) {
    return (
      <AppLayout>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-glow rounded-3xl p-12 text-center max-w-2xl mx-auto">
          <div className="h-20 w-20 mx-auto rounded-3xl gradient-aurora glow-violet flex items-center justify-center mb-5">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h1 className="font-display font-extrabold text-3xl">Welcome, {user?.email?.split("@")[0]}!</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Your account isn't linked to a student record yet. Ask your teacher to add you, or click below to check.
          </p>
          <button onClick={linkAccount} disabled={linking} className="mt-6 inline-flex items-center gap-2 rounded-xl gradient-aurora glow-violet px-5 py-2.5 text-sm font-semibold text-white hover-lift">
            {linking ? "Checking…" : "Check linkage"}
          </button>
        </motion.div>
      </AppLayout>
    );
  }

  const radarData = scores.length ? scores.map((s) => ({ subject: s.subject, score: Math.round((Number(s.score) / Number(s.max_score)) * 100) })) :
    ["Math", "Science", "English", "History", "CS"].map((s) => ({ subject: s, score: 50 }));

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Quote of the day</div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl">
          Hi <span className="text-gradient">{studentName.split(" ")[0]}</span>!
        </h1>
        <p className="text-muted-foreground mt-2 italic">"{quote}"</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="glass-glow rounded-3xl p-6 lg:col-span-2">
          <h3 className="font-display font-bold text-lg mb-2 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-violet" /> My performance</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                <Radar dataKey="score" stroke="var(--electric)" fill="var(--electric)" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-glow rounded-3xl p-6">
          <h3 className="font-display font-bold text-lg mb-3 flex items-center gap-2"><Trophy className="h-4 w-4 text-gold" /> Badges</h3>
          {achievements.length === 0 ? (
            <p className="text-xs text-muted-foreground">Earn your first badge by hitting milestones!</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {achievements.map((a) => (
                <div key={a.id} className="rounded-xl bg-accent/30 p-3 text-center">
                  <div className="h-10 w-10 mx-auto rounded-full gradient-gold flex items-center justify-center mb-1.5">
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-xs font-semibold">{a.badge_name}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-glow rounded-3xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg flex items-center gap-2"><Target className="h-4 w-4 text-violet" /> AI Weekly Study Plan</h3>
            <button onClick={runPlan} disabled={planLoading} className="inline-flex items-center gap-2 rounded-xl gradient-aurora glow-violet px-4 py-2 text-xs font-semibold text-white hover-lift disabled:opacity-60">
              {planLoading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Building…</> : <><Wand2 className="h-3.5 w-3.5" /> Generate plan</>}
            </button>
          </div>
          {!plan ? (
            <p className="text-xs text-muted-foreground py-6 text-center">Click "Generate plan" to get a personalized weekly schedule built around your weakest subjects.</p>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl gradient-violet glow-violet p-3 text-white">
                <div className="text-[10px] uppercase tracking-wide opacity-80">This week's theme</div>
                <div className="font-display font-bold">{plan.weekly_theme}</div>
              </div>
              {plan.days.map((d) => (
                <div key={d.day} className="rounded-xl bg-accent/30 p-3">
                  <div className="font-semibold text-sm mb-2">{d.day}</div>
                  <ul className="space-y-1.5">
                    {d.blocks.map((b, i) => (
                      <li key={i} className="text-xs flex gap-2 items-start">
                        <span className={`shrink-0 px-1.5 py-0.5 rounded font-mono ${b.priority === "high" ? "bg-coral/20 text-coral" : b.priority === "medium" ? "bg-gold/20 text-gold" : "bg-emerald/20 text-emerald"}`}>{b.time}</span>
                        <span><strong>{b.subject}:</strong> {b.activity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="text-xs italic text-muted-foreground border-l-2 border-violet pl-3">💡 {plan.tip_of_the_week}</div>
            </div>
          )}
        </div>

        <div className="glass-glow rounded-3xl p-6">
          <h3 className="font-display font-bold text-lg mb-3">My recommendations</h3>
          {recs.length === 0 ? (
            <p className="text-xs text-muted-foreground">Your teacher hasn't generated recommendations for you yet.</p>
          ) : (
            <ul className="space-y-2">
              {recs.slice(0, 5).map((r) => (
                <li key={r.id} className={`flex items-start gap-2 p-2 rounded-xl bg-accent/30 ${r.status === "done" ? "opacity-60" : ""}`}>
                  <button onClick={() => toggleRec(r)} className={`mt-0.5 h-4 w-4 rounded shrink-0 border ${r.status === "done" ? "gradient-emerald border-transparent" : "border-border"}`} />
                  <div className={`text-xs ${r.status === "done" ? "line-through" : ""}`}>{r.recommendation}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
