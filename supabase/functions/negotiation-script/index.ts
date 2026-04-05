import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { currentOffer, targetSalary, strongestSkill, yearsExperience, role, city } = await req.json();

    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY not configured");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemma-4-27b-it",
        messages: [
          { role: "system", content: "You are a salary negotiation coach. Generate a professional, confident negotiation script for an Indian tech professional. Keep it natural and conversational. Return only the script text, no JSON." },
          { role: "user", content: `Generate a salary negotiation script:
Role: ${role || 'Software Engineer'}
City: ${city || 'Bangalore'}
Current offer: ₹${currentOffer} LPA
Target salary: ₹${targetSalary} LPA
Strongest skill: ${strongestSkill || 'Python'}
Years of project experience: ${yearsExperience || '0'}

Write a 3-4 paragraph professional script they can use when asked about salary expectations.` }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const script = data.choices?.[0]?.message?.content || "Could not generate script";

    return new Response(JSON.stringify({ script }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("negotiation-script error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
