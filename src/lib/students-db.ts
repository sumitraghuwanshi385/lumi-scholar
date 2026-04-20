import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth-context";

export interface DBStudent {
  id: string;
  teacher_id: string;
  user_id: string | null;
  name: string;
  grade: string;
  section: string;
  gpa: number;
  attendance_pct: number;
  parent_contact: string | null;
  enrolled_date: string | null;
  notes: string | null;
  created_at: string;
}

export type Performance = "Excellent" | "Good" | "At Risk" | "Critical";

export function performanceFromGpa(gpa: number, attendance: number): Performance {
  const score = gpa * 20 + attendance * 0.4;
  if (score >= 110) return "Excellent";
  if (score >= 90) return "Good";
  if (score >= 70) return "At Risk";
  return "Critical";
}

export function performanceGradient(p: Performance): string {
  switch (p) {
    case "Excellent": return "gradient-emerald";
    case "Good": return "gradient-electric";
    case "At Risk": return "gradient-gold";
    case "Critical": return "gradient-coral";
  }
}

export function avatarUrl(seed: string) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundType=gradientLinear&radius=50`;
}

export function useStudents() {
  const { user, role } = useAuth();
  const [students, setStudents] = useState<DBStudent[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!user) return;
    setLoading(true);
    const query = supabase.from("students").select("*").order("created_at", { ascending: false });
    const { data, error } = role === "teacher"
      ? await query.eq("teacher_id", user.id)
      : await query.eq("user_id", user.id);
    if (!error && data) setStudents(data as DBStudent[]);
    setLoading(false);
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user?.id, role]);

  return { students, loading, refresh };
}

export function useStudent(id: string | undefined) {
  const [student, setStudent] = useState<DBStudent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    supabase.from("students").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      setStudent(data as DBStudent | null);
      setLoading(false);
    });
  }, [id]);

  return { student, loading };
}
