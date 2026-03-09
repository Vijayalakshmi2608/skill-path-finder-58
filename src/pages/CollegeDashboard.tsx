import { useState } from "react";
import {
  Download, Send, Users, Settings, TrendingUp, TrendingDown,
  AlertTriangle, Target, BookOpen, Calendar, Award, BarChart3,
  ArrowUpRight, Bell, Zap, Building2, GraduationCap, Briefcase,
  ChevronRight, Search, Filter, ExternalLink, Clock, CheckCircle2,
  Trophy, Star, Layers, PieChart, Activity
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend
} from "recharts";

/* ─── mock data ─── */
const metrics = [
  { label: "Total Students Analyzed", value: "1,247", icon: Users, color: "#3B82F6", sub: "Across 5 departments" },
  { label: "Avg Readiness Score", value: "71/100", icon: TrendingUp, color: "#10B981", sub: "↑8 from last month" },
  { label: "Students Job-Ready (80+)", value: "342", icon: CheckCircle2, color: "#10B981", sub: "27% of total" },
  { label: "At-Risk Students (<40)", value: "89", icon: AlertTriangle, color: "#EF4444", sub: "7% — needs attention" },
  { label: "Top Hiring Sector", value: "Tech", icon: Briefcase, color: "#8B5CF6", sub: "64% of placements" },
];

const deptData = [
  { name: "CSE", ready: 78, inProgress: 15, atRisk: 7 },
  { name: "ECE", ready: 64, inProgress: 22, atRisk: 14 },
  { name: "Mechanical", ready: 42, inProgress: 30, atRisk: 28 },
  { name: "Civil", ready: 31, inProgress: 35, atRisk: 34 },
  { name: "Electrical", ready: 58, inProgress: 24, atRisk: 18 },
];

const skillGapsTable = [
  { dept: "CSE", missing1: "System Design", pct1: 78, missing2: "Docker", action: "Workshop on System Design" },
  { dept: "ECE", missing1: "Embedded C", pct1: 71, missing2: "RTOS", action: "Industry certification course" },
  { dept: "Mechanical", missing1: "Python", pct1: 65, missing2: "SolidWorks", action: "Add to curriculum" },
  { dept: "Civil", missing1: "AutoCAD", pct1: 58, missing2: "Project Management", action: "Industry training" },
];

const companyDemand = [
  { company: "Google", emoji: "🔵", needs: 45, skills: ["System Design", "Cloud"] },
  { company: "Microsoft", emoji: "🟢", needs: 30, skills: ["DSA", "C++"] },
  { company: "Amazon", emoji: "📦", needs: 50, skills: ["AWS", "ML basics"] },
  { company: "Flipkart", emoji: "🛒", needs: 25, skills: ["React", "Node.js"] },
];

const studentStrength = [
  { skill: "Python", count: 234 },
  { skill: "Java", count: 198 },
  { skill: "JavaScript", count: 167 },
  { skill: "React", count: 112 },
  { skill: "SQL", count: 145 },
];

const studentWeakness = [
  { skill: "System Design", count: 23, demand: 120 },
  { skill: "AWS", count: 15, demand: 80 },
  { skill: "Docker", count: 8, demand: 65 },
];

const predictions = [
  { icon: Target, color: "#10B981", title: "125 students predicted to get offers above ₹20 LPA", desc: "Based on readiness score > 85 and matching skills" },
  { icon: AlertTriangle, color: "#F59E0B", title: "45 students need intervention to avoid being unplaced", desc: "Readiness score < 35, missing 10+ critical skills" },
  { icon: Trophy, color: "#3B82F6", title: "Top 10 students most likely to get dream offers", desc: "Ranked by readiness, skill match, and interview prep" },
];

const topStudents = [
  { name: "Priya Sharma", score: 96, target: "Google SWE" },
  { name: "Arjun Patel", score: 94, target: "Microsoft SDE" },
  { name: "Sneha Reddy", score: 93, target: "Amazon SDE" },
  { name: "Rahul Kumar", score: 91, target: "Google ML" },
  { name: "Ananya Gupta", score: 90, target: "Meta SWE" },
];

const batchTabs = ["2025 Batch", "2026 Batch", "2027 Batch"];
const batchData: Record<string, { placed: number; target: number; pipeline: number; drives: string[] }> = {
  "2025 Batch": { placed: 412, target: 600, pipeline: 89, drives: ["Google — Mar 15", "Amazon — Mar 22", "Microsoft — Apr 1"] },
  "2026 Batch": { placed: 0, target: 650, pipeline: 34, drives: ["Flipkart Intern — Mar 10", "Google STEP — Apr 5"] },
  "2027 Batch": { placed: 0, target: 700, pipeline: 0, drives: ["No drives scheduled yet"] },
};

const interventions = [
  { icon: Send, title: "Send Skill-Building Workshop Invite", desc: "Target students missing key skills with workshop invites", action: "Send Invites" },
  { icon: Users, title: "Create Targeted Learning Groups", desc: "Auto-group students with the same skill gaps", action: "Create Groups" },
  { icon: Calendar, title: "Schedule Mock Interview Day", desc: "Practice sessions with industry mentors", action: "Schedule" },
  { icon: BarChart3, title: "Generate Department Gap Report", desc: "Detailed skill gap analysis for faculty review", action: "Generate" },
];

const activityFeed = [
  { icon: "📊", text: "23 new students analyzed today", time: "2 min ago" },
  { icon: "🎯", text: "5 students marked as 'job-ready' for Google", time: "15 min ago" },
  { icon: "📈", text: "Mechanical dept readiness up 5% this week", time: "1 hr ago" },
  { icon: "🏆", text: "3 students got offers from Amazon", time: "3 hr ago" },
  { icon: "📧", text: "Bulk workshop invite sent to 89 at-risk students", time: "5 hr ago" },
  { icon: "🔔", text: "Google campus drive confirmed for Mar 15", time: "Yesterday" },
];

const CollegeDashboard = () => {
  const [activeBatch, setActiveBatch] = useState("2025 Batch");

  return (
    <div className="min-h-screen" style={{ background: "#F8FAFC" }}>
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-lg">SkillScan</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium border border-blue-100">
                    Enterprise
                  </span>
                </div>
                <p className="text-xs text-slate-500 -mt-0.5">Placement Intelligence Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
              </button>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                PD
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* SECTION 1 — Dashboard Header */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
              <GraduationCap className="w-4 h-4" />
              <span>IIT Delhi — Placement Cell</span>
              <span className="text-slate-300">|</span>
              <span>Academic Year 2024-25</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              🎓 Placement Intelligence Dashboard
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-emerald-600 font-medium">Live — Last updated just now</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { icon: Download, label: "Export Report" },
              { icon: Send, label: "Send Bulk Invites" },
              { icon: Users, label: "View Students" },
              { icon: Settings, label: "Settings" },
            ].map((btn) => (
              <button
                key={btn.label}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
              >
                <btn.icon className="w-4 h-4" />
                {btn.label}
              </button>
            ))}
          </div>
        </section>

        {/* SECTION 2 — Key Metrics */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {metrics.map((m, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: m.color + "15" }}>
                  <m.icon className="w-5 h-5" style={{ color: m.color }} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-300" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{m.value}</p>
              <p className="text-sm text-slate-500 mt-0.5">{m.label}</p>
              <p className="text-xs text-slate-400 mt-1">{m.sub}</p>
            </div>
          ))}
        </section>

        {/* SECTION 3 — Readiness Distribution */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Student Readiness Distribution by Department</h2>
              <p className="text-sm text-slate-500">Percentage of students at each readiness level</p>
            </div>
            <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
              View Details <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fill: "#64748B", fontSize: 13 }} />
                <YAxis tick={{ fill: "#64748B", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13 }}
                />
                <Legend wrapperStyle={{ fontSize: 13 }} />
                <Bar dataKey="ready" name="Job Ready" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="inProgress" name="In Progress" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="atRisk" name="At Risk" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-slate-500 mt-4 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2.5">
            <span className="text-emerald-600 font-medium">87 students</span> in CSE department are job-ready for top tech firms
          </p>
        </section>

        {/* SECTION 4 — Skill Gaps Table */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Top Skill Gaps Across College</h2>
              <p className="text-sm text-slate-500">Department-level gap analysis with recommended actions</p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
                <Filter className="w-3 h-3" /> Filter
              </button>
              <button className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
                <Download className="w-3 h-3" /> Export
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-slate-500 font-medium">Department</th>
                  <th className="text-left py-3 px-4 text-slate-500 font-medium">Most Missing Skill</th>
                  <th className="text-left py-3 px-4 text-slate-500 font-medium">% Missing</th>
                  <th className="text-left py-3 px-4 text-slate-500 font-medium">2nd Missing Skill</th>
                  <th className="text-left py-3 px-4 text-slate-500 font-medium">Recommended Action</th>
                </tr>
              </thead>
              <tbody>
                {skillGapsTable.map((row, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-900">{row.dept}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 text-xs rounded-full bg-red-50 text-red-600 font-medium border border-red-100">
                        {row.missing1}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full rounded-full bg-red-400" style={{ width: `${row.pct1}%` }} />
                        </div>
                        <span className="text-red-600 font-medium">{row.pct1}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 text-xs rounded-full bg-amber-50 text-amber-600 font-medium border border-amber-100">
                        {row.missing2}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{row.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 5 — Company Demand vs Student Skills */}
        <section className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Building2 className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-bold text-slate-900">Top Companies Hiring</h3>
            </div>
            <div className="space-y-4">
              {companyDemand.map((c, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                  <span className="text-2xl">{c.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{c.company}</span>
                      <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full">
                        Needs {c.needs}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {c.skills.map((s) => (
                        <span key={s} className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Layers className="w-5 h-5 text-emerald-500" />
              <h3 className="text-lg font-bold text-slate-900">Student Skills Supply</h3>
            </div>
            <div className="space-y-3 mb-6">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Strong In</p>
              {studentStrength.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm text-slate-700 w-24">{s.skill}</span>
                  <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-400" style={{ width: `${(s.count / 250) * 100}%` }} />
                  </div>
                  <span className="text-sm font-medium text-slate-700 w-8 text-right">{s.count}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">⚠️ Critical Gaps</p>
              {studentWeakness.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-red-50 border border-red-100">
                  <span className="text-sm font-medium text-red-700">{s.skill}</span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-red-600">Only {s.count} proficient</span>
                    <span className="text-slate-400">/</span>
                    <span className="text-slate-500">{s.demand} needed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 6 — Placement Predictions */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">🤖 AI-Powered Placement Predictions</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {predictions.map((p, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: p.color + "15" }}>
                  <p.icon className="w-5 h-5" style={{ color: p.color }} />
                </div>
                <p className="font-semibold text-slate-900 text-sm mb-1">{p.title}</p>
                <p className="text-xs text-slate-500">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" /> Top 5 Dream Offer Candidates
            </h3>
            <div className="grid sm:grid-cols-5 gap-3">
              {topStudents.map((s, i) => (
                <div key={i} className="flex flex-col items-center text-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600 mb-2">
                    #{i + 1}
                  </div>
                  <p className="text-sm font-medium text-slate-900">{s.name}</p>
                  <p className="text-xs text-emerald-600 font-medium">Score: {s.score}</p>
                  <p className="text-xs text-slate-500">{s.target}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 7 — Batch Tracking */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">📊 Batch Tracking</h2>
          <div className="flex gap-2 mb-6">
            {batchTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveBatch(tab)}
                className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${
                  activeBatch === tab
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          {(() => {
            const b = batchData[activeBatch];
            const pct = b.target > 0 ? Math.round((b.placed / b.target) * 100) : 0;
            return (
              <div className="grid sm:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-slate-500 mb-2">Placement Progress</p>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-3xl font-extrabold text-slate-900">{b.placed}</span>
                    <span className="text-sm text-slate-400 mb-1">/ {b.target} target</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: pct > 60 ? "#10B981" : pct > 30 ? "#F59E0B" : "#3B82F6",
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{pct}% complete</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-2">Interview Pipeline</p>
                  <p className="text-3xl font-extrabold text-slate-900">{b.pipeline}</p>
                  <p className="text-xs text-slate-400">students in active interviews</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-2">Upcoming Campus Drives</p>
                  <div className="space-y-2">
                    {b.drives.map((d, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Calendar className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-slate-700">{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </section>

        {/* SECTION 8 — Intervention Tools */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-4">🛠 Proactive Placement Support</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {interventions.map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                  <item.icon className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="font-semibold text-sm text-slate-900 mb-1">{item.title}</h3>
                <p className="text-xs text-slate-500 mb-4">{item.desc}</p>
                <button className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  {item.action} <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 9 — Trending Insights */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">📡 Market Intelligence</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
              <p className="text-xs text-purple-600 font-medium mb-2 uppercase tracking-wider">Trending Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {["GenAI", "Prompt Engineering", "PySpark", "Tableau", "Kubernetes"].map((s) => (
                  <span key={s} className="px-2.5 py-1 text-xs rounded-full bg-purple-100 text-purple-700 font-medium">{s}</span>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
              <p className="text-xs text-emerald-600 font-medium mb-2 uppercase tracking-wider">Package by Score</p>
              <div className="space-y-1.5 text-sm">
                <p className="text-slate-700"><strong className="text-emerald-600">80+</strong> → ₹18-25 LPA</p>
                <p className="text-slate-700"><strong className="text-amber-500">60-80</strong> → ₹12-18 LPA</p>
                <p className="text-slate-700"><strong className="text-red-500">&lt;60</strong> → ₹6-12 LPA</p>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
              <p className="text-xs text-blue-600 font-medium mb-2 uppercase tracking-wider">New Companies</p>
              <p className="text-2xl font-extrabold text-blue-600">8</p>
              <p className="text-sm text-slate-600">new companies hiring from your college this semester</p>
            </div>
          </div>
        </section>

        {/* SECTION 10 — Activity Feed */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" /> Recent Activity
            </h2>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="space-y-3">
            {activityFeed.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-lg">{item.icon}</span>
                <span className="flex-1 text-sm text-slate-700">{item.text}</span>
                <span className="text-xs text-slate-400 shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 11 — Export & Share */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-8">
          {[
            { icon: Download, label: "Download Full Placement Report", desc: "Complete PDF with all analytics", color: "#3B82F6" },
            { icon: Send, label: "Share Dashboard with HOD", desc: "Send view-only access link", color: "#8B5CF6" },
            { icon: Calendar, label: "Schedule Strategy Meeting", desc: "Set up placement strategy session", color: "#10B981" },
            { icon: Target, label: "Set Readiness Targets", desc: "Define goals for next semester", color: "#F59E0B" },
          ].map((item, i) => (
            <button key={i} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all text-left group">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: item.color + "15" }}>
                <item.icon className="w-5 h-5" style={{ color: item.color }} />
              </div>
              <p className="font-semibold text-sm text-slate-900 mb-0.5">{item.label}</p>
              <p className="text-xs text-slate-500">{item.desc}</p>
            </button>
          ))}
        </section>
      </main>
    </div>
  );
};

export default CollegeDashboard;
