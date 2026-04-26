import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    // Edge function is mounted at /api-gateway, so path after that is the route
    // But since Supabase mounts at /functions/v1/api-gateway, we parse from query param
    const route = url.searchParams.get("route") || "";
    const method = req.method;

    // GET /api/v1/skills/{job_title}
    if (method === "GET" && route.startsWith("skills/")) {
      const jobTitle = decodeURIComponent(route.replace("skills/", ""));
      if (!jobTitle) {
        return jsonResponse({ error: "job_title is required" }, 400);
      }

      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are a job market expert. Return required skills for the given role." },
            { role: "user", content: `What skills are required for a "${jobTitle}" role?` },
          ],
          tools: [{
            type: "function",
            function: {
              name: "return_skills",
              description: "Return required skills for a job role",
              parameters: {
                type: "object",
                properties: {
                  job_title: { type: "string" },
                  required_skills: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        category: { type: "string" },
                        importance: { type: "string", enum: ["critical", "important", "nice-to-have"] },
                        avg_salary_impact_percent: { type: "number" },
                      },
                      required: ["name", "category", "importance"],
                    },
                  },
                  total_jobs_available: { type: "number" },
                  avg_salary_range: { type: "string" },
                },
                required: ["job_title", "required_skills", "total_jobs_available", "avg_salary_range"],
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "return_skills" } },
        }),
      });

      if (!response.ok) {
        return handleAIError(response);
      }

      const data = await response.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) throw new Error("No tool call in response");
      const parsed = JSON.parse(toolCall.function.arguments);

      return jsonResponse({ status: "success", data: parsed });
    }

    // POST /api/v1/analyze
    if (method === "POST" && route === "analyze") {
      const body = await req.json();
      const { skills, job_title, experience_level } = body;

      if (!skills || !Array.isArray(skills) || !job_title) {
        return jsonResponse({ error: "skills (array) and job_title (string) are required" }, 400);
      }

      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are an expert career analyst. Analyze skill gaps for the given role and return structured data." },
            { role: "user", content: `Analyze these skills for a "${job_title}" role (${experience_level || "entry"} level):\n${JSON.stringify(skills)}` },
          ],
          tools: [{
            type: "function",
            function: {
              name: "gap_analysis",
              description: "Return skill gap analysis",
              parameters: {
                type: "object",
                properties: {
                  readiness_score: { type: "number" },
                  matched_skills: { type: "array", items: { type: "object", properties: { name: { type: "string" }, match_percent: { type: "number" } }, required: ["name", "match_percent"] } },
                  missing_skills: { type: "array", items: { type: "object", properties: { name: { type: "string" }, priority: { type: "string" }, learning_time_days: { type: "number" } }, required: ["name", "priority", "learning_time_days"] } },
                  recommendation: { type: "string" },
                },
                required: ["readiness_score", "matched_skills", "missing_skills", "recommendation"],
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "gap_analysis" } },
        }),
      });

      if (!response.ok) return handleAIError(response);

      const data = await response.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) throw new Error("No tool call in response");

      return jsonResponse({ status: "success", data: JSON.parse(toolCall.function.arguments) });
    }

    // GET /api/v1/trending
    if (method === "GET" && route === "trending") {
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are a tech industry analyst. Return the top trending skills for this month based on current market data." },
            { role: "user", content: `What are the top trending tech skills for ${new Date().toLocaleString("en-US", { month: "long", year: "numeric" })}?` },
          ],
          tools: [{
            type: "function",
            function: {
              name: "trending_skills",
              description: "Return trending skills",
              parameters: {
                type: "object",
                properties: {
                  month: { type: "string" },
                  trending: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        rank: { type: "number" },
                        skill: { type: "string" },
                        growth_percent: { type: "number" },
                        category: { type: "string" },
                        reason: { type: "string" },
                      },
                      required: ["rank", "skill", "growth_percent", "category", "reason"],
                    },
                  },
                },
                required: ["month", "trending"],
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "trending_skills" } },
        }),
      });

      if (!response.ok) return handleAIError(response);

      const data = await response.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) throw new Error("No tool call in response");

      return jsonResponse({ status: "success", data: JSON.parse(toolCall.function.arguments) });
    }

    return jsonResponse({ error: "Not found. Available routes: skills/{job_title}, analyze, trending" }, 404);
  } catch (e) {
    console.error("api-gateway error:", e);
    return jsonResponse({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }

  function jsonResponse(body: unknown, status = 200) {
    return new Response(JSON.stringify(body, null, 2), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  async function handleAIError(response: Response) {
    if (response.status === 429) {
      return jsonResponse({ error: "Rate limit exceeded. Please try again shortly." }, 429);
    }
    if (response.status === 402) {
      return jsonResponse({ error: "AI usage limit reached." }, 402);
    }
    const t = await response.text();
    console.error("AI gateway error:", response.status, t);
    throw new Error(`AI gateway error: ${response.status}`);
  }
});
