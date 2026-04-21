import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Brain, Sparkles, Loader2, CheckCircle2, AlertTriangle, TrendingUp, Wand2, Link2, LinkIcon, Unlink } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { AuthGuard } from "@/components/auth-guard";
import { PerformanceBadge } from "@/components/performance-badge";
import { useStudent, performanceFromGpa, performanceGradient, avatarUrl } from "@/lib/students-db";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { predictPerformance, generateRecommendations } from "@/utils/ai.functions";
import { linkStudentAccount, unlinkStudentAccount } from "@/utils/students.functions";
import { callAuthed } from "@/lib/call-authed";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

export const Route = createFileRoute("/students/$id")({
  component: Page,
  head: () => ({ meta: [{ title: "Student profile — AurorIQ" }] }),
});

function Page() {
  return (
    <AuthGuard allow={["teacher"]}>
      <Detail />
    </AuthGuard>
  );
}

interface Score { id: string; subject: string; score: number; max_score: number }
interface Recommendation { id: string; recommendation: string; category: string; status: string }

function Detail() {
  const { id } = Route.useParams();
  const { student, loading } = useStudent(id);
  const [scores, setScores] = useState<Score[]>([]);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [analysis, setAnalysis] = useState<{
    predicted_final_score: number; confidence: number; risk_level: string;
    summary: string; strengths: string[]; concerns: string[];
  } | null>(null);
  const [predicting, setPredicting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [scoreForm, setScoreForm] = useState({ subject: "Math", score: "85" });

  // Link Account state
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkEmail, setLinkEmail] = useState("");
  const [linking, setLinking] = useState(false);
  const [linkedUserId, setLinkedUserId] = useState<string | null>(null);

  const predictFn = useServerFn(predictPerformance);
  const recsFn = useServerFn(generateRecommendations);
  const linkFn = useServerFn(linkStudentAccount);
  const unlinkFn = useServerFn(unlinkStudentAccount);

  useEffect(() => {
    if (!id) return;
    supabase.from("scores").select("*").eq("student_id", id).then(({ data }) => setScores((data ?? []) as unknown as Score[]));
    supabase.from("ai_recommendations").select("*").eq("student_id", id).order("created_at", { ascending: false }).then(({ data }) => setRecs((data ?? []) as Recommendation[]));
  }, [id]);

  useEffect(() => {
    setLinkedUserId(student?.user_id ?? null);
  }, [student?.user_id]);

  const linkAccount = async () => {
    if (!id) return;
    setLinking(true);
    try {
      const res = await callAuthed(linkFn, { studentId: id, email: linkEmail });
      setLinkedUserId(res.linkedUserId);
      toast.success(`Linked ${res.studentName} to ${linkEmail}`);
      setLinkOpen(false);
      setLinkEmail("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to link account");
    }
    setLinking(false);
  };

  const unlinkAccount = async () => {
    if (!id) return;
    setLinking(true);
    try {
      await callAuthed(unlinkFn, { studentId: id });
      setLinkedUserId(null);
      toast.success("Account unlinked");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to unlink");
    }
    setLinking(false);
  };

  const addScore = async () => {
    if (!id) return;
    const { error, data } = await supabase.from("scores").insert({
      student_id: id, subject: scoreForm.subject, score: Number(scoreForm.score), max_score: 100,
    }).select().single();
    if (error) { toast.error(error.message); return; }
    setScores((s) => [...s, data as unknown as Score]);
    toast.success("Score added");
  };

  const runPrediction = async () => {
    if (!id) return;
    setPredicting(true);
    try {
      const result = await callAuthed(predictFn, { studentId: id });
      setAnalysis(result.analysis);
      toast.success("AI prediction generated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
    setPredicting(false);
  };

  const runRecs = async () => {
    if (!id) return;
    setGenerating(true);
    try {
      const { items } = await callAuthed(recsFn, { studentId: id });
      setRecs((prev) => [...(items as Recommendation[]), ...prev]);
      toast.success("Recommendations generated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
    setGenerating(false);
  };

  const toggleRec = async (rec: Recommendation) => {
    const newStatus = rec.status === "done" ? "pending" : "done";
    const { error } = await supabase.from("ai_recommendations").update({ status: newStatus }).eq("id", rec.id);
    if (error) { toast.error(error.message); return; }
    setRecs((prev) => prev.map((r) => r.id === rec.id ? { ...r, status: newStatus } : r));
  };

  if (loading) return (
    <AppLayout><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-violet" /></div></AppLayout>
  );
  if (!student) return (
    <AppLayout>
      <div className="glass-glow rounded-3xl p-12 text-center">
        <h2 className="font-display font-bold text-2xl">Student not found</h2>
        <Link to="/students" className="mt-4 inline-flex text-sm text-violet font-semibold">← Back to roster</Link>
      </div>
    </AppLayout>
  );

  const perf = performanceFromGpa(Number(student.gpa), Number(student.attendance_pct));
  const radarData = scores.length ? scores.map((s) => ({ subject: s.subject, score: Math.round((Number(s.score) / Number(s.max_score)) * 100) })) :
    ["Math", "Science", "English", "History", "CS"].map((s) => ({ subject: s, score: 0 }));

  return (
    <AppLayout>
      <Link to="/students" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to roster
      </Link>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-glow rounded-3xl overflow-hidden mb-6">
        <div className={`h-32 ${performanceGradient(perf)} relative`}>
          <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{ background: "radial-gradient(circle at 30% 50%, white, transparent 60%)" }} />
        </div>
        <div className="px-6 sm:px-8 pb-6 -mt-14 flex flex-col sm:flex-row sm:items-end gap-4">
          <img src={avatarUrl(student.name)} alt={student.name} className="h-28 w-28 rounded-2xl bg-card ring-4 ring-card" />
          <div className="flex-1">
            <h1 className="font-display font-extrabold text-3xl">{student.name}</h1>
            <div className="text-sm text-muted-foreground">Grade {student.grade}-{student.section} · GPA {Number(student.gpa).toFixed(2)} · {Math.round(Number(student.attendance_pct))}% attendance</div>
          </div>
          <PerformanceBadge performance={perf} />
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-5 mb-6">
        <div className="glass-glow rounded-3xl p-6 lg:col-span-2">
          <h3 className="font-display font-bold text-lg mb-2">Subject mastery</h3>
          <p className="text-xs text-muted-foreground mb-4">Live from latest scores</p>
          <div className="h-72">
            <ResponsiveContainer>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                <Radar dataKey="score" stroke="var(--violet)" fill="var(--violet)" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-2 mt-4 flex-wrap items-end">
            <select value={scoreForm.subject} onChange={(e) => setScoreForm({ ...scoreForm, subject: e.target.value })} className="bg-background/60 rounded-xl px-3 py-2 text-sm border border-border">
              {["Math", "Science", "English", "History", "CS"].map((s) => <option key={s}>{s}</option>)}
            </select>
            <input type="number" value={scoreForm.score} onChange={(e) => setScoreForm({ ...scoreForm, score: e.target.value })} className="bg-background/60 rounded-xl px-3 py-2 text-sm border border-border w-24" placeholder="Score" />
            <button onClick={addScore} className="rounded-xl gradient-violet glow-violet px-4 py-2 text-xs font-semibold text-white hover-lift">Add score</button>
          </div>
        </div>

        <div className="glass-glow rounded-3xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-lg flex items-center gap-2"><Brain className="h-4 w-4 text-violet" /> AI Prediction</h3>
          </div>
          {!analysis ? (
            <div className="text-center py-6">
              <div className="h-16 w-16 mx-auto rounded-2xl gradient-aurora glow-violet flex items-center justify-center mb-3">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <p className="text-xs text-muted-foreground mb-4">Run real-time AI to predict finals score & risk.</p>
              <button onClick={runPrediction} disabled={predicting} className="inline-flex items-center gap-2 rounded-xl gradient-aurora glow-violet px-4 py-2 text-xs font-semibold text-white hover-lift disabled:opacity-60">
                {predicting ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing…</> : <><Wand2 className="h-3.5 w-3.5" /> Run AI prediction</>}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Predicted finals</div>
                <div className="font-display font-extrabold text-4xl text-gradient">{analysis.predicted_final_score}</div>
                <div className="text-[10px] text-muted-foreground">{analysis.confidence}% confidence · {analysis.risk_level} risk</div>
              </div>
              <p className="text-xs text-muted-foreground border-l-2 border-violet pl-3">{analysis.summary}</p>
              <div>
                <div className="text-[10px] uppercase font-semibold text-emerald mb-1">Strengths</div>
                <ul className="space-y-1">{analysis.strengths.map((s, i) => <li key={i} className="text-xs flex gap-1.5"><CheckCircle2 className="h-3 w-3 text-emerald shrink-0 mt-0.5" />{s}</li>)}</ul>
              </div>
              <div>
                <div className="text-[10px] uppercase font-semibold text-coral mb-1">Concerns</div>
                <ul className="space-y-1">{analysis.concerns.map((s, i) => <li key={i} className="text-xs flex gap-1.5"><AlertTriangle className="h-3 w-3 text-coral shrink-0 mt-0.5" />{s}</li>)}</ul>
              </div>
              <button onClick={runPrediction} disabled={predicting} className="w-full text-[11px] text-muted-foreground hover:text-foreground">
                {predicting ? "Re-running…" : "↻ Re-analyze"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="glass-glow rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-bold text-lg flex items-center gap-2"><TrendingUp className="h-4 w-4 text-violet" /> AI Recommendations</h3>
            <p className="text-xs text-muted-foreground">Personalized actions to lift this student's outcomes</p>
          </div>
          <button onClick={runRecs} disabled={generating} className="inline-flex items-center gap-2 rounded-xl gradient-aurora glow-violet px-4 py-2 text-xs font-semibold text-white hover-lift disabled:opacity-60">
            {generating ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating…</> : <><Wand2 className="h-3.5 w-3.5" /> Generate</>}
          </button>
        </div>
        {recs.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">No recommendations yet. Click "Generate" to get AI-powered ideas.</div>
        ) : (
          <ul className="space-y-2">
            {recs.map((r) => (
              <li key={r.id} className={`flex items-start gap-3 p-3 rounded-xl bg-accent/30 hover:bg-accent/50 transition-colors ${r.status === "done" ? "opacity-60" : ""}`}>
                <button onClick={() => toggleRec(r)} className={`mt-0.5 h-5 w-5 rounded-md flex items-center justify-center border ${r.status === "done" ? "gradient-emerald border-transparent text-white" : "border-border bg-background/60"}`}>
                  {r.status === "done" && <CheckCircle2 className="h-3.5 w-3.5" />}
                </button>
                <div className="flex-1">
                  <div className={`text-sm ${r.status === "done" ? "line-through" : ""}`}>{r.recommendation}</div>
                  <span className="inline-block mt-1 text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full bg-violet/15 text-violet">{r.category.replace("_", " ")}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppLayout>
  );
}
