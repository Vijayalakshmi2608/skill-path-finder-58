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

    const { skills, jobTitle, targetCompanies, experienceLevel, experience, education } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const userPrompt = `
Candidate Skills: ${JSON.stringify(skills)}
Experience: ${JSON.stringify(experience)}
Education: ${JSON.stringify(education)}
Target Role: ${jobTitle}
Target Companies: ${(targetCompanies || []).join(", ") || "Any"}
Experience Level: ${experienceLevel || "Entry Level"}
`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a senior technical recruiter with 10 years at top tech companies. Analyze this candidate's skills vs the target role. Return structured data using the provided tool.`,
          },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "skill_gap_analysis",
              description: "Return skill gap analysis results",
              parameters: {
                type: "object",
                properties: {
                  readiness_score: { type: "number", description: "0-100 readiness score" },
                  matched_skills: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        proficiency: { type: "string" },
                        importance: { type: "string", enum: ["high", "medium", "low"] },
                        percent: { type: "number", description: "0-100 proficiency percentage" },
                      },
                      required: ["name", "proficiency", "importance", "percent"],
                    },
                  },
                  missing_skills: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        priority: { type: "string", enum: ["critical", "important", "nice-to-have"] },
                        learning_time_days: { type: "number" },
                        score_impact: { type: "number" },
                        reason: { type: "string" },
                        category: { type: "string" },
                      },
                      required: ["name", "priority", "learning_time_days", "score_impact", "reason", "category"],
                    },
                  },
                  competitive_percentile: { type: "number" },
                  top_3_quick_wins: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        skill: { type: "string" },
                        days_to_learn: { type: "number" },
                        score_boost: { type: "number" },
                      },
                      required: ["skill", "days_to_learn", "score_boost"],
                    },
                  },
                  overall_feedback: { type: "string" },
                  skill_categories: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        icon: { type: "string" },
                        skills: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              name: { type: "string" },
                              status: { type: "string", enum: ["strong", "learning", "missing"] },
                              percent: { type: "number" },
                              reason: { type: "string" },
                            },
                            required: ["name", "status", "percent"],
                          },
                        },
                      },
                      required: ["name", "icon", "skills"],
                    },
                  },
                  radar_data: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        axis: { type: "string" },
                        required: { type: "number" },
                        current: { type: "number" },
                      },
                      required: ["axis", "required", "current"],
                    },
                  },
                },
                required: ["readiness_score", "matched_skills", "missing_skills", "competitive_percentile", "top_3_quick_wins", "overall_feedback", "skill_categories", "radar_data"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "skill_gap_analysis" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const parsed = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-skills error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
