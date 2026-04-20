import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Sparkles, Mail, Lock, User as UserIcon, ArrowRight } from "lucide-react";
import { useAuth, type AppRole } from "@/contexts/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Sign in — AurorIQ" },
      { name: "description", content: "Sign in or create your AurorIQ account as Teacher or Student." },
    ],
  }),
});

function AuthPage() {
  const navigate = useNavigate();
  const { signIn, signUp, user, role, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [accountRole, setAccountRole] = useState<AppRole>("teacher");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user && role) {
      navigate({ to: role === "teacher" ? "/dashboard" : "/portal" });
    }
  }, [user, role, loading, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    if (mode === "signin") {
      const { error } = await signIn(email, password);
      if (error) toast.error(error);
      else toast.success("Welcome back!");
    } else {
      if (!fullName.trim()) {
        toast.error("Enter your full name");
        setSubmitting(false);
        return;
      }
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters");
        setSubmitting(false);
        return;
      }
      const { error } = await signUp(email, password, fullName, accountRole);
      if (error) toast.error(error);
      else toast.success("Account created! Redirecting…");
    }
    setSubmitting(false);
  };

  return (
    <div className="relative min-h-screen mesh-bg flex items-center justify-center px-4 py-10">
      <div className="aurora-3 fixed inset-0 -z-10"><span /><span /><span /><span /></div>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-[10%] h-24 w-24 rounded-3xl gradient-coral opacity-40 blur-xl animate-float" />
        <div className="absolute bottom-32 right-[12%] h-28 w-28 rounded-full gradient-electric opacity-40 blur-xl animate-float" style={{ animationDelay: "-3s" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-md glass-glow rounded-3xl p-8"
      >
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="h-10 w-10 rounded-xl gradient-aurora glow-violet flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl">AurorIQ</span>
        </Link>

        <h1 className="font-display font-extrabold text-3xl">
          {mode === "signin" ? <>Welcome <span className="text-gradient">back</span></> : <>Create your <span className="text-gradient">account</span></>}
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          {mode === "signin" ? "Sign in to continue your journey." : "Choose your role to get started."}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-1 rounded-2xl bg-accent/40 p-1">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`py-2 rounded-xl text-sm font-semibold transition-all ${
                mode === m ? "gradient-violet text-white glow-violet" : "text-muted-foreground"
              }`}
            >
              {m === "signin" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          {mode === "signup" && (
            <>
              <Field icon={<UserIcon className="h-4 w-4" />} type="text" placeholder="Full name" value={fullName} onChange={setFullName} />
              <div className="grid grid-cols-2 gap-2">
                {(["teacher", "student"] as AppRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setAccountRole(r)}
                    className={`rounded-xl px-3 py-3 text-sm font-semibold capitalize transition-all border ${
                      accountRole === r
                        ? "gradient-violet text-white border-transparent glow-violet"
                        : "bg-background/60 border-border hover:border-violet"
                    }`}
                  >
                    {r === "teacher" ? "👩‍🏫 Teacher" : "🎓 Student"}
                  </button>
                ))}
              </div>
            </>
          )}
          <Field icon={<Mail className="h-4 w-4" />} type="email" placeholder="Email" value={email} onChange={setEmail} />
          <Field icon={<Lock className="h-4 w-4" />} type="password" placeholder="Password" value={password} onChange={setPassword} />

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl gradient-aurora glow-violet px-5 py-3 text-sm font-semibold text-white hover-lift disabled:opacity-60"
          >
            {submitting ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-coral" />
          Powered by AI predictions and personalized roadmaps
        </div>
      </motion.div>
    </div>
  );
}

function Field({ icon, type, placeholder, value, onChange }: { icon: React.ReactNode; type: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
      <input
        type={type}
        required
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-background/60 rounded-xl pl-10 pr-4 py-2.5 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-ring transition"
      />
    </div>
  );
}
