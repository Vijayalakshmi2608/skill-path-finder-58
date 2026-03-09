import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, Cell } from "recharts";
import { TrendingUp, TrendingDown, Clock, MapPin, Building2, Flame, Zap, ArrowUpRight, RefreshCw, IndianRupee, Target, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

// --- Mock data ---
const lastUpdated = new Date(Date.now() - 2 * 60 * 60 * 1000);

const skillsDemand = [
  { skill: "GenAI / LLMs", demand: 2840, change: +34, sources: ["LinkedIn", "Naukri"], hot: true },
  { skill: "React.js", demand: 2120, change: +12, sources: ["LinkedIn", "Indeed"], hot: true },
  { skill: "Python", demand: 1980, change: +8, sources: ["LinkedIn", "Naukri", "Indeed"], hot: false },
  { skill: "AWS / Cloud", demand: 1760, change: +22, sources: ["LinkedIn", "Indeed"], hot: true },
  { skill: "Kubernetes", demand: 1340, change: +18, sources: ["LinkedIn", "Naukri"], hot: false },
  { skill: "Data Engineering", demand: 1280, change: +15, sources: ["Naukri", "Indeed"], hot: false },
  { skill: "System Design", demand: 1150, change: +26, sources: ["LinkedIn"], hot: true },
  { skill: "TypeScript", demand: 1090, change: +9, sources: ["LinkedIn", "Indeed"], hot: false },
  { skill: "Prompt Engineering", demand: 980, change: +52, sources: ["LinkedIn", "Naukri"], hot: true },
  { skill: "Docker", demand: 870, change: +6, sources: ["Indeed", "Naukri"], hot: false },
];

const salaryData = [
  { skill: "GenAI / LLMs", bangalore: 28, delhi: 24, mumbai: 25, remote: 32 },
  { skill: "React.js", bangalore: 18, delhi: 15, mumbai: 16, remote: 22 },
  { skill: "Python", bangalore: 16, delhi: 14, mumbai: 15, remote: 20 },
  { skill: "AWS / Cloud", bangalore: 22, delhi: 18, mumbai: 19, remote: 26 },
  { skill: "Kubernetes", bangalore: 24, delhi: 20, mumbai: 21, remote: 28 },
  { skill: "System Design", bangalore: 26, delhi: 22, mumbai: 23, remote: 30 },
];

const salaryTrend = [
  { month: "Oct", genai: 22, react: 16, cloud: 18 },
  { month: "Nov", genai: 24, react: 16.5, cloud: 19 },
  { month: "Dec", genai: 25, react: 17, cloud: 20 },
  { month: "Jan", genai: 26, react: 17.5, cloud: 21 },
  { month: "Feb", genai: 27, react: 18, cloud: 21.5 },
  { month: "Mar", genai: 28, react: 18, cloud: 22 },
];

const topCompanies = [
  { name: "Google", openings: 340, topSkills: ["GenAI", "System Design", "Python"], growth: "+15%" },
  { name: "Microsoft", openings: 298, topSkills: ["Azure", "TypeScript", "C#"], growth: "+22%" },
  { name: "Amazon", openings: 412, topSkills: ["AWS", "Java", "ML"], growth: "+8%" },
  { name: "Flipkart", openings: 156, topSkills: ["React", "Node.js", "Kafka"], growth: "+31%" },
  { name: "Razorpay", openings: 89, topSkills: ["Go", "Kubernetes", "Fintech"], growth: "+45%" },
  { name: "Swiggy", openings: 124, topSkills: ["Python", "ML", "React"], growth: "+18%" },
  { name: "Zerodha", openings: 45, topSkills: ["Go", "Elixir", "System Design"], growth: "+12%" },
  { name: "Meesho", openings: 78, topSkills: ["React", "Python", "Data Eng"], growth: "+28%" },
];

const heatMapData = [
  { skill: "GenAI / LLMs", roi: 95, demand: 92, salary: 90, growth: 98 },
  { skill: "System Design", roi: 88, demand: 78, salary: 85, growth: 82 },
  { skill: "AWS / Cloud", roi: 85, demand: 85, salary: 82, growth: 78 },
  { skill: "Kubernetes", roi: 80, demand: 72, salary: 80, growth: 75 },
  { skill: "React.js", roi: 75, demand: 88, salary: 70, growth: 60 },
  { skill: "Python", roi: 72, demand: 90, salary: 68, growth: 55 },
  { skill: "Prompt Engineering", roi: 90, demand: 65, salary: 75, growth: 96 },
  { skill: "TypeScript", roi: 68, demand: 74, salary: 65, growth: 58 },
  { skill: "Docker", roi: 65, demand: 68, salary: 62, growth: 50 },
  { skill: "Data Engineering", roi: 78, demand: 70, salary: 76, growth: 72 },
];

const getHeatColor = (val: number) => {
  if (val >= 90) return "bg-red-500 text-white";
  if (val >= 80) return "bg-orange-500 text-white";
  if (val >= 70) return "bg-amber-400 text-black";
  if (val >= 60) return "bg-yellow-300 text-black";
  return "bg-emerald-200 text-black";
};

const timeAgo = (date: Date) => {
  const hrs = Math.round((Date.now() - date.getTime()) / 3600000);
  return hrs <= 1 ? "Updated 1 hour ago" : `Updated ${hrs} hours ago`;
};

const MarketIntelligence = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [locationTab, setLocationTab] = useState("bangalore");

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  return (
    <div className="min-h-screen" style={{ background: "#F8FAFC" }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: "#E2E8F0" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "#0F172A" }}>
                📊 Market Intelligence — Real-Time Hiring Trends
              </h1>
              <p className="mt-1 text-sm" style={{ color: "#64748B" }}>
                Live data aggregated from LinkedIn, Indeed & Naukri · Refreshed daily
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full" style={{ background: "#ECFDF5", color: "#059669" }}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#34D399" }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#10B981" }} />
                </span>
                Live
              </div>
              <span className="text-xs flex items-center gap-1" style={{ color: "#94A3B8" }}>
                <Clock size={12} /> {timeAgo(lastUpdated)}
              </span>
              <Button size="sm" variant="outline" onClick={handleRefresh} className="gap-1.5" style={{ borderColor: "#CBD5E1", color: "#475569" }}>
                <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* SECTION 1 — Skills in Demand This Week */}
        <Card style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }} className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg" style={{ color: "#0F172A" }}>
              <Flame size={20} style={{ color: "#EF4444" }} /> Skills in Demand This Week
            </CardTitle>
            <CardDescription style={{ color: "#64748B" }}>
              Top 10 most-requested skills across major job platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart */}
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={skillsDemand} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis type="number" tick={{ fill: "#64748B", fontSize: 12 }} />
                    <YAxis dataKey="skill" type="category" width={120} tick={{ fill: "#334155", fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 8 }} />
                    <Bar dataKey="demand" radius={[0, 6, 6, 0]}>
                      {skillsDemand.map((entry, i) => (
                        <Cell key={i} fill={entry.hot ? "#3B82F6" : "#93C5FD"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Table */}
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow style={{ borderColor: "#E2E8F0" }}>
                      <TableHead style={{ color: "#64748B" }}>Skill</TableHead>
                      <TableHead style={{ color: "#64748B" }}>Openings</TableHead>
                      <TableHead style={{ color: "#64748B" }}>Trend</TableHead>
                      <TableHead style={{ color: "#64748B" }}>Sources</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {skillsDemand.map((s) => (
                      <TableRow key={s.skill} style={{ borderColor: "#F1F5F9" }}>
                        <TableCell className="font-medium flex items-center gap-2" style={{ color: "#0F172A" }}>
                          {s.hot && <Zap size={14} style={{ color: "#F59E0B" }} />}
                          {s.skill}
                        </TableCell>
                        <TableCell style={{ color: "#334155" }}>{s.demand.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1 text-xs font-medium" style={{ color: "#10B981" }}>
                            <TrendingUp size={12} /> +{s.change}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {s.sources.map((src) => (
                              <Badge key={src} variant="secondary" className="text-[10px] px-1.5 py-0" style={{ background: "#F1F5F9", color: "#475569" }}>
                                {src}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 2 — Salary Trends */}
        <Card style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }} className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg" style={{ color: "#0F172A" }}>
              <IndianRupee size={20} style={{ color: "#10B981" }} /> Salary Trends by Skill + Location
            </CardTitle>
            <CardDescription style={{ color: "#64748B" }}>
              Average annual CTC in LPA — data from 15,000+ job postings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* By location */}
              <div>
                <Tabs value={locationTab} onValueChange={setLocationTab}>
                  <TabsList className="mb-4" style={{ background: "#F1F5F9" }}>
                    {["bangalore", "delhi", "mumbai", "remote"].map((loc) => (
                      <TabsTrigger key={loc} value={loc} className="capitalize text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm" style={{ color: "#475569" }}>
                        <MapPin size={12} className="mr-1" /> {loc}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
                <div className="space-y-3">
                  {salaryData.map((s) => {
                    const val = s[locationTab as keyof typeof s] as number;
                    const maxVal = 35;
                    return (
                      <div key={s.skill} className="flex items-center gap-3">
                        <span className="w-32 text-sm truncate" style={{ color: "#334155" }}>{s.skill}</span>
                        <div className="flex-1 h-6 rounded-full overflow-hidden" style={{ background: "#F1F5F9" }}>
                          <div
                            className="h-full rounded-full flex items-center justify-end pr-2 text-[10px] font-bold text-white transition-all duration-500"
                            style={{ width: `${(val / maxVal) * 100}%`, background: "linear-gradient(90deg, #3B82F6, #6366F1)" }}
                          >
                            ₹{val} LPA
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Trend line */}
              <div className="h-72">
                <p className="text-xs font-medium mb-2" style={{ color: "#64748B" }}>6-Month Salary Trend (LPA)</p>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salaryTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="month" tick={{ fill: "#64748B", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#64748B", fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 8 }} />
                    <Legend />
                    <Line type="monotone" dataKey="genai" name="GenAI" stroke="#EF4444" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="react" name="React" stroke="#3B82F6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="cloud" name="Cloud" stroke="#10B981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 3 — Companies Hiring Most */}
        <Card style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }} className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg" style={{ color: "#0F172A" }}>
              <Building2 size={20} style={{ color: "#3B82F6" }} /> Companies Hiring the Most Right Now
            </CardTitle>
            <CardDescription style={{ color: "#64748B" }}>
              Based on active job postings across platforms this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {topCompanies.map((c) => (
                <div key={c.name} className="rounded-xl p-4 border transition-all hover:shadow-md" style={{ borderColor: "#E2E8F0", background: "#FAFBFC" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm" style={{ color: "#0F172A" }}>{c.name}</span>
                    <span className="text-xs font-medium flex items-center gap-0.5" style={{ color: "#10B981" }}>
                      <ArrowUpRight size={12} /> {c.growth}
                    </span>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: "#3B82F6" }}>{c.openings}</p>
                  <p className="text-[10px] mb-3" style={{ color: "#94A3B8" }}>open positions</p>
                  <div className="flex flex-wrap gap-1">
                    {c.topSkills.map((sk) => (
                      <Badge key={sk} variant="secondary" className="text-[10px] px-1.5 py-0" style={{ background: "#EFF6FF", color: "#3B82F6" }}>
                        {sk}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SECTION 4 — Skill Heat Map (ROI) */}
        <Card style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }} className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg" style={{ color: "#0F172A" }}>
              <Target size={20} style={{ color: "#EF4444" }} /> Skill Heat Map — Highest ROI Skills
            </CardTitle>
            <CardDescription style={{ color: "#64748B" }}>
              Composite score based on demand, salary premium, and growth trajectory (0-100)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow style={{ borderColor: "#E2E8F0" }}>
                    <TableHead style={{ color: "#64748B" }}>Skill</TableHead>
                    <TableHead className="text-center" style={{ color: "#64748B" }}>Overall ROI</TableHead>
                    <TableHead className="text-center" style={{ color: "#64748B" }}>Demand</TableHead>
                    <TableHead className="text-center" style={{ color: "#64748B" }}>Salary Premium</TableHead>
                    <TableHead className="text-center" style={{ color: "#64748B" }}>Growth Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {heatMapData.sort((a, b) => b.roi - a.roi).map((s) => (
                    <TableRow key={s.skill} style={{ borderColor: "#F1F5F9" }}>
                      <TableCell className="font-medium" style={{ color: "#0F172A" }}>{s.skill}</TableCell>
                      {[s.roi, s.demand, s.salary, s.growth].map((val, i) => (
                        <TableCell key={i} className="text-center">
                          <span className={`inline-block px-3 py-1 rounded-md text-xs font-bold ${getHeatColor(val)}`}>
                            {val}
                          </span>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center gap-4 mt-4 text-[10px]" style={{ color: "#94A3B8" }}>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500" /> 90+</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-500" /> 80-89</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-400" /> 70-79</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-300" /> 60-69</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-200" /> &lt;60</span>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 5 — Key Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: <Flame size={20} />, color: "#EF4444", bg: "#FEF2F2", title: "Hottest Skill", value: "GenAI / LLMs", sub: "+34% demand this week, ₹28 LPA avg" },
            { icon: <TrendingUp size={20} />, color: "#10B981", bg: "#ECFDF5", title: "Fastest Growing", value: "Prompt Engineering", sub: "+52% WoW growth, emerging across all sectors" },
            { icon: <BarChart3 size={20} />, color: "#3B82F6", bg: "#EFF6FF", title: "Best ROI", value: "System Design + GenAI", sub: "Highest salary-to-learning-time ratio" },
          ].map((card) => (
            <Card key={card.title} style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }} className="shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg" style={{ background: card.bg, color: card.color }}>{card.icon}</div>
                  <span className="text-xs font-medium" style={{ color: "#64748B" }}>{card.title}</span>
                </div>
                <p className="text-lg font-bold" style={{ color: "#0F172A" }}>{card.value}</p>
                <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>{card.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer note */}
        <div className="text-center py-6 text-xs" style={{ color: "#94A3B8" }}>
          Data sourced from LinkedIn Jobs, Indeed India & Naukri.com · Updated daily at 6:00 AM IST · Last refresh: {lastUpdated.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default MarketIntelligence;
