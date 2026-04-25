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

    const { action, role, answer, question, questionIndex, totalQuestions } = await req.json();
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY is not configured");

    if (action === "generate-questions") {
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
              content: "You are an expert technical interviewer. Generate interview questions."
            },
            {
              role: "user",
              content: `Generate exactly 5 interview questions for a "${role}" position. Mix behavioral and technical questions. Return JSON array of objects with fields: "question" (string), "type" ("technical" | "behavioral" | "situational"), "difficulty" ("easy" | "medium" | "hard"), "topic" (string). Return ONLY the JSON array, no markdown.`
            }
          ],
          tools: [{
            type: "function",
            function: {
              name: "return_questions",
              description: "Return interview questions",
              parameters: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string" },
                        type: { type: "string", enum: ["technical", "behavioral", "situational"] },
                        difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
                        topic: { type: "string" }
                      },
                      required: ["question", "type", "difficulty", "topic"],
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
              content: "You are an expert interview evaluator. Analyze interview answers with precision."
            },
            {
              role: "user",
              content: `Evaluate this interview answer for a "${role}" role.\n\nQuestion: "${question}"\nCandidate's Answer: "${answer}"\n\nProvide detailed evaluation.`
            }
          ],
          tools: [{
            type: "function",
            function: {
              name: "return_evaluation",
              description: "Return the evaluation of the interview answer",
              parameters: {
                type: "object",
                properties: {
                  technical_accuracy: { type: "number", description: "Score 0-100" },
                  communication_clarity: { type: "number", description: "Score 0-100" },
                  confidence_level: { type: "number", description: "Score 0-100" },
                  overall_score: { type: "number", description: "Score 0-100" },
                  strengths: { type: "array", items: { type: "string" } },
                  improvements: { type: "array", items: { type: "string" } },
                  ideal_answer: { type: "string", description: "A concise sample ideal answer" },
                  specific_feedback: { type: "string", description: "2-3 sentences of specific feedback" }
                },
                required: ["technical_accuracy", "communication_clarity", "confidence_level", "overall_score", "strengths", "improvements", "ideal_answer", "specific_feedback"],
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
    console.error("mock-interview error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
