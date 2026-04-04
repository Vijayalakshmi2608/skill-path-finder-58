import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, TrendingUp, MapPin, MessageSquareQuote, Copy, Check, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAnalyze } from "@/contexts/AnalyzeContext";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart, CartesianGrid, Legend, Cell } from "recharts";

const roles = ["Software Engineer", "Data Scientist", "UI/UX Designer", "Product Manager", "DevOps Engineer", "Cloud Architect", "Full Stack Developer", "ML Engineer"];
const experienceLevels = ["Fresher", "Junior (1-2 yrs)", "Mid-Level (3-5 yrs)", "Senior (5+ yrs)"];

const AnimatedNumber = ({ value, prefix = "", suffix = "", decimals = 1 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const step = 16;
    const increment = value / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start);
    }, step);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{prefix}{display.toFixed(decimals)}{suffix}</span>;
};

const SalaryIntelligencePage = () => {
  const { toast } = useToast();
  const { data: analyzeData } = useAnalyze();
  const [role, setRole] = useState(analyzeData?.jobTitle || "Data Scientist");
  const [experience, setExperience] = useState("Fresher");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  // Negotiation
  const [currentOffer, setCurrentOffer] = useState("");
  const [targetSalary, setTargetSalary] = useState("");
  const [strongestSkill, setStrongestSkill] = useState("");
  const [yearsExp, setYearsExp] = useState("");
  const [scriptLoading, setScriptLoading] = useState(false);
  const [script, setScript] = useState("");
  const [copied, setCopied] = useState(false);

  const skills = analyzeData?.detectedSkills || [];
  const missingSkills = analyzeData?.skillAnalysis?.missing_skills?.map((s: any) => (typeof s === "string" ? s : s.name)) || [];

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("salary-intelligence", {
        body: { role, skills, missingSkills, experience },
      });
      if (error) throw error;
      setData(result);
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to analyze salary", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateScript = async () => {
    setScriptLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("negotiation-script", {
        body: { currentOffer, targetSalary, strongestSkill, yearsExperience: yearsExp, role, city: data?.best_cities?.[0]?.city || "Bangalore" },
      });
      if (error) throw error;
      setScript(result.script);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setScriptLoading(false);
    }
  };

  const copyScript = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const timelineLabels = ["Now", "1 mo", "3 mo", "6 mo", "12 mo", "24 mo"];
  const timelineData = data?.growth_timeline ? timelineLabels.map((label, i) => ({
    month: label,
    without: data.growth_timeline.without[i],
    with: data.growth_timeline.with[i],
  })) : [];

  const skillData = data?.skill_salary_impact?.map((s: any) => ({
    ...s,
    fill: s.status === "have" ? "#10B981" : s.status === "partial" ? "#F59E0B" : "#FF6B6B",
  })) || [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">💰 Salary Intelligence</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">See exactly what your skills are worth — and what closing gaps will earn you.</p>
        </motion.div>

        {/* Setup */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-2xl p-6 md:p-8 mb-10">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Target Role</label>
              <div className="flex flex-wrap gap-2">
                {roles.map(r => (
                  <button key={r} onClick={() => setRole(r)} className={`px-3 py-1.5 rounded-full text-sm transition-all ${role === r ? "bg-[#FF6B6B] text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>{r}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Experience Level</label>
              <div className="flex flex-wrap gap-2">
                {experienceLevels.map(e => (
                  <button key={e} onClick={() => setExperience(e)} className={`px-3 py-1.5 rounded-full text-sm transition-all ${experience === e ? "bg-[#00D4AA] text-black font-medium" : "bg-muted text-muted-foreground hover:text-foreground"}`}>{e}</button>
                ))}
              </div>
            </div>
          </div>
          <button onClick={handleAnalyze} disabled={loading} className="w-full md:w-auto px-8 py-3 bg-[#FF6B6B] text-white rounded-xl font-medium hover:brightness-110 transition-all flex items-center gap-2 justify-center disabled:opacity-50">
            {loading ? <><Loader2 className="animate-spin" size={18} /> Analyzing...</> : <><Sparkles size={18} /> Analyze My Salary</>}
          </button>
        </motion.div>

        <AnimatePresence>
          {data && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
              {/* Current vs Potential */}
              <div className="grid md:grid-cols-2 gap-6 relative">
                <motion.div initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-card border-2 border-[#FF6B6B]/40 rounded-2xl p-6">
                  <p className="text-sm text-muted-foreground mb-1">Your Current Market Value</p>
                  <p className="text-3xl md:text-4xl font-bold text-[#FF6B6B]">
                    <AnimatedNumber value={data.current_range.min} prefix="₹" suffix=" – " /><AnimatedNumber value={data.current_range.max} prefix="₹" suffix=" LPA" />
                  </p>
                  <p className="text-muted-foreground text-sm mt-2">Role: {role}</p>
                  <p className="text-muted-foreground text-sm">Top <AnimatedNumber value={data.percentile} suffix="%" decimals={0} /> of {experience.toLowerCase()}</p>
                </motion.div>

                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="bg-[#00D4AA] rounded-full p-3"><ArrowRight className="text-black" size={24} /></div>
                </div>

                <motion.div initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-card border-2 border-[#10B981]/40 rounded-2xl p-6">
                  <p className="text-sm text-muted-foreground mb-1">After Your 30-Day Roadmap</p>
                  <p className="text-3xl md:text-4xl font-bold text-[#10B981]">
                    <AnimatedNumber value={data.projected_range.min} prefix="₹" suffix=" – " /><AnimatedNumber value={data.projected_range.max} prefix="₹" suffix=" LPA" /> ✨
                  </p>
                  <p className="text-[#10B981] text-sm mt-2 font-medium">+₹<AnimatedNumber value={data.salary_increase} suffix=" LPA" /> minimum</p>
                  <p className="text-[#00D4AA] text-sm font-medium">ROI: <AnimatedNumber value={data.roi_percentage} suffix="%" decimals={0} /> salary jump</p>
                </motion.div>
              </div>

              {/* Skill Salary Breakdown */}
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-2xl font-heading font-bold mb-1">💡 What Each Skill Earns You</h2>
                <p className="text-muted-foreground text-sm mb-6">Prioritized by salary impact</p>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={skillData} layout="vertical" margin={{ left: 20, right: 40 }}>
                      <XAxis type="number" tick={{ fill: "#9CA3AF", fontSize: 12 }} tickFormatter={v => `₹${v} LPA`} />
                      <YAxis dataKey="skill" type="category" tick={{ fill: "#E5E7EB", fontSize: 13 }} width={140} />
                      <Tooltip formatter={(v: number) => [`₹${v} LPA`, "Salary Impact"]} contentStyle={{ background: "#1F2937", border: "1px solid #374151", borderRadius: 8 }} />
                      <Bar dataKey="lpa_added" radius={[0, 6, 6, 0]} animationDuration={1200}>
                        {skillData.map((entry: any, i: number) => <Cell key={i} fill={entry.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {skillData[0] && (
                  <div className="mt-4 p-4 bg-muted rounded-xl text-sm">🎯 Focus on <span className="text-[#FF6B6B] font-medium">{skillData[0].skill}</span> first — it adds the most salary value at <span className="font-medium text-[#10B981]">₹{skillData[0].lpa_added} LPA</span></div>
                )}
              </motion.div>

              {/* City Cards */}
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-2xl font-heading font-bold mb-1">📍 Salary by City — {role}</h2>
                <p className="text-muted-foreground text-sm mb-6">Top cities for your target role</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.best_cities?.map((city: any, i: number) => (
                    <motion.div key={city.city} initial={{ opacity: 0, rotateY: 90 }} animate={{ opacity: 1, rotateY: 0 }} transition={{ delay: i * 0.1 }} className="bg-card border border-border rounded-xl p-5 hover:border-[#00D4AA]/40 transition-colors">
                      <p className="text-lg font-bold">{city.emoji} {city.city}</p>
                      <p className="text-2xl font-bold text-[#10B981]">₹{city.avg_lpa} LPA <span className="text-sm text-muted-foreground font-normal">avg</span></p>
                      <p className="text-sm text-muted-foreground">{city.openings.toLocaleString()} openings</p>
                      <p className="text-xs mt-1 text-[#00D4AA]">{city.tag}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Negotiation Script */}
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-2xl font-heading font-bold mb-1">🗣️ AI Salary Negotiation Script</h2>
                <p className="text-muted-foreground text-sm mb-6">Know exactly what to say when they ask about salary expectations</p>
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">Current offer (LPA)</label>
                    <input value={currentOffer} onChange={e => setCurrentOffer(e.target.value)} placeholder="e.g. 4.5" className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/50" />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">Target salary (LPA)</label>
                    <input value={targetSalary} onChange={e => setTargetSalary(e.target.value)} placeholder="e.g. 7" className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/50" />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">Your strongest skill</label>
                    <input value={strongestSkill} onChange={e => setStrongestSkill(e.target.value)} placeholder="e.g. Python" className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/50" />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">Years of relevant projects</label>
                    <input value={yearsExp} onChange={e => setYearsExp(e.target.value)} placeholder="e.g. 1" className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/50" />
                  </div>
                </div>
                <button onClick={handleGenerateScript} disabled={scriptLoading || !currentOffer || !targetSalary} className="px-6 py-2.5 bg-[#FF6B6B] text-white rounded-xl font-medium hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-50">
                  {scriptLoading ? <><Loader2 className="animate-spin" size={16} /> Generating...</> : <><MessageSquareQuote size={16} /> Generate My Script</>}
                </button>
                {script && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 bg-muted border border-border rounded-xl p-5 relative">
                    <p className="text-sm font-medium text-[#00D4AA] mb-2">Your Personalized Script:</p>
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{script}</p>
                    <button onClick={copyScript} className="absolute top-4 right-4 px-3 py-1.5 bg-card border border-border rounded-lg text-xs flex items-center gap-1.5 hover:border-[#10B981] transition-colors">
                      {copied ? <><Check size={12} className="text-[#10B981]" /> Copied!</> : <><Copy size={12} /> Copy</>}
                    </button>
                  </motion.div>
                )}
              </motion.div>

              {/* Growth Timeline */}
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-2xl font-heading font-bold mb-1">📈 Your Salary Growth Projection</h2>
                <p className="text-muted-foreground text-sm mb-6">With vs without SkillScan roadmap</p>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timelineData}>
                      <defs>
                        <linearGradient id="growthGap" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00D4AA" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#00D4AA" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                      <XAxis dataKey="month" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                      <YAxis tick={{ fill: "#9CA3AF", fontSize: 12 }} tickFormatter={v => `₹${v}`} />
                      <Tooltip contentStyle={{ background: "#1F2937", border: "1px solid #374151", borderRadius: 8 }} formatter={(v: number) => [`₹${v} LPA`]} />
                      <Legend />
                      <Area type="monotone" dataKey="with" name="With SkillScan" stroke="#00D4AA" fill="url(#growthGap)" strokeWidth={3} animationDuration={2000} />
                      <Line type="monotone" dataKey="without" name="Without SkillScan" stroke="#FF6B6B" strokeWidth={2} strokeDasharray="6 4" dot={false} animationDuration={2000} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                {timelineData.length > 0 && (
                  <div className="mt-4 text-center text-sm text-muted-foreground">
                    <span className="text-[#00D4AA] font-bold text-lg">₹{(timelineData[5]?.with - timelineData[5]?.without).toFixed(1)} LPA</span> more over 2 years with SkillScan
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

export default SalaryIntelligencePage;
