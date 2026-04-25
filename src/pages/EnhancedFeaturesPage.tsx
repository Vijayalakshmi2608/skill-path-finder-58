import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, Legend, Tooltip,
} from "recharts";
import {
  ArrowRight, Briefcase, CheckCircle2, RefreshCw, Sparkles, Target,
  TrendingUp, Trophy, XCircle, Zap, AlertCircle, Loader2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAnalyze } from "@/contexts/AnalyzeContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ---------- Helpers ----------
async function callEnhance<T = any>(action: string, payload: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("enhance-features", {
    body: { action, ...payload },
  });
  if (error) throw new Error(error.message || "Request failed");
  if (data?.error) throw new Error(data.error);
  return data as T;
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const scoreColor = (s: number) =>
  s <= 40 ? "#ef4444" : s <= 70 ? "#f59e0b" : "#22c55e";

// ============================================================
// FEATURE 1 — JD MATCH ANALYZER
// ============================================================
interface JDMatch {
  match_percent: number;
  matched_skills: string[];
  missing_skills: string[];
  advice: string;
}

const CircularRing = ({ value, color }: { value: number; color: string }) => {
  const r = 70;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative w-44 h-44">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={r} stroke="hsl(var(--border))" strokeWidth="12" fill="none" />
        <motion.circle
          cx="80" cy="80" r={r} stroke={color} strokeWidth="12" fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-heading font-extrabold text-foreground">{value}%</span>
        <span className="text-xs text-muted-foreground uppercase tracking-wider">Match</span>
      </div>
    </div>
  );
};

const JDMatchSection = ({ skills, jobTitle }: { skills: string[]; jobTitle?: string }) => {
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<JDMatch | null>(null);

  const run = async () => {
    if (!jd.trim()) {
      toast.error("Please paste a job description first");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await callEnhance<JDMatch>("jd-match", { jobDescription: jd, skills, jobTitle });
      setResult(data);
    } catch (e: any) {
      setError(e.message);
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.section {...fadeUp} className="card-surface p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
          <Briefcase className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-foreground">Job Match Analyzer</h2>
          <p className="text-sm text-muted-foreground">Paste any job description — see exactly how well you match.</p>
        </div>
      </div>

      <textarea
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        placeholder="Paste the full job description here…"
        rows={8}
        className="w-full mt-4 rounded-lg bg-muted border border-border p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
      />

      <button
        onClick={run}
        disabled={loading}
        className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 disabled:opacity-50 transition-all"
      >
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</> : <><Sparkles className="w-4 h-4" /> Analyze Match</>}
      </button>

      {error && (
        <div className="mt-4 flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
          <AlertCircle className="w-4 h-4" /> {error}
          <button onClick={run} className="ml-auto inline-flex items-center gap-1 text-xs underline">
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 grid md:grid-cols-[auto_1fr] gap-6 items-start"
          >
            <div className="flex justify-center">
              <CircularRing value={Math.round(result.match_percent)} color={scoreColor(result.match_percent)} />
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase text-muted-foreground tracking-wider mb-2">Matched Skills</p>
                <div className="flex flex-wrap gap-2">
                  {result.matched_skills.length === 0 && <span className="text-sm text-muted-foreground">None detected</span>}
                  {result.matched_skills.map((s, i) => (
                    <motion.span
                      key={s + i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    >
                      ✓ {s}
                    </motion.span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground tracking-wider mb-2">Missing Skills</p>
                <div className="flex flex-wrap gap-2">
                  {result.missing_skills.length === 0 && <span className="text-sm text-muted-foreground">Nothing critical missing 🎉</span>}
                  {result.missing_skills.map((s, i) => (
                    <motion.span
                      key={s + i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-rose-500/15 text-rose-400 border border-rose-500/30"
                    >
                      ✗ {s}
                    </motion.span>
                  ))}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs uppercase text-muted-foreground tracking-wider mb-1">Application Advice</p>
                <p className="text-sm text-foreground/90 italic">{result.advice}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

// ============================================================
// FEATURE 2 — GAP DASHBOARD (gauge + radar)
// ============================================================
const SemiGauge = ({ score }: { score: number }) => {
  const projected = Math.min(100, score + 20);
  const color = scoreColor(score);
  const angle = -90 + (score / 100) * 180;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-72 h-40">
        <svg viewBox="0 0 200 110" className="w-full h-full">
          <path d="M 20 100 A 80 80 0 0 1 180 100" stroke="hsl(var(--border))" strokeWidth="14" fill="none" strokeLinecap="round" />
          <motion.path
            d="M 20 100 A 80 80 0 0 1 180 100"
            stroke={color}
            strokeWidth="14"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="251.3"
            initial={{ strokeDashoffset: 251.3 }}
            animate={{ strokeDashoffset: 251.3 - (score / 100) * 251.3 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
          />
          <motion.circle
            cx="100" cy="100" r="6" fill={color}
            initial={{ cx: 100, cy: 100 }}
            animate={{
              cx: 100 + 80 * Math.cos((angle * Math.PI) / 180),
              cy: 100 + 80 * Math.sin((angle * Math.PI) / 180),
            }}
            transition={{ duration: 1.4, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
          <span className="text-5xl font-heading font-extrabold" style={{ color }}>{score}</span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Readiness</span>
        </div>
      </div>
      <p className="mt-3 text-sm text-emerald-400">
        Projected after 30 days: <span className="font-bold">{projected}%</span>
      </p>
    </div>
  );
};

const defaultRadar = (skills: string[]) => {
  const base = Math.min(80, 30 + skills.length * 4);
  return [
    { axis: "Technical Skills", current: base, required: 85 },
    { axis: "Communication", current: 60, required: 75 },
    { axis: "Problem Solving", current: 65, required: 80 },
    { axis: "Industry Knowledge", current: 50, required: 70 },
    { axis: "Tools & Frameworks", current: base - 5, required: 80 },
    { axis: "Portfolio Strength", current: 45, required: 70 },
  ];
};

const GapDashboard = ({ score, skills, jobTitle }: { score: number; skills: string[]; jobTitle?: string }) => {
  const [radarData, setRadarData] = useState(() => defaultRadar(skills));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await callEnhance<{ axes: { axis: string; current: number; required: number }[] }>(
          "radar-skills",
          { jobTitle, skills, gapScore: score },
        );
        if (mounted && res?.axes?.length) setRadarData(res.axes);
      } catch {
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <motion.section {...fadeUp} className="card-surface p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
          <Target className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-foreground">Gap Score Dashboard</h2>
          <p className="text-sm text-muted-foreground">Your readiness, mapped across every dimension recruiters care about.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-center">
        <SemiGauge score={score} />

        <div className="w-full h-[340px]">
          {loading ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Building radar…
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="axis" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <Radar name="Your Current Level" dataKey="current" stroke="#6366f1" fill="#6366f1" fillOpacity={0.45} />
                <Radar name="Role Required Level" dataKey="required" stroke="#94a3b8" fill="transparent" strokeDasharray="4 3" />
                <Legend wrapperStyle={{ color: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </motion.section>
  );
};

// ============================================================
// FEATURE 3 — MOCK INTERVIEW
// ============================================================
interface MockQ { question: string; topic: string }
interface Eval { score: number; good: string; improve: string; suggested_answer: string }

const MockInterviewSection = ({ jobTitle, level }: { jobTitle?: string; level?: string }) => {
  const [questions, setQuestions] = useState<MockQ[]>([]);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [evalRes, setEvalRes] = useState<Eval | null>(null);
  const [loadingQ, setLoadingQ] = useState(false);
  const [loadingE, setLoadingE] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadQs = async () => {
    setLoadingQ(true);
    setError(null);
    try {
      const data = await callEnhance<{ questions: MockQ[] }>("mock-questions", { jobTitle, level });
      setQuestions(data.questions || []);
      setIdx(0);
      setAnswer("");
      setEvalRes(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingQ(false);
    }
  };

  useEffect(() => { loadQs(); }, []);

  const submit = async () => {
    if (!answer.trim()) {
      toast.error("Type your answer first");
      return;
    }
    setLoadingE(true);
    try {
      const data = await callEnhance<Eval>("evaluate-answer", {
        question: questions[idx]?.question,
        answer,
        jobTitle,
      });
      setEvalRes(data);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoadingE(false);
    }
  };

  const next = () => {
    if (idx + 1 >= questions.length) {
      toast.success("🎉 You've completed all 5 questions!");
      return;
    }
    setIdx(idx + 1);
    setAnswer("");
    setEvalRes(null);
  };

  const q = questions[idx];

  return (
    <motion.section {...fadeUp} className="card-surface p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-foreground">AI Mock Interview</h2>
            <p className="text-sm text-muted-foreground">Live answer scoring — practice like it's the real thing.</p>
          </div>
        </div>
        {questions.length > 0 && (
          <span className="text-xs px-3 py-1 rounded-full bg-primary/15 text-primary border border-primary/30">
            Question {idx + 1} of {questions.length}
          </span>
        )}
      </div>

      {loadingQ && (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Generating questions…</div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
          <AlertCircle className="w-4 h-4" /> {error}
          <button onClick={loadQs} className="ml-auto inline-flex items-center gap-1 text-xs underline">
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}

      {q && (
        <>
          <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-lg bg-muted/40 border border-border mb-4">
            <p className="text-xs uppercase tracking-wider text-primary mb-2">{q.topic}</p>
            <p className="text-base text-foreground">{q.question}</p>
          </motion.div>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here…"
            rows={6}
            className="w-full rounded-lg bg-muted border border-border p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
          />
          <div className="flex gap-3 mt-4 flex-wrap">
            <button
              onClick={submit}
              disabled={loadingE}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 disabled:opacity-50"
            >
              {loadingE ? <><Loader2 className="w-4 h-4 animate-spin" /> Scoring…</> : <>Submit Answer</>}
            </button>
            <button
              onClick={next}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-foreground text-sm hover:border-primary/50"
            >
              Next Question <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <AnimatePresence>
            {evalRes && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-6 grid sm:grid-cols-[auto_1fr] gap-5 p-5 rounded-lg bg-card border border-border"
              >
                <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted/40">
                  <div className="text-5xl font-heading font-extrabold" style={{ color: scoreColor(evalRes.score * 10) }}>
                    {evalRes.score}<span className="text-xl text-muted-foreground">/10</span>
                  </div>
                  <p className="text-xs uppercase text-muted-foreground tracking-wider mt-1">Score</p>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-2 items-start">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <p className="text-sm"><span className="text-emerald-400 font-medium">Good:</span> {evalRes.good}</p>
                  </div>
                  <div className="flex gap-2 items-start">
                    <XCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <p className="text-sm"><span className="text-amber-400 font-medium">Improve:</span> {evalRes.improve}</p>
                  </div>
                  <div className="p-3 rounded-md bg-muted/40 border border-border">
                    <p className="text-xs uppercase text-muted-foreground tracking-wider mb-1">Suggested better answer</p>
                    <p className="text-sm text-foreground/90 italic">{evalRes.suggested_answer}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.section>
  );
};

// ============================================================
// FEATURE 4 — INTERACTIVE 30-DAY ROADMAP
// ============================================================
const buildRoadmapTasks = (jobTitle: string) => [
  {
    week: 1, title: "Week 1 — Foundations",
    tasks: [
      `Refresh core ${jobTitle} fundamentals`,
      "Set up your dev environment & tooling",
      "Read 1 industry article daily",
      "Build a tiny warm-up project",
    ],
  },
  {
    week: 2, title: "Week 2 — Core Skills",
    tasks: [
      "Learn the top missing skill from your gap report",
      "Complete 5 hands-on exercises",
      "Watch 2 deep-dive tutorials",
      "Pair-code or join a community session",
    ],
  },
  {
    week: 3, title: "Week 3 — Build Portfolio",
    tasks: [
      "Ship a small, end-to-end project",
      "Push code to GitHub with a clean README",
      "Write 1 blog post about what you learned",
      "Update your LinkedIn with new skills",
    ],
  },
  {
    week: 4, title: "Week 4 — Apply & Interview",
    tasks: [
      "Tailor your resume to 3 target jobs",
      "Apply to 10 roles this week",
      "Practice 5 mock interview questions",
      "Get feedback from a mentor or peer",
    ],
  },
];

const InteractiveRoadmap = ({ jobTitle }: { jobTitle?: string }) => {
  const role = jobTitle || "Your Role";
  const storageKey = `skillscan_roadmap_${role}`;
  const weeks = useMemo(() => buildRoadmapTasks(role), [role]);
  const totalTasks = weeks.reduce((n, w) => n + w.tasks.length, 0);

  const [done, setDone] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "{}");
    } catch { return {}; }
  });

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(done)); } catch { }
  }, [done, storageKey]);

  const completedCount = Object.values(done).filter(Boolean).length;
  const percent = Math.round((completedCount / totalTasks) * 100);
  const completedWeeks = weeks.filter((w) => w.tasks.every((_, i) => done[`${w.week}-${i}`])).length;
  const allDone = completedCount === totalTasks;

  const toggle = (k: string) => setDone((d) => ({ ...d, [k]: !d[k] }));
  const reset = () => {
    if (confirm("Reset all roadmap progress?")) {
      setDone({});
      toast.success("Roadmap reset");
    }
  };

  return (
    <motion.section {...fadeUp} className="card-surface p-6 sm:p-8">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-foreground">Interactive 30-Day Roadmap</h2>
            <p className="text-sm text-muted-foreground">Tick off tasks — your progress is saved automatically.</p>
          </div>
        </div>
        <button onClick={reset} className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          <RefreshCw className="w-3 h-3" /> Reset Progress
        </button>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>Week {Math.min(4, completedWeeks + (completedCount > 0 ? 1 : 0))} of 4 — {percent}% complete</span>
          <span>{completedCount}/{totalTasks} tasks</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center font-medium"
          >
            🎉 Roadmap complete! You're ready to apply.
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-2 gap-4">
        {weeks.map((w) => (
          <div key={w.week} className="p-4 rounded-lg bg-muted/30 border border-border">
            <h3 className="text-base font-heading font-semibold text-foreground mb-3">{w.title}</h3>
            <ul className="space-y-2">
              {w.tasks.map((t, i) => {
                const k = `${w.week}-${i}`;
                const checked = !!done[k];
                return (
                  <li key={k}>
                    <label className="flex items-start gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(k)}
                        className="mt-0.5 w-4 h-4 accent-emerald-500 cursor-pointer"
                      />
                      <span className={checked ? "line-through text-emerald-400" : "text-foreground/90"}>{t}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </motion.section>
  );
};

// ============================================================
// FEATURE 5 — SALARY PREDICTION
// ============================================================
interface Salary {
  current_min_lpa: number;
  current_max_lpa: number;
  projected_min_lpa: number;
  projected_max_lpa: number;
  top_companies: string[];
  value_insight: string;
}

const SalaryPrediction = ({ jobTitle, skills, gapScore, level }: { jobTitle?: string; skills: string[]; gapScore: number; level?: string }) => {
  const [data, setData] = useState<Salary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await callEnhance<Salary>("salary-predict", { jobTitle, skills, gapScore, level });
      setData(res);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const max = data ? Math.max(data.current_max_lpa, data.projected_max_lpa) : 1;

  return (
    <motion.section {...fadeUp} className="card-surface p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-foreground">Market Value Estimator</h2>
          <p className="text-sm text-muted-foreground">What you can earn now — and after closing your skill gaps.</p>
        </div>
      </div>

      {loading && <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Estimating market value…</div>}
      {error && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
          <AlertCircle className="w-4 h-4" /> {error}
          <button onClick={load} className="ml-auto inline-flex items-center gap-1 text-xs underline"><RefreshCw className="w-3 h-3" /> Retry</button>
        </div>
      )}

      {data && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <p className="text-xs uppercase text-muted-foreground tracking-wider mb-2">Current Range</p>
              <p className="text-2xl font-heading font-bold text-foreground mb-2">
                ₹{data.current_min_lpa}–{data.current_max_lpa} <span className="text-sm text-muted-foreground">LPA</span>
              </p>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(data.current_max_lpa / max) * 100}%` }}
                  transition={{ duration: 1 }}
                  className="h-full bg-muted-foreground/60"
                />
              </div>
            </div>
            <div>
              <p className="text-xs uppercase text-emerald-400 tracking-wider mb-2">Projected Range</p>
              <p className="text-2xl font-heading font-bold text-emerald-400 mb-2">
                ₹{data.projected_min_lpa}–{data.projected_max_lpa} <span className="text-sm text-muted-foreground">LPA</span>
              </p>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(data.projected_max_lpa / max) * 100}%` }}
                  transition={{ duration: 1.2 }}
                  className="h-full bg-emerald-500"
                />
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase text-muted-foreground tracking-wider mb-2">Top companies hiring now</p>
            <div className="flex flex-wrap gap-2">
              {data.top_companies.map((c) => (
                <span key={c} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-muted border border-border text-foreground">
                  {c}
                </span>
              ))}
            </div>
          </div>

          <p className="italic text-sm text-muted-foreground">💡 {data.value_insight}</p>
        </div>
      )}
    </motion.section>
  );
};

// ============================================================
// PAGE
// ============================================================
const TABS = ["JD Match", "Gap Dashboard", "Mock Interview", "Roadmap", "Salary"] as const;
type Tab = typeof TABS[number];

const EnhancedFeaturesPage = () => {
  const { data } = useAnalyze();
  const skills = data.parsedResume?.skills?.map((s) => s.name) || data.detectedSkills || [];
  const jobTitle = data.jobTitle || "Software Engineer";
  const level = data.experienceLevel || "Entry";
  const score = data.skillAnalysis?.readiness_score ?? 50;
  const [tab, setTab] = useState<Tab>("JD Match");
  const tabRef = useRef<HTMLDivElement>(null);

  const noResume = !data.parsedResume && !data.skillAnalysis;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-28 pb-10 border-b border-border">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm text-muted-foreground mb-1">Hackathon Edition ✨</p>
            <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-foreground">
              Enhanced AI Tools
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Match yourself to any JD, visualize gaps on a radar, practice with live AI scoring, work through an interactive roadmap, and see your market salary potential — all powered by AI.
            </p>
          </motion.div>

          {noResume && (
            <div className="mt-5 flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/30 text-sm">
              <AlertCircle className="w-4 h-4 text-primary shrink-0" />
              <span className="text-foreground/90">Tip: Run a resume analysis first for personalized results.</span>
              <Link to="/analyze" className="ml-auto inline-flex items-center gap-1 text-primary font-medium">
                Analyze now <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}

          <div ref={tabRef} className="mt-6 flex gap-2 flex-wrap">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  tab === t
                    ? "bg-primary text-primary-foreground border-primary glow-box-blue"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="py-10">
        <div className="section-container space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {tab === "JD Match" && <JDMatchSection skills={skills} jobTitle={jobTitle} />}
              {tab === "Gap Dashboard" && <GapDashboard score={score} skills={skills} jobTitle={jobTitle} />}
              {tab === "Mock Interview" && <MockInterviewSection jobTitle={jobTitle} level={level} />}
              {tab === "Roadmap" && <InteractiveRoadmap jobTitle={jobTitle} />}
              {tab === "Salary" && <SalaryPrediction jobTitle={jobTitle} skills={skills} gapScore={score} level={level} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default EnhancedFeaturesPage;
