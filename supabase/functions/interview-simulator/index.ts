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

    const { action, role, level, interviewType, answer, question, keyConcepts } = await req.json();
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY is not configured");

    const gateway = "https://openrouter.ai/api/v1/chat/completions";
    const headers = {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    };

    if (action === "generate-questions") {
      const response = await fetch(gateway, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: "google/gemma-4-27b-it",
          messages: [
            {
              role: "system",
              content: `You are a senior technical interviewer at a top tech company interviewing for ${role} at ${level} experience level. Generate 8 realistic interview questions. Interview type: ${interviewType}.`
            },
            {
              role: "user",
              content: `Generate exactly 8 interview questions for a "${role}" position at "${level}" level. Type: "${interviewType}". Mix difficulties. Each question must have key concepts the ideal answer should cover.`
            }
          ],
          tools: [{
            type: "function",
            function: {
              name: "return_questions",
              description: "Return interview questions with key concepts",
              parameters: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "number" },
                        question: { type: "string" },
                        type: { type: "string", enum: ["technical", "behavioral"] },
                        topic: { type: "string" },
                        difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
                        key_concepts: { type: "array", items: { type: "string" } },
                        ideal_answer_points: { type: "array", items: { type: "string" } }
                      },
                      required: ["id", "question", "type", "topic", "difficulty", "key_concepts", "ideal_answer_points"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["questions"],
                additionalProperties: false
              }
            }
          }],
          tool_choice: { type: "function", function: { name: "return_questions" } }
        }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (status === 402) return new Response(JSON.stringify({ error: "AI usage limit reached" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw new Error("AI gateway error");
      }

      const result = await response.json();
      const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
      const questions = JSON.parse(toolCall.function.arguments).questions;
      return new Response(JSON.stringify({ questions }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "evaluate-answer") {
      const response = await fetch(gateway, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: "google/gemma-4-27b-it",
          messages: [
            {
              role: "system",
              content: `You are an expert interview evaluator for ${role} roles. Evaluate answers with precision. Key concepts expected: ${(keyConcepts || []).join(", ")}.`
            },
            {
              role: "user",
              content: `Evaluate this interview answer.\n\nQuestion: "${question}"\nCandidate's Answer: "${answer}"\nKey concepts expected: ${(keyConcepts || []).join(", ")}\n\nScore each dimension 0-10. Identify which keywords/concepts were found and which were missed.`
            }
          ],
          tools: [{
            type: "function",
            function: {
              name: "return_evaluation",
              description: "Return detailed evaluation with keyword detection",
              parameters: {
                type: "object",
                properties: {
                  relevance: { type: "number", description: "Score 0-10" },
                  clarity: { type: "number", description: "Score 0-10" },
                  technical: { type: "number", description: "Score 0-10" },
                  overall: { type: "number", description: "Score 0-10" },
                  keywords_found: { type: "array", items: { type: "string" } },
                  keywords_missed: { type: "array", items: { type: "string" } },
                  feedback: { type: "string" },
                  ideal_hint: { type: "string", description: "Brief ideal answer structure" }
                },
                required: ["relevance", "clarity", "technical", "overall", "keywords_found", "keywords_missed", "feedback", "ideal_hint"],
                additionalProperties: false
              }
            }
          }],
          tool_choice: { type: "function", function: { name: "return_evaluation" } }
        }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (status === 402) return new Response(JSON.stringify({ error: "AI usage limit reached" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw new Error("AI gateway error");
      }

      const result = await response.json();
      const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
      const evaluation = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(evaluation), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("interview-simulator error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
