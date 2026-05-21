import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity, Brain, Cpu, Github, MapPin, Network, Rocket, Sparkles,
  TrendingUp, Users, Zap, Target, Eye, FileCode2, Map, Loader2, AlertCircle, RefreshCw,
  Shield, GitBranch, ArrowUpRight,
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from "recharts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAnalyze } from "@/contexts/AnalyzeContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ───────────────────────── Helpers ─────────────────────────
const STATUS_COLOR: Record<string, string> = {
  have: "#10B981",
  learning: "#F59E0B",
  missing: "#FF6B6B",
};
const CAT_GLOW: Record<string, string> = {
  foundation: "#3B82F6",
  core: "#8B5CF6",
  advanced: "#06B6D4",
  specialization: "#10B981",
};

async function callAI<T>(action: string, body: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke("skillscan-x", { body: { action, ...body } });
  if (error) throw new Error(error.message || "AI request failed");
  if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
  return data as T;
}

function CountUp({ value, suffix = "", duration = 1200 }: { value: number; suffix?: string; duration?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const animate = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <>{n}{suffix}</>;
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] ${className}`}>
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle, accent = "#3B82F6" }: { icon: React.ComponentType<{ className?: string }>; title: string; subtitle?: string; accent?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="p-2.5 rounded-xl border" style={{ borderColor: `${accent}40`, background: `${accent}15`, boxShadow: `0 0 24px ${accent}30` }}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h2 className="text-xl font-heading font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function ErrorBox({ msg, onRetry }: { msg: string; onRetry: () => void }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/5">
      <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm text-foreground/90">{msg}</p>
        <button onClick={onRetry} className="mt-2 text-xs text-primary hover:underline flex items-center gap-1">
          <RefreshCw className="w-3 h-3" /> Retry
        </button>
      </div>
    </div>
  );
}

function Loader({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-sm text-muted-foreground">
      <Loader2 className="w-5 h-5 animate-spin text-primary" />
      <span>{label}</span>
    </div>
  );
}

// ───────────────────────── Multi-agent pipeline ─────────────────────────
const AGENTS = [
  { id: "resume", label: "Resume Agent", icon: FileCode2 },
  { id: "skill", label: "Skill Graph Agent", icon: Network },
  { id: "market", label: "Market Intelligence", icon: TrendingUp },
  { id: "optim", label: "Optimization Agent", icon: Cpu },
  { id: "forecast", label: "Forecast Agent", icon: Activity },
  { id: "interview", label: "Interview Agent", icon: Users },
];

function AgentPipeline({ running, completedIdx }: { running: boolean; completedIdx: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {AGENTS.map((a, i) => {
        const active = running && i === completedIdx + 1;
        const done = i <= completedIdx;
        return (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`relative rounded-xl border p-3 transition-all ${
              done ? "border-emerald-500/50 bg-emerald-500/5"
              : active ? "border-primary/50 bg-primary/10"
              : "border-white/10 bg-white/[0.02]"
            }`}
          >
            <div className="flex items-center gap-2">
              <a.icon className={`w-4 h-4 ${done ? "text-emerald-400" : active ? "text-primary" : "text-muted-foreground"}`} />
              <span className="text-xs font-medium truncate">{a.label}</span>
            </div>
            <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className={`h-full ${done ? "bg-emerald-500" : "bg-primary"}`}
                initial={{ width: 0 }}
                animate={{ width: done ? "100%" : active ? "60%" : "0%" }}
                transition={{ duration: 0.6 }}
              />
            </div>
            {active && (
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// ───────────────────────── Skill Graph SVG ─────────────────────────
type GNode = { name: string; category: string; status: string; x: number; y: number; importance: number };
type GEdge = { from: number; to: number };

function SkillGraphSVG({ nodes, edges }: { nodes: GNode[]; edges: GEdge[] }) {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div className="relative w-full h-[420px] rounded-xl border border-white/10 bg-gradient-to-br from-slate-950/60 to-indigo-950/30 overflow-hidden">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
        <defs>
          <filter id="glow"><feGaussianBlur stdDeviation="0.8" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        {edges.map((e, i) => {
          const a = nodes[e.from]; const b = nodes[e.to];
          if (!a || !b) return null;
          const active = hover !== null && (hover === e.from || hover === e.to);
          return (
            <motion.line
              key={i}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={active ? "#3B82F6" : "#ffffff"}
              strokeOpacity={active ? 0.9 : 0.12}
              strokeWidth={active ? 0.3 : 0.15}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, delay: i * 0.03 }}
            />
          );
        })}
        {nodes.map((n, i) => {
          const color = STATUS_COLOR[n.status] || "#3B82F6";
          const r = 1.4 + (n.importance / 10) * 1.6;
          return (
            <motion.circle
              key={i}
              cx={n.x} cy={n.y} r={r}
              fill={color} stroke={CAT_GLOW[n.category] || "#3B82F6"} strokeWidth={0.25}
              filter="url(#glow)"
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: i * 0.04, type: "spring", stiffness: 200 }}
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
              style={{ cursor: "pointer", transformOrigin: `${n.x}px ${n.y}px` }}
            />
          );
        })}
      </svg>
      {hover !== null && nodes[hover] && (
        <div
          className="absolute pointer-events-none px-3 py-1.5 rounded-lg border border-primary/40 bg-background/95 text-xs font-medium shadow-xl"
          style={{ left: `${nodes[hover].x}%`, top: `${nodes[hover].y}%`, transform: "translate(-50%, -120%)" }}
        >
          {nodes[hover].name}
          <span className="ml-2 opacity-60">· {nodes[hover].status}</span>
        </div>
      )}
      <div className="absolute bottom-3 left-3 flex gap-3 text-xs">
        {Object.entries(STATUS_COLOR).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: v }} />
            <span className="text-muted-foreground capitalize">{k}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ───────────────────────── Page ─────────────────────────
const SkillScanXPage = () => {
  const { data } = useAnalyze();
  const baseSkills = useMemo(
    () => (data.parsedResume?.skills?.map((s) => s.name) || data.detectedSkills || []),
    [data]
  );
  const jobTitle = data.jobTitle || "AI Engineer";

  // Pipeline state
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(-1);

  // Data state per feature
  const [graph, setGraph] = useState<{ nodes: GNode[]; edges: GEdge[] } | null>(null);
  const [gps, setGps] = useState<any>(null);
  const [prob, setProb] = useState<any>(null);
  const [market, setMarket] = useState<any>(null);
  const [recruiter, setRecruiter] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [ghIntel, setGhIntel] = useState<any>(null);
  const [projects, setProjects] = useState<any>(null);

  const [err, setErr] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  // GitHub
  const [ghUser, setGhUser] = useState("");
  const [ghLoading, setGhLoading] = useState(false);

  const run = async <T,>(key: string, fn: () => Promise<T>, setter: (v: T) => void) => {
    setLoading((p) => ({ ...p, [key]: true }));
    setErr((p) => { const n = { ...p }; delete n[key]; return n; });
    try {
      const r = await fn();
      setter(r);
    } catch (e) {
      setErr((p) => ({ ...p, [key]: e instanceof Error ? e.message : "Failed" }));
    } finally {
      setLoading((p) => ({ ...p, [key]: false }));
    }
  };

  const runPipeline = async () => {
    setPipelineRunning(true);
    setPipelineStep(-1);
    const steps = [
      () => run("graph", () => callAI("skill-graph", { skills: baseSkills, jobTitle }), setGraph),
      () => run("market", () => callAI("market-intel", { jobTitle }), setMarket),
      () => run("prob", () => callAI("hiring-probability", { skills: baseSkills, jobTitle }), setProb),
      () => run("gps", () => callAI("career-gps", { skills: baseSkills, jobTitle }), setGps),
      () => run("forecast", () => callAI("forecast", { skills: baseSkills, jobTitle }), setForecast),
      () => run("recruiter", () => callAI("recruiter-sim", { skills: baseSkills, jobTitle }), setRecruiter),
    ];
    for (let i = 0; i < steps.length; i++) {
      await steps[i]();
      setPipelineStep(i);
    }
    setPipelineRunning(false);
    toast.success("AI orchestration complete");
  };

  // Auto-kick on first load
  const startedRef = useRef(false);
  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      runPipeline();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derived top-level KPIs
  const employability = forecast?.points?.[0]?.employability_score ?? 0;
  const hireProb = prob?.current?.hire ?? 0;
  const resumeHealth = recruiter?.trust_score ?? 0;
  const gpsProgress = gps?.progress_percent ?? 0;

  // GitHub fetch
  const fetchGitHub = async () => {
    if (!ghUser.trim()) return toast.error("Enter a GitHub username");
    setGhLoading(true);
    try {
      const [profileRes, reposRes] = await Promise.all([
        fetch(`https://api.github.com/users/${encodeURIComponent(ghUser.trim())}`),
        fetch(`https://api.github.com/users/${encodeURIComponent(ghUser.trim())}/repos?per_page=30&sort=updated`),
      ]);
      if (!profileRes.ok) throw new Error("GitHub user not found");
      const profile = await profileRes.json();
      const repos = await reposRes.json();
      const summary = {
        login: profile.login,
        name: profile.name,
        public_repos: profile.public_repos,
        followers: profile.followers,
        created_at: profile.created_at,
        repos: (repos as any[]).slice(0, 20).map((r: any) => ({
          name: r.name, language: r.language, stars: r.stargazers_count,
          forks: r.forks_count, has_readme: !!r.description, updated: r.updated_at,
        })),
      };
      await run("github", () => callAI("github-intel", { jobTitle, gh: summary }), setGhIntel);
    } catch (e) {
      setErr((p) => ({ ...p, github: e instanceof Error ? e.message : "Failed" }));
    } finally {
      setGhLoading(false);
    }
  };

  const fetchProjects = () => {
    const missing = graph?.nodes?.filter((n) => n.status === "missing").map((n) => n.name).slice(0, 8) || [];
    run("projects", () => callAI("project-ideas", { jobTitle, missing }), setProjects);
  };

  return (
    <div className="min-h-screen bg-[#05050E] text-foreground relative overflow-hidden">
      {/* Ambient backdrop */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage: "radial-gradient(ellipse at center, #000 30%, transparent 75%)",
          }}
        />
      </div>

      <Navbar />

      <main className="relative section-container pt-28 pb-20 space-y-10">
        {/* Hero */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 mb-4">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-xs font-medium text-primary tracking-wider uppercase">SkillScan X · Employability OS</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-heading font-extrabold leading-[1.05]">
              Career intelligence,
              <br />
              <span className="bg-gradient-to-r from-primary via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                modeled as an optimization problem.
              </span>
            </h1>
            <p className="mt-4 text-muted-foreground max-w-xl text-sm md:text-base">
              Multi-agent AI, graph intelligence and predictive analytics — orchestrated for{" "}
              <span className="text-foreground font-medium">{jobTitle}</span>.
            </p>
          </div>
          <button
            onClick={runPipeline}
            disabled={pipelineRunning}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-primary/40 bg-primary/10 hover:bg-primary/20 text-sm font-semibold transition disabled:opacity-50"
          >
            {pipelineRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Re-orchestrate agents
          </button>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Employability", value: employability, suffix: "%", icon: Brain, color: "#3B82F6" },
            { label: "Hire Probability", value: hireProb, suffix: "%", icon: Target, color: "#10B981" },
            { label: "Resume Health", value: resumeHealth, suffix: "/100", icon: Shield, color: "#F59E0B" },
            { label: `Path to ${jobTitle}`, value: gpsProgress, suffix: "%", icon: Map, color: "#8B5CF6" },
          ].map((k, i) => (
            <motion.div
              key={k.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <GlassCard className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">{k.label}</span>
                  <k.icon className="w-4 h-4" style={{ color: k.color }} />
                </div>
                <div className="text-3xl font-heading font-bold" style={{ color: k.color }}>
                  <CountUp value={k.value} suffix={k.suffix} />
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: k.color, boxShadow: `0 0 12px ${k.color}` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, k.value)}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Agent Pipeline */}
        <GlassCard className="p-5">
          <SectionHeader icon={Cpu} title="Multi-Agent Orchestration" subtitle="Live pipeline of autonomous AI agents" accent="#8B5CF6" />
          <AgentPipeline running={pipelineRunning} completedIdx={pipelineStep} />
        </GlassCard>

        {/* Skill Graph */}
        <GlassCard className="p-5">
          <SectionHeader icon={Network} title="Skill Graph Engine" subtitle="Prerequisite network · hover any node" accent="#06B6D4" />
          {loading.graph && !graph ? <Loader label="Building skill graph…" /> :
            err.graph ? <ErrorBox msg={err.graph} onRetry={() => run("graph", () => callAI("skill-graph", { skills: baseSkills, jobTitle }), setGraph)} /> :
            graph ? <SkillGraphSVG nodes={graph.nodes} edges={graph.edges} /> : null
          }
        </GlassCard>

        {/* Career GPS + Hiring Probability */}
        <div className="grid lg:grid-cols-2 gap-6">
          <GlassCard className="p-5">
            <SectionHeader icon={Map} title="Career GPS" subtitle={`Route to ${jobTitle}`} accent="#8B5CF6" />
            {loading.gps && !gps ? <Loader label="Plotting career route…" /> :
              err.gps ? <ErrorBox msg={err.gps} onRetry={() => run("gps", () => callAI("career-gps", { skills: baseSkills, jobTitle }), setGps)} /> :
              gps ? (
                <div className="space-y-5">
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                    <div className="text-xs text-muted-foreground mb-1">You are here</div>
                    <div className="text-lg font-semibold">{gps.current_role_label} → <span className="text-primary"><CountUp value={gps.progress_percent} suffix="%" /></span> toward {jobTitle}</div>
                  </div>
                  <div className="relative">
                    <div className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-primary via-purple-400 to-emerald-400" />
                    {gps.path?.map((p: any, i: number) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="relative pl-12 pb-5">
                        <div className="absolute left-2.5 top-1 w-3 h-3 rounded-full bg-primary shadow-[0_0_12px_#3B82F6]" />
                        <div className="font-semibold">{p.role}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{p.months} months · ₹{p.salary_lpa} LPA</div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {p.skills_to_add?.map((s: string) => (
                            <span key={s} className="px-2 py-0.5 text-[10px] rounded-md border border-white/10 bg-white/5">{s}</span>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Adjacent careers</div>
                    <div className="grid grid-cols-2 gap-2">
                      {gps.adjacent?.map((a: any) => (
                        <div key={a.role} className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{a.role}</span>
                            <span className="text-xs text-emerald-400 font-mono">{a.similarity}%</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{a.why}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null
            }
          </GlassCard>

          <GlassCard className="p-5">
            <SectionHeader icon={Target} title="Hiring Probability Engine" subtitle="Predictive model with skill-upgrade lift" accent="#10B981" />
            {loading.prob && !prob ? <Loader label="Running probability model…" /> :
              err.prob ? <ErrorBox msg={err.prob} onRetry={() => run("prob", () => callAI("hiring-probability", { skills: baseSkills, jobTitle }), setProb)} /> :
              prob ? (
                <div className="space-y-5">
                  {["shortlist", "interview", "hire"].map((k) => {
                    const cur = prob.current[k] || 0;
                    const upd = prob.after_upgrade[k] || 0;
                    return (
                      <div key={k}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="capitalize text-muted-foreground">{k}</span>
                          <span className="font-mono">{cur}% → <span className="text-emerald-400">{upd}%</span></span>
                        </div>
                        <div className="relative h-2.5 rounded-full bg-white/5 overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${upd}%` }} transition={{ duration: 1.2, ease: "easeOut" }} className="absolute inset-y-0 left-0 bg-emerald-500/30" />
                          <motion.div initial={{ width: 0 }} animate={{ width: `${cur}%` }} transition={{ duration: 1, ease: "easeOut" }} className="absolute inset-y-0 left-0 bg-primary" style={{ boxShadow: "0 0 10px #3B82F6" }} />
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-3 border-t border-white/5">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Top levers</div>
                    <div className="space-y-2">
                      {prob.top_levers?.map((l: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-white/10 bg-white/[0.02]">
                          <span className="text-sm">{l.action}</span>
                          <span className="text-xs font-mono text-emerald-400">+{l.probability_lift}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null
            }
          </GlassCard>
        </div>

        {/* Market Intelligence */}
        <GlassCard className="p-5">
          <SectionHeader icon={TrendingUp} title="Live Market Intelligence" subtitle="Trending skills · demand shifts · hotspots" accent="#06B6D4" />
          {loading.market && !market ? <Loader label="Analyzing labor market…" /> :
            err.market ? <ErrorBox msg={err.market} onRetry={() => run("market", () => callAI("market-intel", { jobTitle }), setMarket)} /> :
            market ? (
              <div className="grid lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">6-month demand trend</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={market.trend}>
                      <defs>
                        <linearGradient id="dem" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.6} />
                          <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip contentStyle={{ background: "#0a0a1e", border: "1px solid #ffffff20", borderRadius: 8 }} />
                      <Area type="monotone" dataKey="demand_index" stroke="#06B6D4" strokeWidth={2} fill="url(#dem)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Rising tech</div>
                  {market.rising?.map((r: any) => (
                    <div key={r.name} className="flex items-center justify-between p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                      <span className="text-sm">{r.name}</span>
                      <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" />+{r.growth_pct}%
                      </span>
                    </div>
                  ))}
                </div>
                <div className="lg:col-span-2">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Trending skills</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {market.trending?.map((t: any) => (
                      <div key={t.skill} className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
                        <div className="text-xs font-medium truncate">{t.skill}</div>
                        <div className={`text-[10px] font-mono mt-1 ${t.demand_change_pct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {t.demand_change_pct >= 0 ? "▲" : "▼"} {Math.abs(t.demand_change_pct)}%
                        </div>
                        <div className="mt-1.5 h-1 rounded-full bg-white/5 overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${t.current_demand}%` }} transition={{ duration: 1 }} className="h-full bg-cyan-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Global hotspots</div>
                  <div className="space-y-2">
                    {market.hotspots?.map((h: any) => (
                      <div key={h.city} className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium truncate">{h.city}</span>
                            <span className="text-[10px] text-muted-foreground">{h.top_skill}</span>
                          </div>
                          <div className="h-1 rounded-full bg-white/5 overflow-hidden mt-0.5">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${h.demand_index}%` }} transition={{ duration: 1 }} className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null
          }
        </GlassCard>

        {/* Recruiter Sim + Forecast */}
        <div className="grid lg:grid-cols-2 gap-6">
          <GlassCard className="p-5">
            <SectionHeader icon={Eye} title="Recruiter Simulator" subtitle="8-second scan with attention heatmap" accent="#FF6B6B" />
            {loading.recruiter && !recruiter ? <Loader label="Simulating recruiter scan…" /> :
              err.recruiter ? <ErrorBox msg={err.recruiter} onRetry={() => run("recruiter", () => callAI("recruiter-sim", { skills: baseSkills, jobTitle }), setRecruiter)} /> :
              recruiter ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Recruiter verdict</div>
                      <div className="text-lg font-semibold capitalize">{recruiter.recruiter_verdict?.replace("-", " ")}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Trust score</div>
                      <div className="text-2xl font-heading font-bold text-amber-400"><CountUp value={recruiter.trust_score} /></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {recruiter.heatmap?.map((h: any) => (
                      <div key={h.label} className="rounded-lg border border-white/10 p-2.5 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-30" style={{
                          background: h.color === "green" ? "radial-gradient(circle, #10B981, transparent 70%)"
                            : h.color === "amber" ? "radial-gradient(circle, #F59E0B, transparent 70%)"
                            : "radial-gradient(circle, #FF6B6B, transparent 70%)"
                        }} />
                        <div className="relative">
                          <div className="text-xs font-medium">{h.label}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">Attention {h.attention}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Rejection reasons</div>
                    <ul className="space-y-1.5">
                      {recruiter.rejection_reasons?.map((r: string, i: number) => (
                        <li key={i} className="text-xs flex items-start gap-2"><span className="text-rose-400">●</span><span>{r}</span></li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Fix priorities</div>
                    {recruiter.fix_priorities?.map((f: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1.5">
                        <span>{f.action}</span>
                        <span className="font-mono text-emerald-400">+{f.impact_pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null
            }
          </GlassCard>

          <GlassCard className="p-5">
            <SectionHeader icon={Activity} title="90-Day Career Forecast" subtitle="Projected trajectory" accent="#3B82F6" />
            {loading.forecast && !forecast ? <Loader label="Projecting your future…" /> :
              err.forecast ? <ErrorBox msg={err.forecast} onRetry={() => run("forecast", () => callAI("forecast", { skills: baseSkills, jobTitle }), setForecast)} /> :
              forecast ? (
                <div className="space-y-4">
                  <p className="text-sm font-medium text-primary">{forecast.headline}</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={forecast.points}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip contentStyle={{ background: "#0a0a1e", border: "1px solid #ffffff20", borderRadius: 8 }} />
                      <Line type="monotone" dataKey="employability_score" stroke="#3B82F6" strokeWidth={2.5} dot={{ fill: "#3B82F6" }} />
                      <Line type="monotone" dataKey="interview_success_pct" stroke="#10B981" strokeWidth={2.5} dot={{ fill: "#10B981" }} />
                      <Line type="monotone" dataKey="role_readiness_pct" stroke="#8B5CF6" strokeWidth={2.5} dot={{ fill: "#8B5CF6" }} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-4 gap-2">
                    {forecast.points?.map((p: any) => (
                      <div key={p.label} className="rounded-lg border border-white/10 bg-white/[0.02] p-2 text-center">
                        <div className="text-[10px] text-muted-foreground uppercase">{p.label}</div>
                        <div className="text-sm font-heading font-bold mt-1">₹{p.salary_lpa} LPA</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null
            }
          </GlassCard>
        </div>

        {/* GitHub Intelligence */}
        <GlassCard className="p-5">
          <SectionHeader icon={Github} title="GitHub Intelligence" subtitle="Real GitHub API + AI engineering credibility scoring" accent="#10B981" />
          <div className="flex gap-2 mb-4">
            <input
              value={ghUser}
              onChange={(e) => setGhUser(e.target.value)}
              placeholder="GitHub username (e.g. torvalds)"
              className="flex-1 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-sm focus:border-primary/50 focus:outline-none"
            />
            <button
              onClick={fetchGitHub}
              disabled={ghLoading || loading.github}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 inline-flex items-center gap-2"
            >
              {(ghLoading || loading.github) ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitBranch className="w-4 h-4" />}
              Analyze
            </button>
          </div>
          {err.github && <ErrorBox msg={err.github} onRetry={fetchGitHub} />}
          {ghIntel && (
            <div className="grid lg:grid-cols-3 gap-5 mt-2">
              <div className="space-y-3">
                {[
                  { label: "Engineering Credibility", v: ghIntel.engineering_credibility, c: "#3B82F6" },
                  { label: "Technical Consistency", v: ghIntel.technical_consistency, c: "#10B981" },
                  { label: "Portfolio Strength", v: ghIntel.portfolio_strength, c: "#8B5CF6" },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg border border-white/10 p-3">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className="font-mono" style={{ color: s.c }}><CountUp value={s.v} /></span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${s.v}%` }} transition={{ duration: 1 }} className="h-full" style={{ background: s.c, boxShadow: `0 0 10px ${s.c}` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="lg:col-span-1">
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart data={ghIntel.radar}>
                    <PolarGrid stroke="#ffffff20" />
                    <PolarAngleAxis dataKey="axis" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar dataKey="score" stroke="#10B981" fill="#10B981" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Strengths</div>
                  {ghIntel.strengths?.map((s: string, i: number) => (
                    <div key={i} className="text-xs py-1 flex gap-2"><span className="text-emerald-400">+</span>{s}</div>
                  ))}
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Weaknesses</div>
                  {ghIntel.weaknesses?.map((s: string, i: number) => (
                    <div key={i} className="text-xs py-1 flex gap-2"><span className="text-rose-400">−</span>{s}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Portfolio Project Generator */}
        <GlassCard className="p-5">
          <SectionHeader icon={Rocket} title="Portfolio Project Generator" subtitle="AI-architected projects targeted at your gaps" accent="#F59E0B" />
          {!projects && !loading.projects && (
            <button onClick={fetchProjects} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Generate projects
            </button>
          )}
          {loading.projects && <Loader label="Architecting projects…" />}
          {err.projects && <ErrorBox msg={err.projects} onRetry={fetchProjects} />}
          {projects?.projects && (
            <div className="grid md:grid-cols-3 gap-4 mt-3">
              {projects.projects.map((p: any, i: number) => (
                <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm">{p.title}</h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">+{p.employability_boost_pct}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{p.pitch}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {p.tech_stack?.slice(0, 5).map((t: string) => (
                      <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10">{t}</span>
                    ))}
                  </div>
                  <div className="text-[11px] text-foreground/80 italic line-clamp-3 border-l-2 border-primary/40 pl-2 mb-3">{p.architecture}</div>
                  <div className="space-y-1">
                    {p.milestones?.map((m: any, j: number) => (
                      <div key={j} className="text-[11px] flex gap-2">
                        <span className="text-primary font-mono">W{j + 1}</span>
                        <span className="text-foreground/80">{m.title}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Footer CTA */}
        <div className="text-center text-xs text-muted-foreground pt-6">
          SkillScan X · Powered by multi-agent AI · Real GitHub data · Lovable AI Gateway
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SkillScanXPage;
