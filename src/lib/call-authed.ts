import { supabase } from "@/integrations/supabase/client";

/**
 * Call a TanStack server function while attaching the user's Supabase
 * Bearer token (required by requireSupabaseAuth middleware).
 */
export async function callAuthed<TArgs, TResult>(
  fn: (input: { data: TArgs; headers?: Record<string, string> }) => Promise<TResult>,
  data: TArgs,
): Promise<TResult> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Not authenticated");
  return fn({
    data,
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
}
