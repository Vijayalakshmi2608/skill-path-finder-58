import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { missingSkills, quickWins, timeCommitment, learningStyles, budget, jobTitle, experienceLevel } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const userPrompt = `
Target Role: ${jobTitle || "Software Engineer"}
Experience Level: ${experienceLevel || "Entry Level"}
Missing Skills: ${JSON.stringify(missingSkills || [])}
Quick Wins: ${JSON.stringify(quickWins || [])}
Time Commitment: ${timeCommitment || "1 hour/day"}
Learning Styles: ${(learningStyles || []).join(", ") || "Video Courses, Building Projects"}
Monthly Budget: ${budget != null ? `₹${budget}` : "Free only"}

Create a detailed 30-day learning roadmap. Include rest days every 7th day. Each day should have 2-5 tasks with real resource suggestions (YouTube channels, documentation links, practice platforms). Make it actionable and specific.
`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a senior career coach and curriculum designer. Create a detailed 30-day learning roadmap with 4 themed weeks. Return structured data using the provided tool. Make tasks specific with real platform names (YouTube, LeetCode, Coursera, freeCodeCamp, etc).`,
          },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_roadmap",
              description: "Return a 30-day learning roadmap",
              parameters: {
                type: "object",
                properties: {
                  weeks: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        week_number: { type: "number" },
                        title: { type: "string" },
                        subtitle: { type: "string" },
                        icon: { type: "string" },
                        skills: { type: "array", items: { type: "string" } },
                        days: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              day: { type: "number" },
                              title: { type: "string" },
                              duration_minutes: { type: "number" },
                              is_rest: { type: "boolean" },
                              tasks: {
                                type: "array",
                                items: {
                                  type: "object",
                                  properties: {
                                    type: { type: "string", enum: ["video", "reading", "practice", "project", "rest", "quiz", "checkpoint"] },
                                    icon: { type: "string" },
                                    title: { type: "string" },
                                    duration_minutes: { type: "number" },
                                    platform: { type: "string" },
                                    is_free: { type: "boolean" },
                                    description: { type: "string" },
                                  },
                                  required: ["type", "icon", "title"],
                                },
                              },
                              checkpoint: { type: "string" },
                            },
                            required: ["day", "title", "duration_minutes", "tasks", "checkpoint"],
                          },
                        },
                      },
                      required: ["week_number", "title", "subtitle", "icon", "skills", "days"],
                    },
                  },
                },
                required: ["weeks"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_roadmap" } },
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
    console.error("generate-roadmap error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
