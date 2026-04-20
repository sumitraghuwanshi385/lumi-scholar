import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

async function callAI(body: Record<string, unknown>) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("AI gateway not configured");

  const res = await fetch(LOVABLE_AI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: "google/gemini-2.5-flash", ...body }),
  });

  if (res.status === 429) throw new Error("Rate limit reached. Please try again in a minute.");
  if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Workspace Settings.");
  if (!res.ok) throw new Error(`AI gateway error: ${res.status}`);

  return res.json();
}

interface StudentSnapshot {
  name: string;
  grade: string;
  scores: { subject: string; score: number }[];
  attendance_pct: number;
  recent_trend: { month: string; score: number }[];
}

// ============ PERFORMANCE PREDICTION ============
export const predictPerformance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { studentId: string }) => {
    if (!data.studentId || typeof data.studentId !== "string") {
      throw new Error("studentId required");
    }
    return data;
  })
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: student } = await supabase
      .from("students")
      .select("name, grade, attendance_pct, gpa")
      .eq("id", data.studentId)
      .maybeSingle();

    if (!student) throw new Error("Student not found");

    const { data: scores } = await supabase
      .from("scores")
      .select("subject, score, max_score, exam_date")
      .eq("student_id", data.studentId)
      .order("exam_date", { ascending: true });

    const snapshot: StudentSnapshot = {
      name: student.name,
      grade: student.grade,
      attendance_pct: Number(student.attendance_pct ?? 0),
      scores: (scores ?? []).map((s) => ({
        subject: s.subject,
        score: Math.round((Number(s.score) / Number(s.max_score || 100)) * 100),
      })),
      recent_trend: [],
    };

    const ai = await callAI({
      messages: [
        {
          role: "system",
          content:
            "You are an education analytics AI. Given a student snapshot, predict their final exam score and assess risk. Be precise, encouraging, and evidence-based. Always respond by calling the analyze_student function.",
        },
        {
          role: "user",
          content: `Analyze this student: ${JSON.stringify(snapshot)}`,
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "analyze_student",
            description: "Return prediction analysis",
            parameters: {
              type: "object",
              properties: {
                predicted_final_score: { type: "number", description: "Predicted final exam score 0-100" },
                confidence: { type: "number", description: "Confidence 0-100" },
                risk_level: { type: "string", enum: ["low", "medium", "high", "critical"] },
                summary: { type: "string", description: "2-3 sentence narrative summary" },
                strengths: { type: "array", items: { type: "string" }, description: "2-3 strengths" },
                concerns: { type: "array", items: { type: "string" }, description: "2-3 concerns" },
              },
              required: ["predicted_final_score", "confidence", "risk_level", "summary", "strengths", "concerns"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "analyze_student" } },
    });

    const toolCall = ai.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("AI returned no analysis");
    const analysis = JSON.parse(toolCall.function.arguments);
    return { analysis, snapshot };
  });

// ============ RECOMMENDATIONS ============
export const generateRecommendations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { studentId: string }) => {
    if (!data.studentId) throw new Error("studentId required");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: student } = await supabase
      .from("students")
      .select("name, grade, attendance_pct, gpa")
      .eq("id", data.studentId)
      .maybeSingle();
    if (!student) throw new Error("Student not found");

    const { data: scores } = await supabase
      .from("scores")
      .select("subject, score, max_score")
      .eq("student_id", data.studentId);

    const ai = await callAI({
      messages: [
        {
          role: "system",
          content:
            "You generate personalized, specific, actionable study recommendations for students. Categories must be one of: study_habits, resources, counseling, parental_involvement.",
        },
        {
          role: "user",
          content: `Student: ${JSON.stringify(student)}\nScores: ${JSON.stringify(scores)}\nGenerate 4-5 recommendations.`,
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "save_recommendations",
            description: "Save recommendations",
            parameters: {
              type: "object",
              properties: {
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      recommendation: { type: "string" },
                      category: { type: "string", enum: ["study_habits", "resources", "counseling", "parental_involvement"] },
                    },
                    required: ["recommendation", "category"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["items"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "save_recommendations" } },
    });

    const toolCall = ai.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("AI returned no recommendations");
    const { items } = JSON.parse(toolCall.function.arguments) as {
      items: { recommendation: string; category: string }[];
    };

    // Persist
    const rows = items.map((i) => ({
      student_id: data.studentId,
      recommendation: i.recommendation,
      category: i.category,
      status: "pending" as const,
    }));
    const { data: saved, error } = await supabase.from("ai_recommendations").insert(rows).select();
    if (error) throw new Error(error.message);
    return { items: saved ?? [] };
  });

// ============ STUDY PLAN ============
export const generateStudyPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { studentId: string }) => {
    if (!data.studentId) throw new Error("studentId required");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: student } = await supabase
      .from("students")
      .select("name, grade, attendance_pct, gpa")
      .eq("id", data.studentId)
      .maybeSingle();
    if (!student) throw new Error("Student not found");

    const { data: scores } = await supabase
      .from("scores")
      .select("subject, score, max_score")
      .eq("student_id", data.studentId);

    const ai = await callAI({
      messages: [
        {
          role: "system",
          content:
            "You design weekly study plans for students. Focus 60% on weakest subjects, 25% on moderate, 15% on strongest. Include short breaks. Use realistic durations.",
        },
        {
          role: "user",
          content: `Student: ${JSON.stringify(student)}\nScores: ${JSON.stringify(scores)}\nDesign a 5-day weekly study plan (Mon-Fri).`,
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "study_plan",
            description: "Weekly study plan",
            parameters: {
              type: "object",
              properties: {
                weekly_theme: { type: "string" },
                days: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      day: { type: "string", enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] },
                      blocks: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            time: { type: "string", description: "e.g. 4:00-4:45 PM" },
                            subject: { type: "string" },
                            activity: { type: "string" },
                            priority: { type: "string", enum: ["high", "medium", "low"] },
                          },
                          required: ["time", "subject", "activity", "priority"],
                          additionalProperties: false,
                        },
                      },
                    },
                    required: ["day", "blocks"],
                    additionalProperties: false,
                  },
                },
                tip_of_the_week: { type: "string" },
              },
              required: ["weekly_theme", "days", "tip_of_the_week"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "study_plan" } },
    });

    const toolCall = ai.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("AI returned no plan");
    return JSON.parse(toolCall.function.arguments);
  });
