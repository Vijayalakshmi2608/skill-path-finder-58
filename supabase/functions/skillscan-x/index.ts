import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
const MODEL = "google/gemini-2.5-flash";
const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

async function callTool(systemMsg: string, userMsg: string, toolName: string, parameters: Record<string, unknown>) {
  const KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!KEY) throw new Error("LOVABLE_API_KEY not configured");
  const resp = await fetch(GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemMsg },
        { role: "user", content: userMsg },
      ],
      tools: [{ type: "function", function: { name: toolName, description: "Return JSON", parameters } }],
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

const ok = (data: unknown) =>
  new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Auth gate
    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
    const token = authHeader?.replace(/^Bearer\s+/i, "").trim();
    if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const supa = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: u, error: uErr } = await supa.auth.getUser(token);
    if (uErr || !u?.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const body = await req.json();
    const { action } = body;
    const skills = Array.isArray(body.skills) ? body.skills : [];
    const jobTitle = body.jobTitle || "Software Engineer";

    if (action === "skill-graph") {
      const res = await callTool(
        "You are a career graph engine. Build a skill dependency graph for a target role.",
        `Target role: ${jobTitle}\nCandidate skills: ${skills.join(", ") || "none"}\n\nReturn 12-16 skill nodes that map the path from candidate -> role. Each node: name, category (foundation|core|advanced|specialization), status (have|learning|missing), x (0-100), y (0-100), importance (1-10). Layout nodes so foundations are left (x<30), core middle (30-60), advanced/specialization right (>60). Also return 10-18 edges (from->to indices) representing prerequisites.`,
        "graph",
        {
          type: "object",
          properties: {
            nodes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  category: { type: "string" },
                  status: { type: "string" },
                  x: { type: "number" },
                  y: { type: "number" },
                  importance: { type: "number" },
                },
                required: ["name", "category", "status", "x", "y", "importance"],
              },
            },
            edges: {
              type: "array",
              items: {
                type: "object",
                properties: { from: { type: "number" }, to: { type: "number" } },
                required: ["from", "to"],
              },
            },
          },
          required: ["nodes", "edges"],
        },
      );
      return ok(res);
    }

    if (action === "career-gps") {
      const res = await callTool(
        "You are Career GPS. You output career path navigation as if Google Maps for careers.",
        `Candidate skills: ${skills.join(", ") || "none"}\nTarget role: ${jobTitle}\n\nReturn: progress_percent toward target (0-100), 3-4 path steps from current to target (each: role, skills_to_add[3], months, salary_lpa), and 4 adjacent careers (role, similarity 0-100, why).`,
        "gps",
        {
          type: "object",
          properties: {
            progress_percent: { type: "number" },
            current_role_label: { type: "string" },
            path: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  role: { type: "string" },
                  skills_to_add: { type: "array", items: { type: "string" } },
                  months: { type: "number" },
                  salary_lpa: { type: "number" },
                },
                required: ["role", "skills_to_add", "months", "salary_lpa"],
              },
            },
            adjacent: {
              type: "array",
              items: {
                type: "object",
                properties: { role: { type: "string" }, similarity: { type: "number" }, why: { type: "string" } },
                required: ["role", "similarity", "why"],
              },
            },
          },
          required: ["progress_percent", "current_role_label", "path", "adjacent"],
        },
      );
      return ok(res);
    }

    if (action === "hiring-probability") {
      const res = await callTool(
        "You are a hiring probability model that returns realistic, slightly conservative numbers.",
        `Skills: ${skills.join(", ") || "none"}\nTarget: ${jobTitle}\n\nReturn current shortlist/interview/hire probabilities, projected after_upgrade probabilities, and 4 top levers (action, probability_lift) to most increase hire probability.`,
        "prob",
        {
          type: "object",
          properties: {
            current: {
              type: "object",
              properties: {
                shortlist: { type: "number" },
                interview: { type: "number" },
                hire: { type: "number" },
              },
              required: ["shortlist", "interview", "hire"],
            },
            after_upgrade: {
              type: "object",
              properties: {
                shortlist: { type: "number" },
                interview: { type: "number" },
                hire: { type: "number" },
              },
              required: ["shortlist", "interview", "hire"],
            },
            top_levers: {
              type: "array",
              items: {
                type: "object",
                properties: { action: { type: "string" }, probability_lift: { type: "number" } },
                required: ["action", "probability_lift"],
              },
            },
          },
          required: ["current", "after_upgrade", "top_levers"],
        },
      );
      return ok(res);
    }

    if (action === "market-intel") {
      const res = await callTool(
        "You are a labor market intelligence analyst. Use realistic 2025 tech trends.",
        `Target role: ${jobTitle}\n\nReturn 8 trending skills (skill, demand_change_pct -50..+200, current_demand 0-100), 4 rising tech categories (name, growth_pct), 6 months of demand trend points (month, demand_index 50-150), and 5 regional hotspots (city, demand_index 0-100, top_skill).`,
        "market",
        {
          type: "object",
          properties: {
            trending: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  skill: { type: "string" },
                  demand_change_pct: { type: "number" },
                  current_demand: { type: "number" },
                },
                required: ["skill", "demand_change_pct", "current_demand"],
              },
            },
            rising: {
              type: "array",
              items: {
                type: "object",
                properties: { name: { type: "string" }, growth_pct: { type: "number" } },
                required: ["name", "growth_pct"],
              },
            },
            trend: {
              type: "array",
              items: {
                type: "object",
                properties: { month: { type: "string" }, demand_index: { type: "number" } },
                required: ["month", "demand_index"],
              },
            },
            hotspots: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  city: { type: "string" },
                  demand_index: { type: "number" },
                  top_skill: { type: "string" },
                },
                required: ["city", "demand_index", "top_skill"],
              },
            },
          },
          required: ["trending", "rising", "trend", "hotspots"],
        },
      );
      return ok(res);
    }

    if (action === "recruiter-sim") {
      const res = await callTool(
        "You are a senior recruiter scanning a resume in 8 seconds. Be brutally honest but constructive.",
        `Candidate skills: ${skills.join(", ") || "none"}\nTarget: ${jobTitle}\n\nReturn trust_score (0-100), recruiter_verdict ("strong-yes"|"maybe"|"weak-no"|"reject"), 4 scan heatmap regions (label like "Skills section","Experience","Projects","Education" with attention 0-100 and color "green"|"amber"|"red"), 4 rejection_reasons (concise), and 3 fix_priorities (action, impact_pct).`,
        "rec",
        {
          type: "object",
          properties: {
            trust_score: { type: "number" },
            recruiter_verdict: { type: "string" },
            heatmap: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  label: { type: "string" },
                  attention: { type: "number" },
                  color: { type: "string" },
                },
                required: ["label", "attention", "color"],
              },
            },
            rejection_reasons: { type: "array", items: { type: "string" } },
            fix_priorities: {
              type: "array",
              items: {
                type: "object",
                properties: { action: { type: "string" }, impact_pct: { type: "number" } },
                required: ["action", "impact_pct"],
              },
            },
          },
          required: ["trust_score", "recruiter_verdict", "heatmap", "rejection_reasons", "fix_priorities"],
        },
      );
      return ok(res);
    }

    if (action === "forecast") {
      const res = await callTool(
        "You are a career forecasting engine. Project realistic 90-day outcomes with effort.",
        `Skills: ${skills.join(", ") || "none"}\nTarget: ${jobTitle}\n\nReturn 4 timepoints (Today, 30d, 60d, 90d) with employability_score, salary_lpa, interview_success_pct, role_readiness_pct. Also one motivational headline (max 12 words).`,
        "fc",
        {
          type: "object",
          properties: {
            headline: { type: "string" },
            points: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  label: { type: "string" },
                  employability_score: { type: "number" },
                  salary_lpa: { type: "number" },
                  interview_success_pct: { type: "number" },
                  role_readiness_pct: { type: "number" },
                },
                required: ["label", "employability_score", "salary_lpa", "interview_success_pct", "role_readiness_pct"],
              },
            },
          },
          required: ["headline", "points"],
        },
      );
      return ok(res);
    }

    if (action === "github-intel") {
      // Lightweight: synthesize an analysis from user-provided GitHub stats (fetched on the frontend)
      const { gh } = body;
      const res = await callTool(
        "You are an engineering-credibility analyst evaluating a GitHub profile.",
        `GitHub profile data: ${JSON.stringify(gh).slice(0, 4000)}\n\nReturn engineering_credibility (0-100), technical_consistency (0-100), portfolio_strength (0-100), 3 strengths, 3 weaknesses, and 6 radar axes (axis, score 0-100). Axes: Activity, Diversity, Depth, Documentation, Modern Stack, Collaboration.`,
        "ghi",
        {
          type: "object",
          properties: {
            engineering_credibility: { type: "number" },
            technical_consistency: { type: "number" },
            portfolio_strength: { type: "number" },
            strengths: { type: "array", items: { type: "string" } },
            weaknesses: { type: "array", items: { type: "string" } },
            radar: {
              type: "array",
              items: {
                type: "object",
                properties: { axis: { type: "string" }, score: { type: "number" } },
                required: ["axis", "score"],
              },
            },
          },
          required: ["engineering_credibility", "technical_consistency", "portfolio_strength", "strengths", "weaknesses", "radar"],
        },
      );
      return ok(res);
    }

    if (action === "project-ideas") {
      const { missing } = body;
      const res = await callTool(
        "You are a portfolio project architect. Generate impressive projects to close skill gaps.",
        `Target: ${jobTitle}\nMissing skills: ${(missing || []).join(", ") || "general"}\n\nReturn 3 projects (title, pitch one-liner, tech_stack[5], features[4], architecture (3 sentences), milestones[4 weeks: title, deliverable], readme_intro (2 sentences), employability_boost_pct).`,
        "proj",
        {
          type: "object",
          properties: {
            projects: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  pitch: { type: "string" },
                  tech_stack: { type: "array", items: { type: "string" } },
                  features: { type: "array", items: { type: "string" } },
                  architecture: { type: "string" },
                  milestones: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: { title: { type: "string" }, deliverable: { type: "string" } },
                      required: ["title", "deliverable"],
                    },
                  },
                  readme_intro: { type: "string" },
                  employability_boost_pct: { type: "number" },
                },
                required: ["title", "pitch", "tech_stack", "features", "architecture", "milestones", "readme_intro", "employability_boost_pct"],
              },
            },
          },
          required: ["projects"],
        },
      );
      return ok(res);
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    if (e instanceof Response) return new Response(e.body, { status: e.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    console.error("skillscan-x error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
