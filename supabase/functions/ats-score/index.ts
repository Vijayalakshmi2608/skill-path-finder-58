import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // --- JWT auth check: reject anonymous/invalid callers to prevent AI credit abuse ---
    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
    const token = authHeader?.replace(/^Bearer\s+/i, "").trim();
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized: missing token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const _authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: _userData, error: _userErr } = await _authClient.auth.getUser(token);
    if (_userErr || !_userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // --- end auth check ---

    const { resumeText, jobTitle } = await req.json();
    if (!resumeText || typeof resumeText !== "string" || resumeText.length > 50000) {
      return new Response(JSON.stringify({ error: "Invalid resume text" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY is not configured");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemma-4-27b-it",
        messages: [
          {
            role: "system",
            content: `You are an expert ATS (Applicant Tracking System) resume analyzer. Analyze the resume for ATS compatibility and return structured feedback. Consider the target job title if provided. Be specific and actionable in your feedback.`,
          },
          {
            role: "user",
            content: `Analyze this resume for ATS compatibility${jobTitle ? ` targeting "${jobTitle}" roles` : ""}:\n\n${resumeText}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "ats_analysis",
              description: "Return ATS analysis results",
              parameters: {
                type: "object",
                properties: {
                  ats_score: { type: "number", description: "ATS pass rate percentage 0-100" },
                  summary: { type: "string", description: "One-line summary of ATS readiness" },
                  issues: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string", enum: ["error", "warning", "success"] },
                        message: { type: "string" },
                        category: { type: "string", enum: ["keywords", "formatting", "action_verbs", "metrics", "structure", "length"] },
                      },
                      required: ["type", "message", "category"],
                    },
                  },
                  missing_keywords: {
                    type: "array",
                    items: { type: "string" },
                    description: "Keywords missing for the target role",
                  },
                  strong_points: {
                    type: "array",
                    items: { type: "string" },
                    description: "Things the resume does well",
                  },
                  weak_bullets: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        original: { type: "string" },
                        improved: { type: "string" },
                        reason: { type: "string" },
                      },
                      required: ["original", "improved", "reason"],
                    },
                    description: "Weak bullet points with AI-improved versions",
                  },
                },
                required: ["ats_score", "summary", "issues", "missing_keywords", "strong_points", "weak_bullets"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "ats_analysis" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const parsed = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ats-score error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
