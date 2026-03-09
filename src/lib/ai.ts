import { supabase } from "@/integrations/supabase/client";

export interface ParsedResume {
  name: string;
  skills: { name: string; proficiency: "beginner" | "intermediate" | "advanced"; category: string }[];
  experience: { title: string; company: string; duration: string; skills_used: string[] }[];
  education: { degree: string; field: string; year: string };
  summary: string;
}

export interface SkillGapAnalysis {
  readiness_score: number;
  matched_skills: { name: string; proficiency: string; importance: "high" | "medium" | "low"; percent: number }[];
  missing_skills: { name: string; priority: "critical" | "important" | "nice-to-have"; learning_time_days: number; score_impact: number; reason: string; category: string }[];
  competitive_percentile: number;
  top_3_quick_wins: { skill: string; days_to_learn: number; score_boost: number }[];
  overall_feedback: string;
  skill_categories: { name: string; icon: string; skills: { name: string; status: "strong" | "learning" | "missing"; percent: number; reason?: string }[] }[];
  radar_data: { axis: string; required: number; current: number }[];
}

export interface GeneratedRoadmap {
  weeks: {
    week_number: number;
    title: string;
    subtitle: string;
    icon: string;
    skills: string[];
    days: {
      day: number;
      title: string;
      duration_minutes: number;
      is_rest?: boolean;
      tasks: {
        type: string;
        icon: string;
        title: string;
        duration_minutes?: number;
        platform?: string;
        is_free?: boolean;
        description?: string;
      }[];
      checkpoint: string;
    }[];
  }[];
}

export interface InterviewPrediction {
  success_rate: number;
  likely_topics: string[];
  top_3_to_prepare: string[];
  estimated_prep_days: number;
  company_insights: string;
}

export async function parseResume(resumeText: string): Promise<ParsedResume> {
  const { data, error } = await supabase.functions.invoke("parse-resume", {
    body: { resumeText },
  });
  if (error) throw new Error(error.message || "Failed to parse resume");
  if (data?.error) throw new Error(data.error);
  return data as ParsedResume;
}

export async function analyzeSkills(params: {
  skills: ParsedResume["skills"];
  jobTitle: string;
  targetCompanies?: string[];
  experienceLevel?: string;
  experience?: ParsedResume["experience"];
  education?: ParsedResume["education"];
}): Promise<SkillGapAnalysis> {
  const { data, error } = await supabase.functions.invoke("analyze-skills", {
    body: params,
  });
  if (error) throw new Error(error.message || "Failed to analyze skills");
  if (data?.error) throw new Error(data.error);
  return data as SkillGapAnalysis;
}

export async function generateRoadmap(params: {
  missingSkills: SkillGapAnalysis["missing_skills"];
  quickWins: SkillGapAnalysis["top_3_quick_wins"];
  timeCommitment?: string;
  learningStyles?: string[];
  budget?: number;
  jobTitle?: string;
  experienceLevel?: string;
}): Promise<GeneratedRoadmap> {
  const { data, error } = await supabase.functions.invoke("generate-roadmap", {
    body: params,
  });
  if (error) throw new Error(error.message || "Failed to generate roadmap");
  if (data?.error) throw new Error(data.error);
  return data as GeneratedRoadmap;
}

export async function predictInterview(params: {
  company: string;
  skills?: ParsedResume["skills"];
  jobTitle?: string;
  readinessScore?: number;
}): Promise<InterviewPrediction> {
  const { data, error } = await supabase.functions.invoke("interview-predictor", {
    body: params,
  });
  if (error) throw new Error(error.message || "Failed to predict interview");
  if (data?.error) throw new Error(data.error);
  return data as InterviewPrediction;
}

export type ChatMessage = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/career-chat`;

export async function streamChat({
  messages,
  userContext,
  onDelta,
  onDone,
  onError,
}: {
  messages: ChatMessage[];
  userContext?: Record<string, unknown>;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError?: (err: Error) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, userContext }),
  });

  if (!resp.ok) {
    const errData = await resp.json().catch(() => ({}));
    const err = new Error(errData.error || `Chat failed with status ${resp.status}`);
    onError?.(err);
    throw err;
  }

  if (!resp.body) throw new Error("No response body");

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") {
        streamDone = true;
        break;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  // Final flush
  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch { /* ignore */ }
    }
  }

  onDone();
}
