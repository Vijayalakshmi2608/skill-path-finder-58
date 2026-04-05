import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2, Trash2, GripVertical, TrendingUp, AlertTriangle, CheckCircle, XCircle, Send, BarChart3, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type Application = {
  id: string;
  company: string;
  role: string;
  date_applied: string;
  status: "applied" | "interview" | "offer" | "rejected";
  match_score: number;
  salary_offered: number | null;
  notes: string;
};

type RejectionAnalysis = {
  patterns: { pattern: string; frequency: number; affected_applications: number; recommendation: string; action: string }[];
  optimal_match_threshold: number;
  success_rate_prediction: number;
  top_recommendation: string;
};

const statusConfig = {
  applied: { label: "Applied", color: "bg-blue-500", border: "border-blue-500/30", text: "text-blue-400", icon: Send },
  interview: { label: "Interview", color: "bg-amber-500", border: "border-amber-500/30", text: "text-amber-400", icon: Clock },
  offer: { label: "Offer", color: "bg-emerald-500", border: "border-emerald-500/30", text: "text-emerald-400", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-[#FF6B6B]", border: "border-[#FF6B6B]/30", text: "text-[#FF6B6B]", icon: XCircle },
};

const ApplicationTrackerPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [analysis, setAnalysis] = useState<RejectionAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [form, setForm] = useState({ company: "", role: "", date_applied: new Date().toISOString().split("T")[0], status: "applied" as Application["status"], match_score: 0, salary_offered: "", notes: "" });
  const [adding, setAdding] = useState(false);
  const animatedStats = useRef<Record<string, number>>({});
  const [statsAnimated, setStatsAnimated] = useState(false);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    fetchApps();
  }, [user]);

  useEffect(() => {
    if (apps.length > 0 && !statsAnimated) {
      setStatsAnimated(true);
    }
  }, [apps]);

  const fetchApps = async () => {
    const { data, error } = await supabase.from("applications").select("*").order("date_applied", { ascending: false });
    if (error) { toast.error("Failed to load applications"); console.error(error); }
    else setApps((data as unknown as Application[]) || []);
    setLoading(false);
  };

  const addApp = async () => {
    if (!user) { toast.error("Please sign in first"); navigate("/auth"); return; }
    if (!form.company || !form.role) { toast.error("Company and role are required"); return; }
    setAdding(true);
    const { error } = await supabase.from("applications").insert({
      user_id: user.id,
      company: form.company,
      role: form.role,
      date_applied: form.date_applied,
      status: form.status,
      match_score: form.match_score,
      salary_offered: form.salary_offered ? parseFloat(form.salary_offered) : null,
      notes: form.notes,
    } as any);
    if (error) toast.error("Failed to add application");
    else { toast.success("Application added!"); setForm({ company: "", role: "", date_applied: new Date().toISOString().split("T")[0], status: "applied", match_score: 0, salary_offered: "", notes: "" }); setShowForm(false); fetchApps(); }
    setAdding(false);
  };

  const updateStatus = async (id: string, status: Application["status"]) => {
    const { error } = await supabase.from("applications").update({ status } as any).eq("id", id);
    if (error) toast.error("Failed to update");
    else { setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a)); toast.success("Status updated"); }
  };

  const deleteApp = async (id: string) => {
    const { error } = await supabase.from("applications").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else { setApps(prev => prev.filter(a => a.id !== id)); toast.success("Deleted"); }
  };

  const runAnalysis = async () => {
    const rejected = apps.filter(a => a.status === "rejected");
    if (rejected.length < 2) { toast.error("Need at least 2 rejected applications to analyze patterns"); return; }
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("rejection-analysis", { body: { applications: apps } });
      if (error) throw error;
      setAnalysis(data);
    } catch (e: any) { toast.error(e.message || "Analysis failed"); }
    setAnalyzing(false);
  };

  const stats = {
    applied: apps.filter(a => a.status === "applied").length,
    interview: apps.filter(a => a.status === "interview").length,
    offer: apps.filter(a => a.status === "offer").length,
    rejected: apps.filter(a => a.status === "rejected").length,
  };
  const successRate = apps.length > 0 ? ((stats.offer / apps.length) * 100).toFixed(1) : "0";

  const columns: Application["status"][] = ["applied", "interview", "offer", "rejected"];

  const AnimatedNumber = ({ value, delay = 0 }: { value: number; delay?: number }) => {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
      const timer = setTimeout(() => {
        let start = 0;
        const step = Math.max(1, Math.ceil(value / 20));
        const interval = setInterval(() => {
          start += step;
          if (start >= value) { setDisplay(value); clearInterval(interval); }
          else setDisplay(start);
        }, 50);
        return () => clearInterval(interval);
      }, delay);
      return () => clearTimeout(timer);
    }, [value, delay]);
    return <span>{display}</span>;
  };

  return (
    <div className="min-h-screen bg-[#0A0A1A] text-foreground">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-heading font-bold mb-4">
            📊 <span className="text-foreground">Application</span> <span className="text-primary">Tracker</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">Track every application. AI finds patterns in your rejections.</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {([
            { key: "applied", emoji: "📤", label: "Applied", val: stats.applied, color: "border-blue-500/30" },
            { key: "interview", emoji: "📞", label: "Interviews", val: stats.interview, color: "border-amber-500/30" },
            { key: "offer", emoji: "✅", label: "Offers", val: stats.offer, color: "border-emerald-500/30" },
            { key: "rejected", emoji: "❌", label: "Rejected", val: stats.rejected, color: "border-[#FF6B6B]/30" },
          ] as const).map((s, i) => (
            <motion.div key={s.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className={`bg-[#111827] border ${s.color} rounded-xl p-5 text-center`}>
              <div className="text-2xl mb-1">{s.emoji}</div>
              <div className="text-3xl font-heading font-bold"><AnimatedNumber value={s.val} delay={i * 150} /></div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Success rate bar */}
        {apps.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="bg-[#111827] border border-border rounded-xl p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-muted-foreground text-sm">Success Rate: </span>
              <span className="text-xl font-bold text-[#00D4AA]">{successRate}%</span>
              <span className="text-muted-foreground text-sm ml-3">Industry avg: 6.2%</span>
            </div>
            {parseFloat(successRate) > 6.2 && <span className="text-emerald-400 text-sm font-medium">You are above average! 🎯</span>}
          </motion.div>
        )}

        {/* Add Application */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-10">
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:brightness-110 transition-all">
            <Plus size={18} /> Add Application
          </button>

          <AnimatePresence>
            {showForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="bg-[#111827] border border-border rounded-xl p-6 mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="Company name" className="px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                  <input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="Role" className="px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                  <input type="date" value={form.date_applied} onChange={e => setForm(f => ({ ...f, date_applied: e.target.value }))} className="px-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Match Score: {form.match_score}%</label>
                    <input type="range" min={0} max={100} value={form.match_score} onChange={e => setForm(f => ({ ...f, match_score: parseInt(e.target.value) }))} className="w-full accent-primary" />
                  </div>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Application["status"] }))} className="px-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                    <option value="applied">Applied</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <input value={form.salary_offered} onChange={e => setForm(f => ({ ...f, salary_offered: e.target.value }))} placeholder="Salary offered (LPA) — optional" type="number" className="px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notes..." rows={2} className="sm:col-span-2 lg:col-span-3 px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none" />
                  <button onClick={addApp} disabled={adding} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2 justify-center">
                    {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Add
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Kanban Board */}
        {!loading && apps.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-heading font-bold mb-6">Application Pipeline</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {columns.map(col => {
                const cfg = statusConfig[col];
                const colApps = apps.filter(a => a.status === col);
                return (
                  <div key={col} className="bg-[#111827]/50 rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-2 mb-4">
                      <div className={`w-3 h-3 rounded-full ${cfg.color}`} />
                      <span className="font-semibold text-sm">{cfg.label}</span>
                      <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{colApps.length}</span>
                    </div>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {colApps.map((app, i) => (
                        <motion.div key={app.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className={`bg-[#0A0A1A] border ${cfg.border} rounded-lg p-4 group`}>
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-sm">{app.company}</h4>
                              <p className="text-xs text-muted-foreground">{app.role}</p>
                            </div>
                            <button onClick={() => deleteApp(app.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-muted-foreground">{app.match_score}% match</span>
                            {app.salary_offered && <span className="text-xs text-emerald-400">₹{app.salary_offered} LPA</span>}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">{new Date(app.date_applied).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</div>
                          {/* Status change buttons */}
                          <div className="flex gap-1 mt-3 flex-wrap">
                            {columns.filter(c => c !== col).map(c => (
                              <button key={c} onClick={() => updateStatus(app.id, c)} className={`text-[10px] px-2 py-1 rounded ${statusConfig[c].text} bg-muted hover:brightness-125 transition-all`}>
                                → {statusConfig[c].label}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                      {colApps.length === 0 && <p className="text-xs text-muted-foreground/50 text-center py-6">No applications</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* AI Rejection Analysis */}
        {apps.filter(a => a.status === "rejected").length >= 2 && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-heading font-bold">🔍 Why You're Getting Rejected</h2>
              <button onClick={runAnalysis} disabled={analyzing} className="px-5 py-2.5 bg-[#FF6B6B] text-white rounded-lg font-medium hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2">
                {analyzing ? <Loader2 size={16} className="animate-spin" /> : <BarChart3 size={16} />} Analyze Patterns
              </button>
            </div>

            <AnimatePresence>
              {analysis && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="bg-[#111827] border border-[#FF6B6B]/20 rounded-xl p-6">
                    <p className="text-muted-foreground mb-4">After analyzing your {stats.rejected} rejections, SkillScan AI found:</p>
                    <div className="space-y-4">
                      {analysis.patterns.map((p, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }} className="bg-[#0A0A1A] border border-[#FF6B6B]/10 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <AlertTriangle size={18} className="text-[#FF6B6B] mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-foreground mb-1">Pattern {i + 1}: {p.pattern}</p>
                              <p className="text-xs text-muted-foreground mb-2">{p.recommendation}</p>
                              <span className="text-xs px-3 py-1 rounded-full bg-[#FF6B6B]/10 text-[#FF6B6B]">Affected {p.affected_applications} applications</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-[#111827] border border-[#00D4AA]/20 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp size={18} className="text-[#00D4AA]" />
                      <span className="font-semibold">AI Recommendation</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{analysis.top_recommendation}</p>
                    <div className="flex gap-4 mt-3 text-xs">
                      <span className="text-[#00D4AA]">Optimal match threshold: {analysis.optimal_match_threshold}%</span>
                      <span className="text-amber-400">Predicted success rate: {analysis.success_rate_prediction}%</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Timeline */}
        {apps.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mb-12">
            <h2 className="text-2xl font-heading font-bold mb-6">📅 Application Timeline</h2>
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-3 min-w-max">
                {[...apps].sort((a, b) => new Date(a.date_applied).getTime() - new Date(b.date_applied).getTime()).map((app, i) => {
                  const cfg = statusConfig[app.status];
                  return (
                    <motion.div key={app.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={`relative bg-[#111827] border ${cfg.border} rounded-lg p-3 w-40 flex-shrink-0`}>
                      <div className={`w-2 h-2 rounded-full ${cfg.color} mb-2`} />
                      <h4 className="text-xs font-semibold truncate">{app.company}</h4>
                      <p className="text-[10px] text-muted-foreground truncate">{app.role}</p>
                      <p className={`text-[10px] mt-1 ${cfg.text}`}>{cfg.label} • {app.match_score}%</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(app.date_applied).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && apps.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <p className="text-5xl mb-4">📊</p>
            <p className="text-xl font-heading font-bold mb-2">No applications yet</p>
            <p className="text-muted-foreground mb-6">Start tracking your job applications to unlock AI rejection analysis</p>
            <button onClick={() => { if (!user) { navigate("/auth"); return; } setShowForm(true); }} className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:brightness-110 transition-all">
              <Plus size={16} className="inline mr-2" /> Add Your First Application
            </button>
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

export default ApplicationTrackerPage;
