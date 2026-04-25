import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MODEL = "google/gemma-2-27b-it";
const GATEWAY = "https://openrouter.ai/api/v1/chat/completions";

async function callTool(systemMsg: string, userMsg: string, toolName: string, parameters: Record<string, unknown>) {
  const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
  if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY not configured");
  const resp = await fetch(GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemMsg },
        { role: "user", content: userMsg },
      ],
      tools: [{
        type: "function",
        function: { name: toolName, description: "Return structured data", parameters },
      }],
      tool_choice: { type: "function", function: { name: toolName } },
    }),
  });
  if (!resp.ok) {
    if (resp.status === 429) throw new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429 });
    if (resp.status === 402) throw new Response(JSON.stringify({ error: "AI usage limit reached" }), { status: 402 });
    const t = await resp.text();
    console.error("AI error", resp.status, t);
    throw new Error("AI gateway error");
  }
  const result = await resp.json();
  const tc = result.choices?.[0]?.message?.tool_calls?.[0];
  if (!tc) throw new Error("No tool call returned");
  return JSON.parse(tc.function.arguments);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
    const token = authHeader?.replace(/^Bearer\s+/i, "").trim();
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized: missing token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userErr } = await authClient.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action } = body;

    if (action === "jd-match") {
      const { jobDescription, skills, jobTitle } = body;
      if (!jobDescription) {
        return new Response(JSON.stringify({ error: "jobDescription required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const result = await callTool(
        "You are a recruiter who matches resumes against job descriptions. Be precise and realistic.",
        `Candidate skills: ${(skills || []).join(", ") || "Not specified"}\nTarget role: ${jobTitle || "N/A"}\n\nJob Description:\n${jobDescription}\n\nReturn an honest match score, matched skills (those clearly present), missing skills (those required by JD but not in candidate skills), and 2-sentence application advice.`,
        "return_jd_match",
        {
          type: "object",
          properties: {
            match_percent: { type: "number", description: "0-100" },
            matched_skills: { type: "array", items: { type: "string" } },
            missing_skills: { type: "array", items: { type: "string" } },
            advice: { type: "string", description: "Exactly 2 sentences of application advice" },
          },
          required: ["match_percent", "matched_skills", "missing_skills", "advice"],
        },
      );
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "mock-questions") {
      const { jobTitle, level } = body;
      const result = await callTool(
        "You are a senior interviewer. Generate diverse interview questions a real candidate would face.",
        `Generate exactly 5 interview questions for "${jobTitle || "Software Engineer"}" at "${level || "Entry"}" level. Mix technical, behavioral, and scenario questions.`,
        "return_questions",
        {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  topic: { type: "string" },
                },
                required: ["question", "topic"],
              },
            },
          },
          required: ["questions"],
        },
      );
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "evaluate-answer") {
      const { question, answer, jobTitle } = body;
      if (!question || !answer) {
        return new Response(JSON.stringify({ error: "question and answer required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const result = await callTool(
        `You are an expert interview coach for ${jobTitle || "Software Engineer"} roles. Provide actionable, specific feedback.`,
        `Question: "${question}"\nCandidate Answer: "${answer}"\n\nScore the answer 0-10. Give one short line of what was good, one short line of what to improve, and a 2-3 sentence suggested better answer.`,
        "return_eval",
        {
          type: "object",
          properties: {
            score: { type: "number" },
            good: { type: "string" },
            improve: { type: "string" },
            suggested_answer: { type: "string" },
          },
          required: ["score", "good", "improve", "suggested_answer"],
        },
      );
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "salary-predict") {
      const { jobTitle, skills, gapScore, level } = body;
      const result = await callTool(
        "You are a tech salary analyst for the Indian market. Provide realistic LPA ranges.",
        `Role: ${jobTitle || "Software Engineer"}\nLevel: ${level || "Entry"}\nSkills: ${(skills || []).join(", ") || "Basic"}\nReadiness Score: ${gapScore ?? 50}/100\n\nEstimate current salary range (matching current skills) and projected range after closing skill gaps. List 3 well-known companies hiring for this role. Provide one short insight on what makes the candidate more valuable.`,
        "return_salary",
        {
          type: "object",
          properties: {
            current_min_lpa: { type: "number" },
            current_max_lpa: { type: "number" },
            projected_min_lpa: { type: "number" },
            projected_max_lpa: { type: "number" },
            top_companies: { type: "array", items: { type: "string" } },
            value_insight: { type: "string" },
          },
          required: ["current_min_lpa", "current_max_lpa", "projected_min_lpa", "projected_max_lpa", "top_companies", "value_insight"],
        },
      );
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "radar-skills") {
      const { jobTitle, skills, gapScore } = body;
      const result = await callTool(
        "You are a career assessor. Score the candidate on 6 skill dimensions versus what the role requires.",
        `Role: ${jobTitle || "Software Engineer"}\nCandidate Skills: ${(skills || []).join(", ") || "Basic"}\nReadiness: ${gapScore ?? 50}/100\n\nFor each axis (Technical Skills, Communication, Problem Solving, Industry Knowledge, Tools & Frameworks, Portfolio Strength), give "current" 0-100 and "required" 0-100.`,
        "return_radar",
        {
          type: "object",
          properties: {
            axes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  axis: { type: "string" },
                  current: { type: "number" },
                  required: { type: "number" },
                },
                required: ["axis", "current", "required"],
              },
            },
          },
          required: ["axes"],
        },
      );
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    if (e instanceof Response) return new Response(e.body, { status: e.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    console.error("enhance-features error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
