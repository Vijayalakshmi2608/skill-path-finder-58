import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { role, skills, missingSkills, experience } = await req.json();
    if (!role) {
      return new Response(JSON.stringify({ error: "Role is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY not configured");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemma-4-27b-it",
        messages: [
          {
            role: "system",
            content: `You are a salary intelligence engine for Indian tech market. Based on the student's skill profile and target role, calculate realistic Indian salary data. Return JSON only, no markdown.`
          },
          {
            role: "user",
            content: `Target role: ${role}
Experience: ${experience || 'fresher'}
Current skills: ${(skills || []).join(', ') || 'Not specified'}
Missing skills: ${(missingSkills || []).join(', ') || 'Not specified'}

Return this exact JSON structure:
{
  "current_range": {"min": number, "max": number},
  "projected_range": {"min": number, "max": number},
  "salary_increase": number,
  "roi_percentage": number,
  "percentile": number,
  "skill_salary_impact": [{"skill": "string", "lpa_added": number, "status": "missing"|"partial"|"have"}],
  "best_cities": [{"city": "string", "avg_lpa": number, "openings": number, "tag": "string", "emoji": "string"}],
  "growth_timeline": {"without": [number,number,number,number,number,number], "with": [number,number,number,number,number,number]},
  "negotiation_talking_points": ["string"]
}`
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "salary_analysis",
            description: "Return salary intelligence data",
            parameters: {
              type: "object",
              properties: {
                current_range: { type: "object", properties: { min: { type: "number" }, max: { type: "number" } }, required: ["min", "max"] },
                projected_range: { type: "object", properties: { min: { type: "number" }, max: { type: "number" } }, required: ["min", "max"] },
                salary_increase: { type: "number" },
                roi_percentage: { type: "number" },
                percentile: { type: "number" },
                skill_salary_impact: { type: "array", items: { type: "object", properties: { skill: { type: "string" }, lpa_added: { type: "number" }, status: { type: "string", enum: ["missing", "partial", "have"] } }, required: ["skill", "lpa_added", "status"] } },
                best_cities: { type: "array", items: { type: "object", properties: { city: { type: "string" }, avg_lpa: { type: "number" }, openings: { type: "number" }, tag: { type: "string" }, emoji: { type: "string" } }, required: ["city", "avg_lpa", "openings", "tag", "emoji"] } },
                growth_timeline: { type: "object", properties: { without: { type: "array", items: { type: "number" } }, with: { type: "array", items: { type: "number" } } }, required: ["without", "with"] },
                negotiation_talking_points: { type: "array", items: { type: "string" } }
              },
              required: ["current_range", "projected_range", "salary_increase", "roi_percentage", "percentile", "skill_salary_impact", "best_cities", "growth_timeline", "negotiation_talking_points"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "salary_analysis" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limited, please try again later" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    const result = toolCall ? JSON.parse(toolCall.function.arguments) : null;

    if (!result) throw new Error("No structured response from AI");

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("salary-intelligence error:", e);
    return new Response(JSON.stringify({ error: e.message || "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
