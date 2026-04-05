import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { resumeText } = await req.json();
    if (!resumeText || typeof resumeText !== "string" || resumeText.length > 50000) {
      return new Response(JSON.stringify({ error: "Invalid resume text" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
            content: `You are an expert resume parser. Extract skills, experience, education and return ONLY a JSON object with this exact structure:
{
  "name": "string",
  "skills": [{ "name": "string", "proficiency": "beginner"|"intermediate"|"advanced", "category": "string" }],
  "experience": [{ "title": "string", "company": "string", "duration": "string", "skills_used": ["string"] }],
  "education": { "degree": "string", "field": "string", "year": "string" },
  "summary": "string (2 sentences max)"
}
Return ONLY valid JSON. No markdown, no code blocks, no explanation.`,
          },
          { role: "user", content: resumeText },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "parse_resume",
              description: "Return parsed resume data as structured JSON",
              parameters: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  skills: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        proficiency: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
                        category: { type: "string" },
                      },
                      required: ["name", "proficiency", "category"],
                    },
                  },
                  experience: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        company: { type: "string" },
                        duration: { type: "string" },
                        skills_used: { type: "array", items: { type: "string" } },
                      },
                      required: ["title", "company", "duration", "skills_used"],
                    },
                  },
                  education: {
                    type: "object",
                    properties: {
                      degree: { type: "string" },
                      field: { type: "string" },
                      year: { type: "string" },
                    },
                    required: ["degree", "field", "year"],
                  },
                  summary: { type: "string" },
                },
                required: ["name", "skills", "experience", "education", "summary"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "parse_resume" } },
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
    console.error("parse-resume error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
