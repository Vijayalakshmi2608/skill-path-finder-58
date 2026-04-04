import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Loader2, ChevronDown, ChevronUp, Sparkles, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

const roles = ["Software Engineer", "Data Scientist", "UI/UX Designer", "Product Manager", "DevOps Engineer", "Full Stack Developer", "ML Engineer", "Cloud Architect"];

const sectionMeta: Record<string, { icon: string; label: string }> = {
  headline: { icon: "📝", label: "Headline" },
  about: { icon: "📖", label: "About Section" },
  experience: { icon: "💼", label: "Experience" },
  skills: { icon: "🛠️", label: "Skills Listed" },
  education: { icon: "🎓", label: "Education" },
  achievements: { icon: "🏆", label: "Achievements" },
};

const AnimatedNumber = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const [display, setDisplay] = useState(0);
  useState(() => {
    let start = 0;
    const dur = 1200;
    const step = 16;
    const inc = value / (dur / step);
    const t = setInterval(() => {
      start += inc;
      if (start >= value) { setDisplay(value); clearInterval(t); }
      else setDisplay(Math.floor(start));
    }, step);
  });
  return <span>{display}{suffix}</span>;
};

const ScoreBar = ({ score, max = 10 }: { score: number; max?: number }) => {
  const pct = (score / max) * 100;
  const color = pct >= 70 ? "#10B981" : pct >= 50 ? "#F59E0B" : "#FF6B6B";
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className="h-full rounded-full" style={{ background: color }} />
      </div>
      <span className="text-sm font-medium w-10 text-right" style={{ color }}>{score}/{max}</span>
    </div>
  );
};

const LinkedInAnalyzerPage = () => {
  const { toast } = useToast();
  const [profileText, setProfileText] = useState("");
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [copiedField, setCopiedField] = useState("");

  const handleAnalyze = async () => {
    if (profileText.trim().length < 20) {
      toast({ title: "Too short", description: "Please paste more profile text", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("linkedin-analyzer", {
        body: { profileText, targetRole },
      });
      if (error) throw error;
      setData(result);
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Analysis failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (key: string) => {
    setOpenSections(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  };

  const copyText = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 2000);
  };

  const getStatusIcon = (score: number) => score >= 7 ? "✅" : score >= 5 ? "⚠️" : "❌";
  const getStatusLabel = (score: number) => score >= 7 ? "Good" : score >= 5 ? "Weak" : score < 3 ? "Missing" : "Poor";
  const priorityColors: Record<string, string> = { high: "#FF6B6B", medium: "#F59E0B", low: "#10B981" };
  const priorityIcons: Record<string, string> = { high: "🔴", medium: "🟡", low: "🟢" };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">🔗 LinkedIn Profile Analyzer</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">Paste your LinkedIn profile → AI scores every section → Get exact fixes that make recruiters stop scrolling.</p>
        </motion.div>

        {/* Input */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-2xl p-6 md:p-8 mb-10">
          <div className="mb-4">
            <label className="text-sm text-muted-foreground block mb-2">Paste your LinkedIn profile text (About, Experience, Skills, Headline)</label>
            <textarea value={profileText} onChange={e => setProfileText(e.target.value)} rows={8} placeholder="Copy and paste your LinkedIn About section, Experience entries, Skills list, and Headline here..." className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A66C2]/50 resize-none" />
            <p className="text-xs text-muted-foreground mt-1">🔒 We analyze the text you paste — your profile stays private</p>
          </div>
          <div className="mb-6">
            <label className="text-sm text-muted-foreground block mb-2">Target Role</label>
            <div className="flex flex-wrap gap-2">
              {roles.map(r => (
                <button key={r} onClick={() => setTargetRole(r)} className={`px-3 py-1.5 rounded-full text-sm transition-all ${targetRole === r ? "bg-[#FF6B6B] text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>{r}</button>
              ))}
            </div>
          </div>
          <button onClick={handleAnalyze} disabled={loading} className="w-full md:w-auto px-8 py-3 bg-[#FF6B6B] text-white rounded-xl font-medium hover:brightness-110 transition-all flex items-center gap-2 justify-center disabled:opacity-50">
            {loading ? <><Loader2 className="animate-spin" size={18} /> Analyzing...</> : <><Sparkles size={18} /> Analyze My Profile</>}
          </button>
        </motion.div>

        <AnimatePresence>
          {data && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              {/* Overall Score */}
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-card border border-border rounded-2xl p-8 text-center">
                <p className="text-muted-foreground text-sm mb-2">LinkedIn Score</p>
                <p className="text-6xl font-bold mb-2" style={{ color: data.overall_score >= 70 ? "#10B981" : data.overall_score >= 50 ? "#F59E0B" : "#FF6B6B" }}>
                  <AnimatedNumber value={data.overall_score} suffix="/100" />
                </p>
                <p className="text-lg">{data.overall_score >= 80 ? "🟢 Excellent" : data.overall_score >= 60 ? "🟡 Needs Work" : "🔴 Needs Major Fixes"}</p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-8">
                  {Object.entries(sectionMeta).map(([key, meta]) => {
                    const section = data.sections?.[key];
                    if (!section) return null;
                    return (
                      <div key={key} className="bg-muted rounded-xl p-3 text-left">
                        <p className="text-sm mb-1">{meta.icon} {meta.label}</p>
                        <ScoreBar score={section.score} />
                        <p className="text-xs text-muted-foreground mt-1">{getStatusIcon(section.score)} {getStatusLabel(section.score)}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 bg-muted rounded-xl p-4">
                  <p className="text-sm text-muted-foreground mb-1">Recruiter Appeal Score</p>
                  <div className="h-3 bg-background rounded-full overflow-hidden mb-1">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${data.recruiter_click_probability}%` }} transition={{ duration: 1.2 }} className="h-full rounded-full bg-[#0A66C2]" />
                  </div>
                  <p className="text-sm"><span className="text-[#0A66C2] font-bold">{data.recruiter_click_probability}%</span> click probability</p>
                </div>
              </motion.div>

              {/* Section-by-Section Fixes */}
              <div>
                <h2 className="text-2xl font-heading font-bold mb-4">🔧 Section-by-Section Fixes</h2>
                <div className="space-y-3">
                  {Object.entries(sectionMeta).map(([key, meta]) => {
                    const section = data.sections?.[key];
                    if (!section) return null;
                    const isOpen = openSections.has(key);
                    return (
                      <motion.div key={key} className="bg-card border border-border rounded-xl overflow-hidden">
                        <button onClick={() => toggleSection(key)} className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <span>{meta.icon}</span>
                            <span className="font-medium">{meta.label}</span>
                            <ScoreBar score={section.score} />
                          </div>
                          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                              <div className="px-4 pb-4 space-y-3">
                                {section.current && (
                                  <div><p className="text-xs text-muted-foreground mb-1">Current:</p><p className="text-sm text-muted-foreground/80 italic">"{section.current}"</p></div>
                                )}
                                {section.problems?.length > 0 && (
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">Problems:</p>
                                    {section.problems.map((p: string, i: number) => <p key={i} className="text-sm text-[#FF6B6B]">❌ {p}</p>)}
                                  </div>
                                )}
                                {section.fix && (
                                  <div className="bg-muted rounded-lg p-3 relative">
                                    <p className="text-xs text-[#10B981] mb-1">✅ Suggested Fix:</p>
                                    <p className="text-sm text-foreground/90 pr-16">{section.fix}</p>
                                    <button onClick={() => copyText(section.fix, key)} className="absolute top-2 right-2 px-2 py-1 bg-card border border-border rounded text-xs flex items-center gap-1 hover:border-[#10B981] transition-colors">
                                      {copiedField === key ? <><Check size={10} className="text-[#10B981]" /> Copied!</> : <><Copy size={10} /> Copy</>}
                                    </button>
                                  </div>
                                )}
                                {key === "skills" && section.missing?.length > 0 && (
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-2">Missing high-value skills:</p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {section.missing.map((s: string) => <span key={s} className="px-2 py-1 bg-[#FF6B6B]/10 text-[#FF6B6B] rounded-md text-xs">{s}</span>)}
                                    </div>
                                  </div>
                                )}
                                {key === "achievements" && section.suggestions?.length > 0 && (
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">Suggestions:</p>
                                    {section.suggestions.map((s: string, i: number) => <p key={i} className="text-sm text-[#00D4AA]">💡 {s}</p>)}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Keyword Analysis */}
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-2xl font-heading font-bold mb-1">🔍 Recruiter Search Keywords</h2>
                <p className="text-muted-foreground text-sm mb-6">Are the right keywords in your profile?</p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-[#10B981] mb-3">Keywords You Have</p>
                    <div className="space-y-2">
                      {data.present_keywords?.map((kw: any, i: number) => (
                        <motion.div key={kw.keyword} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center justify-between text-sm">
                          <span className="text-[#10B981]">✅ {kw.keyword}</span>
                          <span className="text-muted-foreground text-xs">({kw.count} mentions)</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#FF6B6B] mb-3">Keywords You're Missing</p>
                    <div className="space-y-2">
                      {data.missing_keywords?.map((kw: string, i: number) => (
                        <motion.div key={kw} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="text-sm text-[#FF6B6B]">
                          ❌ {kw}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Action Plan */}
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-2xl font-heading font-bold mb-1">✅ Your LinkedIn Fix Checklist</h2>
                <p className="text-muted-foreground text-sm mb-6">Prioritized by impact</p>
                <div className="space-y-3">
                  {data.priority_actions?.map((action: any, i: number) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-start gap-3 p-3 bg-muted rounded-xl">
                      <span>{priorityIcons[action.priority]}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{action.action}</p>
                        <p className="text-xs text-muted-foreground">{action.time_minutes} min</p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full uppercase font-medium" style={{ color: priorityColors[action.priority], background: `${priorityColors[action.priority]}15` }}>{action.priority}</span>
                    </motion.div>
                  ))}
                </div>
                {data.priority_actions && (
                  <div className="mt-4 p-3 bg-muted rounded-xl text-sm text-center">
                    Estimated time to 80+ score: <span className="text-[#00D4AA] font-bold">{data.priority_actions.reduce((s: number, a: any) => s + a.time_minutes, 0)} min</span>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LinkedInAnalyzerPage;
