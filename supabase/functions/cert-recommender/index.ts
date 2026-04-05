import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { role, skills, missingSkills, budget } = await req.json();
    if (!role) {
      return new Response(JSON.stringify({ error: "Role is required" }), {
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
            content: "You are a certification advisor for Indian tech professionals. Recommend certifications that close skill gaps and have high recruiter recognition. Be specific with real certification names, platforms, costs in INR, and durations.",
          },
          {
            role: "user",
            content: `Target role: ${role}\nCurrent skills: ${(skills || []).join(", ")}\nMissing skills: ${(missingSkills || []).join(", ")}\nBudget preference: ${budget || "any"}\n\nRecommend the top 5 certifications.`,
          },
        ],
        tools: [{
          type: "function",
          function: {
            name: "cert_recommendations",
            description: "Return certification recommendations",
            parameters: {
              type: "object",
              properties: {
                certifications: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      platform: { type: "string" },
                      duration: { type: "string" },
                      cost: { type: "string" },
                      salary_impact_lpa: { type: "number" },
                      recruiter_recognition: { type: "string", enum: ["low", "medium", "high", "very_high"] },
                      gaps_closed: { type: "array", items: { type: "string" } },
                      priority: { type: "number" },
                      free_option: { type: "boolean" },
                      url: { type: "string" },
                    },
                    required: ["name", "platform", "duration", "cost", "salary_impact_lpa", "recruiter_recognition", "gaps_closed", "priority", "free_option"],
                  },
                },
                total_salary_impact: { type: "number" },
                fastest_to_complete: { type: "string" },
                highest_roi: { type: "string" },
              },
              required: ["certifications", "total_salary_impact", "fastest_to_complete", "highest_roi"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "cert_recommendations" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    return new Response(JSON.stringify(JSON.parse(toolCall.function.arguments)), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("cert-recommender error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
