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

    const { profileText, targetRole } = await req.json();
    if (!profileText || profileText.trim().length < 20) {
      return new Response(JSON.stringify({ error: "Please provide more profile text (at least 20 characters)" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY not configured");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemma-2-27b-it",
        messages: [
          {
            role: "system",
            content: `You are a LinkedIn profile optimization expert. Analyze the provided LinkedIn profile text for a student targeting a specific role. Score each section 0-10 and provide actionable fixes. Be specific and practical.`
          },
          {
            role: "user",
            content: `Target role: ${targetRole || 'Software Engineer'}

LinkedIn profile text:
${profileText}

Analyze every section thoroughly and return structured data.`
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "linkedin_analysis",
            description: "Return LinkedIn profile analysis",
            parameters: {
              type: "object",
              properties: {
                overall_score: { type: "number" },
                recruiter_click_probability: { type: "number" },
                sections: {
                  type: "object",
                  properties: {
                    headline: { type: "object", properties: { score: { type: "number" }, current: { type: "string" }, problems: { type: "array", items: { type: "string" } }, fix: { type: "string" } }, required: ["score", "problems", "fix"] },
                    about: { type: "object", properties: { score: { type: "number" }, current: { type: "string" }, problems: { type: "array", items: { type: "string" } }, fix: { type: "string" } }, required: ["score", "problems", "fix"] },
                    experience: { type: "object", properties: { score: { type: "number" }, problems: { type: "array", items: { type: "string" } }, fix: { type: "string" } }, required: ["score", "problems", "fix"] },
                    skills: { type: "object", properties: { score: { type: "number" }, current: { type: "array", items: { type: "string" } }, missing: { type: "array", items: { type: "string" } } }, required: ["score", "current", "missing"] },
                    education: { type: "object", properties: { score: { type: "number" } }, required: ["score"] },
                    achievements: { type: "object", properties: { score: { type: "number" }, suggestions: { type: "array", items: { type: "string" } } }, required: ["score", "suggestions"] }
                  },
                  required: ["headline", "about", "experience", "skills", "education", "achievements"]
                },
                missing_keywords: { type: "array", items: { type: "string" } },
                present_keywords: { type: "array", items: { type: "object", properties: { keyword: { type: "string" }, count: { type: "number" } }, required: ["keyword", "count"] } },
                priority_actions: { type: "array", items: { type: "object", properties: { action: { type: "string" }, priority: { type: "string", enum: ["high", "medium", "low"] }, time_minutes: { type: "number" } }, required: ["action", "priority", "time_minutes"] } }
              },
              required: ["overall_score", "recruiter_click_probability", "sections", "missing_keywords", "present_keywords", "priority_actions"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "linkedin_analysis" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limited, please try again later" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    const result = toolCall ? JSON.parse(toolCall.function.arguments) : null;

    if (!result) throw new Error("No structured response from AI");

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("linkedin-analyzer error:", e);
    return new Response(JSON.stringify({ error: (e instanceof Error ? e.message : "Unknown error") }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
