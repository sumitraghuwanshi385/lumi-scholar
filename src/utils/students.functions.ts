import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// ============ LINK STUDENT ACCOUNT BY EMAIL ============
// Teacher provides a student's email + the local student record id.
// We look up the auth user by email (admin), verify they have the "student" role,
// then update the student row via the user-authed client (RLS enforces teacher ownership).
export const linkStudentAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { studentId: string; email: string }) => {
    if (!data.studentId || typeof data.studentId !== "string") {
      throw new Error("studentId required");
    }
    const email = String(data.email ?? "").trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Valid email required");
    }
    if (email.length > 255) throw new Error("Email too long");
    return { studentId: data.studentId, email };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId: teacherId } = context;

    // 1. Verify caller is a teacher and owns this student record
    const { data: studentRow, error: studentErr } = await supabase
      .from("students")
      .select("id, teacher_id, user_id, name")
      .eq("id", data.studentId)
      .maybeSingle();
    if (studentErr) throw new Error(studentErr.message);
    if (!studentRow) throw new Error("Student record not found or you don't own it");

    // 2. Look up auth user by email (admin client required — auth.users isn't exposed via RLS)
    // listUsers doesn't filter server-side by email reliably, but supports paginated search
    let foundUserId: string | null = null;
    let page = 1;
    const perPage = 200;
    // Cap pagination to avoid runaway loops
    while (page <= 10 && !foundUserId) {
      const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage,
      });
      if (listErr) throw new Error(listErr.message);
      const match = list.users.find((u) => (u.email ?? "").toLowerCase() === data.email);
      if (match) { foundUserId = match.id; break; }
      if (list.users.length < perPage) break;
      page += 1;
    }

    if (!foundUserId) {
      throw new Error("No account found with that email. Ask the student to sign up first.");
    }

    // 3. Confirm the matched user has the "student" role
    const { data: roleRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", foundUserId)
      .eq("role", "student")
      .maybeSingle();
    if (!roleRow) {
      throw new Error("That account exists but is not registered as a student.");
    }

    // 4. Make sure this auth user isn't already linked to another student record owned by this teacher
    const { data: existing } = await supabaseAdmin
      .from("students")
      .select("id, name")
      .eq("user_id", foundUserId)
      .eq("teacher_id", teacherId)
      .maybeSingle();
    if (existing && existing.id !== data.studentId) {
      throw new Error(`That account is already linked to ${existing.name}.`);
    }

    // 5. Update the student row via the user-authed client so RLS enforces ownership
    const { error: updateErr } = await supabase
      .from("students")
      .update({ user_id: foundUserId })
      .eq("id", data.studentId);
    if (updateErr) throw new Error(updateErr.message);

    return { success: true, linkedUserId: foundUserId, studentName: studentRow.name };
  });

// ============ UNLINK STUDENT ACCOUNT ============
export const unlinkStudentAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { studentId: string }) => {
    if (!data.studentId) throw new Error("studentId required");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase
      .from("students")
      .update({ user_id: null })
      .eq("id", data.studentId);
    if (error) throw new Error(error.message);
    return { success: true };
  });
