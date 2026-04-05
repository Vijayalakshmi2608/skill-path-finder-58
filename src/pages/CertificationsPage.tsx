import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Loader2, ExternalLink, Star, Clock, DollarSign, CheckCircle, Lock, Play, Filter, Plus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAnalyze } from "@/contexts/AnalyzeContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type Certification = {
  name: string;
  platform: string;
  duration: string;
  cost: string;
  salary_impact_lpa: number;
  recruiter_recognition: "low" | "medium" | "high" | "very_high";
  gaps_closed: string[];
  priority: number;
  free_option: boolean;
  url?: string;
};

type CertResult = {
  certifications: Certification[];
  total_salary_impact: number;
  fastest_to_complete: string;
  highest_roi: string;
};

type TrackedCert = {
  id: string;
  name: string;
  platform: string;
  status: "not_started" | "in_progress" | "completed";
  completion_percent: number;
};

const recognitionLabel: Record<string, { label: string; stars: number }> = {
  low: { label: "Low", stars: 1 },
  medium: { label: "Medium", stars: 2 },
  high: { label: "High", stars: 3 },
  very_high: { label: "Very High", stars: 4 },
};

const CertificationsPage = () => {
  const { user } = useAuth();
  const { data: analyzeData } = useAnalyze();
  const navigate = useNavigate();
  const [result, setResult] = useState<CertResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [tracked, setTracked] = useState<TrackedCert[]>([]);
  const [filter, setFilter] = useState<"all" | "free" | "under5k" | "premium">("all");
  const [role, setRole] = useState(analyzeData.jobTitle || "Software Engineer");

  useEffect(() => {
    if (user) fetchTracked();
  }, [user]);

  useEffect(() => {
    if (analyzeData.jobTitle) setRole(analyzeData.jobTitle);
  }, [analyzeData.jobTitle]);

  const fetchTracked = async () => {
    const { data } = await supabase.from("certifications").select("id, name, platform, status, completion_percent");
    if (data) setTracked(data as unknown as TrackedCert[]);
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const skills = analyzeData.skillAnalysis?.matched_skills?.map((s: any) => s.name) || [];
      const missingSkills = analyzeData.skillAnalysis?.missing_skills?.map((s: any) => s.name) || [];
      const { data, error } = await supabase.functions.invoke("cert-recommender", {
        body: { role, skills, missingSkills, budget: filter === "free" ? "free" : filter === "under5k" ? "under 5000 INR" : "any" },
      });
      if (error) throw error;
      setResult(data);
    } catch (e: any) { toast.error(e.message || "Failed to get recommendations"); }
    setLoading(false);
  };

  const addToTracker = async (cert: Certification) => {
    if (!user) { toast.error("Please sign in first"); navigate("/auth"); return; }
    const { error } = await supabase.from("certifications").insert({
      user_id: user.id,
      name: cert.name,
      platform: cert.platform,
      cost: cert.cost,
      duration: cert.duration,
      salary_impact: cert.salary_impact_lpa,
      gaps_closed: cert.gaps_closed,
      url: cert.url || "",
    } as any);
    if (error) toast.error("Failed to add");
    else { toast.success("Added to tracker!"); fetchTracked(); }
  };

  const updateTrackedStatus = async (id: string, status: TrackedCert["status"], percent: number) => {
    const { error } = await supabase.from("certifications").update({ status, completion_percent: percent } as any).eq("id", id);
    if (error) toast.error("Failed to update");
    else { fetchTracked(); toast.success("Updated!"); }
  };

  const filtered = result?.certifications.filter(c => {
    if (filter === "free") return c.free_option;
    if (filter === "under5k") return c.cost.includes("free") || c.cost.includes("Free") || parseFloat(c.cost.replace(/[^\d.]/g, "")) < 5000;
    if (filter === "premium") return !c.free_option;
    return true;
  }) || [];

  const chartData = (result?.certifications || []).map(c => ({ name: c.name.length > 20 ? c.name.slice(0, 20) + "…" : c.name, impact: c.salary_impact_lpa })).sort((a, b) => b.impact - a.impact);

  const AnimatedNumber = ({ value, prefix = "" }: { value: number; prefix?: string }) => {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
      let start = 0;
      const step = Math.max(0.1, value / 30);
      const interval = setInterval(() => {
        start += step;
        if (start >= value) { setDisplay(value); clearInterval(interval); }
        else setDisplay(parseFloat(start.toFixed(1)));
      }, 40);
      return () => clearInterval(interval);
    }, [value]);
    return <span>{prefix}{display.toFixed(1)}</span>;
  };

  return (
    <div className="min-h-screen bg-[#0A0A1A] text-foreground">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-heading font-bold mb-4">
            🏆 <span className="text-foreground">Certification</span> <span className="text-amber-400">Roadmap</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">The exact certifications that close your skill gaps AND impress recruiters.</p>
        </motion.div>

        {/* Role selector + analyze */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#111827] border border-border rounded-xl p-6 mb-10 flex flex-col sm:flex-row items-end gap-4">
          <div className="flex-1 w-full">
            <label className="text-sm text-muted-foreground mb-1 block">Target Role</label>
            <input value={role} onChange={e => setRole(e.target.value)} className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="e.g. Data Scientist" />
          </div>
          {/* Filter pills */}
          <div className="flex gap-2 flex-wrap">
            {(["all", "free", "under5k", "premium"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f ? "bg-amber-500 text-black" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                {f === "all" ? "All" : f === "free" ? "Free Only" : f === "under5k" ? "Under ₹5K" : "Premium"}
              </button>
            ))}
          </div>
          <button onClick={fetchRecommendations} disabled={loading} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2 whitespace-nowrap">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Trophy size={16} />} Get Recommendations
          </button>
        </motion.div>

        {/* Recommended Certifications */}
        <AnimatePresence>
          {result && filtered.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 mb-12">
              <h2 className="text-2xl font-heading font-bold">🎯 Recommended Certifications</h2>
              {filtered.sort((a, b) => a.priority - b.priority).map((cert, i) => {
                const rec = recognitionLabel[cert.recruiter_recognition] || { label: "Unknown", stars: 0 };
                const isTracked = tracked.some(t => t.name === cert.name);
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-[#111827] border border-amber-500/20 rounded-xl p-6">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-medium">Priority {cert.priority}</span>
                          {cert.free_option && <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">Free option</span>}
                        </div>
                        <h3 className="text-lg font-heading font-bold text-foreground">🏆 {cert.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">Platform: {cert.platform}</p>
                        <div className="flex flex-wrap gap-4 mt-3 text-sm">
                          <span className="flex items-center gap-1 text-muted-foreground"><Clock size={14} /> {cert.duration}</span>
                          <span className="flex items-center gap-1 text-muted-foreground"><DollarSign size={14} /> {cert.cost}</span>
                          <span className="text-emerald-400 font-medium">+₹{cert.salary_impact_lpa} LPA</span>
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          <span className="text-xs text-muted-foreground">Recruiter recognition:</span>
                          {Array.from({ length: rec.stars }).map((_, si) => <Star key={si} size={12} className="text-amber-400 fill-amber-400" />)}
                          <span className="text-xs text-amber-400 ml-1">{rec.label}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {cert.gaps_closed.map((g, gi) => (
                            <span key={gi} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">{g}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button onClick={() => addToTracker(cert)} disabled={isTracked} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${isTracked ? "bg-emerald-500/20 text-emerald-400" : "bg-primary text-primary-foreground hover:brightness-110"}`}>
                          {isTracked ? <><CheckCircle size={14} /> Tracked</> : <><Plus size={14} /> Add to Roadmap</>}
                        </button>
                        {cert.url && (
                          <a href={cert.url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:text-foreground transition-all flex items-center gap-1.5">
                            <ExternalLink size={14} /> View Course
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Impact Chart */}
        {result && chartData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[#111827] border border-border rounded-xl p-6 mb-12">
            <h2 className="text-xl font-heading font-bold mb-2">📊 Certification Impact Chart</h2>
            <p className="text-sm text-muted-foreground mb-6">Salary impact per certification (in LPA)</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <XAxis type="number" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" width={140} tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1F2937", borderRadius: 8, color: "#fff" }} formatter={(v: number) => [`+₹${v} LPA`, "Impact"]} />
                  <Bar dataKey="impact" radius={[0, 6, 6, 0]}>
                    {chartData.map((_, i) => <Cell key={i} fill={i === 0 ? "#F59E0B" : i < 3 ? "#00D4AA" : "#3B82F6"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center">
              <p className="text-sm text-emerald-400 font-medium">
                Completing top 3 certs adds <span className="text-lg font-bold">₹<AnimatedNumber value={result.total_salary_impact} /></span> LPA to your market value
              </p>
            </div>
          </motion.div>
        )}

        {/* Certification Tracker */}
        {tracked.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-12">
            <h2 className="text-2xl font-heading font-bold mb-6">📋 My Certification Progress</h2>
            <div className="bg-[#111827] border border-border rounded-xl overflow-hidden">
              <div className="grid grid-cols-[1fr_120px_100px_80px] gap-4 px-6 py-3 border-b border-border text-xs text-muted-foreground font-medium">
                <span>Certification</span><span>Platform</span><span>Status</span><span>Badge</span>
              </div>
              {tracked.map((cert, i) => (
                <motion.div key={cert.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="grid grid-cols-[1fr_120px_100px_80px] gap-4 px-6 py-4 border-b border-border/50 items-center">
                  <div>
                    <p className="text-sm font-medium">{cert.name}</p>
                    <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${cert.completion_percent}%` }} transition={{ duration: 1, delay: i * 0.1 }} className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500" />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{cert.completion_percent}%</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{cert.platform}</span>
                  <div>
                    {cert.status === "not_started" && (
                      <button onClick={() => updateTrackedStatus(cert.id, "in_progress", 10)} className="text-xs px-3 py-1 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all flex items-center gap-1">
                        <Play size={10} /> Start
                      </button>
                    )}
                    {cert.status === "in_progress" && (
                      <button onClick={() => updateTrackedStatus(cert.id, "completed", 100)} className="text-xs px-3 py-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all flex items-center gap-1">
                        <CheckCircle size={10} /> Complete
                      </button>
                    )}
                    {cert.status === "completed" && <span className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle size={12} /> Done</span>}
                  </div>
                  <div className="flex justify-center">
                    {cert.status === "completed" ? (
                      <span className="text-xl">🏅</span>
                    ) : (
                      <Lock size={16} className="text-muted-foreground/30" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty state for recommendations */}
        {!result && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <p className="text-5xl mb-4">🏆</p>
            <p className="text-xl font-heading font-bold mb-2">Get AI-Powered Cert Recommendations</p>
            <p className="text-muted-foreground mb-6">Enter your target role and click "Get Recommendations" to see certifications ranked by salary impact</p>
          </motion.div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-[#00D4AA]" />
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificationsPage;
