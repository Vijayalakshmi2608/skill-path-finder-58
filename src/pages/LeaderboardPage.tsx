import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Trophy,
  Medal,
  TrendingUp,
  Flame,
  Crown,
  Star,
  Clock,
  Users,
  Zap,
  Award,
  Calendar,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* ─── Mock Data ─── */

const TOP_STUDENTS = [
  { rank: 1, name: "Ananya Gupta", college: "IIT Delhi", skills: 14, streak: 21, points: 2840, avatar: "AG", badges: ["DSA Master 💻", "Consistency King 👑"] },
  { rank: 2, name: "Rohan Mehta", college: "BITS Pilani", skills: 12, streak: 18, points: 2560, avatar: "RM", badges: ["Cloud Champ ☁️"] },
  { rank: 3, name: "Priya Sharma", college: "NIT Trichy", skills: 11, streak: 15, points: 2310, avatar: "PS", badges: ["Full Stack Fire 🔥"] },
  { rank: 4, name: "Arjun Patel", college: "VIT Vellore", skills: 10, streak: 14, points: 2180, avatar: "AP", badges: ["Speed Learner ⚡"] },
  { rank: 5, name: "Sneha Reddy", college: "IIIT Hyderabad", skills: 9, streak: 12, points: 1950, avatar: "SR", badges: [] },
  { rank: 6, name: "Karthik S", college: "DTU Delhi", skills: 9, streak: 11, points: 1880, avatar: "KS", badges: ["DSA Master 💻"] },
  { rank: 7, name: "Meera Joshi", college: "COEP Pune", skills: 8, streak: 10, points: 1740, avatar: "MJ", badges: [] },
  { rank: 8, name: "Vikram Singh", college: "IIT Bombay", skills: 8, streak: 9, points: 1690, avatar: "VS", badges: ["Cloud Champ ☁️"] },
  { rank: 9, name: "Divya Nair", college: "NSUT Delhi", skills: 7, streak: 8, points: 1520, avatar: "DN", badges: [] },
  { rank: 10, name: "Rahul Kumar", college: "SRM Chennai", skills: 7, streak: 7, points: 1410, avatar: "RK", badges: [] },
];

const DEPARTMENTS = [
  { rank: 1, name: "Computer Science", college: "IIT Delhi", students: 342, avgSkills: 8.2, growth: "+34%" },
  { rank: 2, name: "IT Department", college: "BITS Pilani", students: 280, avgSkills: 7.8, growth: "+28%" },
  { rank: 3, name: "ECE Department", college: "NIT Trichy", students: 195, avgSkills: 6.9, growth: "+22%" },
  { rank: 4, name: "Data Science", college: "IIIT Hyderabad", students: 156, avgSkills: 7.5, growth: "+19%" },
  { rank: 5, name: "Mechanical (CS Minor)", college: "VIT Vellore", students: 88, avgSkills: 5.4, growth: "+15%" },
];

const MOST_IMPROVED = [
  { name: "Lakshmi Iyer", college: "Anna University", before: 23, after: 71, skill: "System Design", weeks: 3, avatar: "LI" },
  { name: "Amit Verma", college: "LNMIIT Jaipur", before: 18, after: 65, skill: "Docker & K8s", weeks: 4, avatar: "AV" },
  { name: "Pooja Rao", college: "PES University", before: 31, after: 78, skill: "React + TypeScript", weeks: 2, avatar: "PR" },
];

const SPRINT_CHALLENGE = {
  title: "7-Day Full Stack Sprint 🚀",
  description: "Build a production-ready MERN app in 7 days. Ship it. Get ranked.",
  endsIn: "3 days 14 hours",
  participants: 1247,
  tasks: [
    { day: 1, task: "Set up project + auth", points: 100 },
    { day: 2, task: "Database schema + API", points: 150 },
    { day: 3, task: "Frontend UI components", points: 150 },
    { day: 4, task: "CRUD operations", points: 200 },
    { day: 5, task: "Testing + error handling", points: 200 },
    { day: 6, task: "Deploy to production", points: 250 },
    { day: 7, task: "Demo + documentation", points: 300 },
  ],
  topRunners: [
    { name: "Ananya G.", points: 850, day: 6 },
    { name: "Rohan M.", points: 800, day: 5 },
    { name: "Karthik S.", points: 650, day: 5 },
  ],
};

const BADGES = [
  { icon: "☁️", name: "Cloud Champ", desc: "Mastered 3+ cloud skills", holders: 142, color: "bg-primary/15 text-primary border-primary/30" },
  { icon: "💻", name: "DSA Master", desc: "Solved 100+ problems", holders: 89, color: "bg-secondary/15 text-secondary border-secondary/30" },
  { icon: "👑", name: "Consistency King", desc: "30-day streak achieved", holders: 56, color: "bg-[hsl(45_100%_60%/0.15)] text-[hsl(45_100%_60%)] border-[hsl(45_100%_60%/0.3)]" },
  { icon: "🔥", name: "Full Stack Fire", desc: "Completed MERN roadmap", holders: 78, color: "bg-destructive/15 text-destructive border-destructive/30" },
  { icon: "⚡", name: "Speed Learner", desc: "Finished roadmap 50% faster", holders: 34, color: "bg-[hsl(280_80%_60%/0.15)] text-[hsl(280_80%_60%)] border-[hsl(280_80%_60%/0.3)]" },
  { icon: "🤝", name: "Team Player", desc: "Led 3+ study groups", holders: 67, color: "bg-primary/15 text-primary border-primary/30" },
];

const WEEKLY_PRIZES = [
  { place: "🥇 1st Place", prize: "Certificate of Excellence + LinkedIn Badge + ₹500 Amazon Voucher", color: "bg-[hsl(45_100%_60%/0.1)] border-[hsl(45_100%_60%/0.3)]" },
  { place: "🥈 2nd Place", prize: "Certificate of Merit + LinkedIn Badge", color: "bg-muted border-border" },
  { place: "🥉 3rd Place", prize: "Certificate of Achievement", color: "bg-[hsl(25_80%_55%/0.1)] border-[hsl(25_80%_55%/0.3)]" },
  { place: "🏅 Top 10", prize: "Featured on College Dashboard + Recruiter Visibility", color: "bg-card border-border" },
];

const COLLEGE_RANKINGS = [
  { rank: 1, name: "IIT Delhi", students: 1245, avgScore: 78, topSkill: "System Design", badge: "🏆" },
  { rank: 2, name: "BITS Pilani", students: 980, avgScore: 74, topSkill: "Full Stack", badge: "🥈" },
  { rank: 3, name: "NIT Trichy", students: 856, avgScore: 71, topSkill: "DevOps", badge: "🥉" },
  { rank: 4, name: "IIIT Hyderabad", students: 720, avgScore: 69, topSkill: "ML/AI", badge: "4" },
  { rank: 5, name: "VIT Vellore", students: 1580, avgScore: 65, topSkill: "Web Dev", badge: "5" },
  { rank: 6, name: "DTU Delhi", students: 890, avgScore: 63, topSkill: "DSA", badge: "6" },
  { rank: 7, name: "COEP Pune", students: 540, avgScore: 61, topSkill: "Backend", badge: "7" },
  { rank: 8, name: "SRM Chennai", students: 2100, avgScore: 58, topSkill: "Frontend", badge: "8" },
];

type Tab = "students" | "departments" | "improved" | "sprint";

const podiumColors = [
  "from-[hsl(45_100%_60%/0.2)] to-transparent border-[hsl(45_100%_60%/0.3)]",
  "from-muted/50 to-transparent border-border",
  "from-[hsl(25_80%_55%/0.15)] to-transparent border-[hsl(25_80%_55%/0.3)]",
];

/* ─── Component ─── */

const LeaderboardPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>("students");

  const tabs: { key: Tab; label: string; icon: typeof Trophy }[] = [
    { key: "students", label: "Top Students", icon: Trophy },
    { key: "departments", label: "Departments", icon: TrendingUp },
    { key: "improved", label: "Most Improved", icon: Star },
    { key: "sprint", label: "Hackathon Sprint", icon: Flame },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        {/* Hero */}
        <section className="py-12 border-b border-border relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
          <div className="section-container relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-8 h-8 text-[hsl(45_100%_60%)]" />
              <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-foreground">
                Leaderboard
              </h1>
            </div>
            <p className="text-muted-foreground text-lg mb-2">
              This week's top performers across all colleges
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Week of {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                8,240 active students
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Resets every Monday
              </span>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <section className="border-b border-border bg-card/50">
          <div className="section-container">
            <div className="flex gap-1 overflow-x-auto py-2 -mb-px">
              {tabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-3 rounded-t-lg text-sm font-semibold whitespace-nowrap transition-colors border-b-2",
                    activeTab === key
                      ? "border-primary text-primary bg-primary/5"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Tab Content */}
        <section className="py-10">
          <div className="section-container">
            {/* ── Top Students ── */}
            {activeTab === "students" && (
              <div>
                <h2 className="text-2xl font-heading font-bold text-foreground mb-8">
                  🏆 Top Students This Week
                  <span className="text-sm font-normal text-muted-foreground ml-2">by skills learned</span>
                </h2>

                {/* Podium */}
                <div className="flex items-end justify-center gap-4 mb-10">
                  {[1, 0, 2].map((idx) => {
                    const s = TOP_STUDENTS[idx];
                    const heights = ["h-36", "h-44", "h-28"];
                    const order = [1, 0, 2];
                    return (
                      <div key={s.rank} className="flex flex-col items-center" style={{ order: order[idx] }}>
                        <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-lg font-bold text-primary mb-2">
                          {s.avatar}
                        </div>
                        <p className="text-sm font-semibold text-foreground mb-1">{s.name}</p>
                        <p className="text-xs text-muted-foreground mb-2">{s.skills} skills</p>
                        <div
                          className={cn(
                            "w-24 sm:w-32 rounded-t-xl bg-gradient-to-t border border-b-0 flex items-center justify-center",
                            heights[idx],
                            podiumColors[idx]
                          )}
                        >
                          <span className="text-3xl font-heading font-extrabold text-foreground">
                            {["🥈", "🥇", "🥉"][idx]}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Full list */}
                <div className="card-surface overflow-hidden">
                  <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 p-4 border-b border-border text-xs font-semibold text-muted-foreground">
                    <span>Rank</span>
                    <span>Student</span>
                    <span className="text-center">Skills</span>
                    <span className="text-center">Streak</span>
                    <span className="text-right">Points</span>
                  </div>
                  {TOP_STUDENTS.map((s) => (
                    <div
                      key={s.rank}
                      className={cn(
                        "grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 p-4 border-b border-border last:border-0 items-center hover:bg-muted/30 transition-colors",
                        s.rank <= 3 && "bg-[hsl(45_100%_60%/0.03)]"
                      )}
                    >
                      <span className="text-sm font-bold text-muted-foreground w-8">
                        {s.rank <= 3 ? ["🥇", "🥈", "🥉"][s.rank - 1] : `#${s.rank}`}
                      </span>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                          {s.avatar}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.college}</p>
                        </div>
                        {s.badges.length > 0 && (
                          <div className="hidden sm:flex gap-1">
                            {s.badges.map((b) => (
                              <span key={b} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary whitespace-nowrap">
                                {b}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-foreground text-center">{s.skills}</span>
                      <span className="text-sm text-muted-foreground text-center flex items-center gap-1 justify-center">
                        <Flame className="w-3.5 h-3.5 text-destructive" />
                        {s.streak}
                      </span>
                      <span className="text-sm font-bold text-primary text-right">{s.points.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Departments ── */}
            {activeTab === "departments" && (
              <div>
                <h2 className="text-2xl font-heading font-bold text-foreground mb-8">
                  🏆 Fastest Growing Departments
                </h2>
                <div className="space-y-3">
                  {DEPARTMENTS.map((d) => (
                    <div key={d.rank} className="card-surface p-5 flex items-center gap-4 hover-lift">
                      <span className="text-2xl font-heading font-extrabold text-muted-foreground w-10 text-center">
                        {d.rank <= 3 ? ["🥇", "🥈", "🥉"][d.rank - 1] : `#${d.rank}`}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-foreground">{d.name}</h3>
                        <p className="text-sm text-muted-foreground">{d.college}</p>
                      </div>
                      <div className="text-center px-4">
                        <p className="text-lg font-bold text-foreground">{d.students}</p>
                        <p className="text-xs text-muted-foreground">students</p>
                      </div>
                      <div className="text-center px-4">
                        <p className="text-lg font-bold text-foreground">{d.avgSkills}</p>
                        <p className="text-xs text-muted-foreground">avg skills</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-secondary">{d.growth}</span>
                        <p className="text-xs text-muted-foreground">this week</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Most Improved ── */}
            {activeTab === "improved" && (
              <div>
                <h2 className="text-2xl font-heading font-bold text-foreground mb-8">
                  🏆 Most Improved Students
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
                  {MOST_IMPROVED.map((s, i) => (
                    <div key={s.name} className="card-surface p-6 text-center hover-lift">
                      <span className="text-3xl mb-3 block">
                        {["🥇", "🥈", "🥉"][i]}
                      </span>
                      <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-lg font-bold text-primary mx-auto mb-3">
                        {s.avatar}
                      </div>
                      <h3 className="text-base font-semibold text-foreground">{s.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{s.college}</p>

                      <div className="flex items-center justify-center gap-3 mb-3">
                        <div className="text-center">
                          <p className="text-2xl font-heading font-bold text-destructive">{s.before}%</p>
                          <p className="text-xs text-muted-foreground">Before</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                        <div className="text-center">
                          <p className="text-2xl font-heading font-bold text-secondary">{s.after}%</p>
                          <p className="text-xs text-muted-foreground">After</p>
                        </div>
                      </div>

                      <p className="text-sm text-foreground font-medium">{s.skill}</p>
                      <p className="text-xs text-muted-foreground">
                        +{s.after - s.before}% in {s.weeks} weeks
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Hackathon Sprint ── */}
            {activeTab === "sprint" && (
              <div>
                <div className="card-surface p-8 mb-8 border-2 border-primary/30 relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/5 blur-3xl" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <Flame className="w-6 h-6 text-destructive" />
                      <h2 className="text-2xl font-heading font-bold text-foreground">
                        {SPRINT_CHALLENGE.title}
                      </h2>
                    </div>
                    <p className="text-muted-foreground mb-4">{SPRINT_CHALLENGE.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm mb-6">
                      <span className="flex items-center gap-1.5 text-destructive font-semibold">
                        <Clock className="w-4 h-4" />
                        Ends in {SPRINT_CHALLENGE.endsIn}
                      </span>
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        {SPRINT_CHALLENGE.participants.toLocaleString()} participants
                      </span>
                    </div>
                    <Button>
                      <Zap className="w-4 h-4 mr-1.5" />
                      Join Sprint Challenge
                    </Button>
                  </div>
                </div>

                {/* Sprint Daily Tasks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="card-surface p-6">
                    <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Daily Tasks</h3>
                    <div className="space-y-3">
                      {SPRINT_CHALLENGE.tasks.map((t) => (
                        <div key={t.day} className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-primary/15 text-primary text-sm font-bold flex items-center justify-center shrink-0">
                            D{t.day}
                          </span>
                          <span className="text-sm text-foreground flex-1">{t.task}</span>
                          <span className="text-xs font-semibold text-primary">{t.points} pts</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 text-right">
                      Total: {SPRINT_CHALLENGE.tasks.reduce((s, t) => s + t.points, 0)} points
                    </p>
                  </div>

                  <div className="card-surface p-6">
                    <h3 className="text-lg font-heading font-semibold text-foreground mb-4">Sprint Leaders</h3>
                    <div className="space-y-4">
                      {SPRINT_CHALLENGE.topRunners.map((r, i) => (
                        <div key={r.name} className="flex items-center gap-3">
                          <span className="text-lg">{["🥇", "🥈", "🥉"][i]}</span>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-foreground">{r.name}</p>
                            <p className="text-xs text-muted-foreground">Day {r.day}</p>
                          </div>
                          <span className="text-sm font-bold text-primary">{r.points} pts</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── Badges Section ── */}
        <section className="py-10 border-t border-border bg-card/30">
          <div className="section-container">
            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
              🎖️ Achievement Badges
            </h2>
            <p className="text-muted-foreground mb-8">Earn badges by mastering skills and staying consistent</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {BADGES.map((b) => (
                <div
                  key={b.name}
                  className={cn("rounded-xl border p-4 text-center hover-lift transition-all", b.color)}
                >
                  <span className="text-3xl block mb-2">{b.icon}</span>
                  <h3 className="text-sm font-semibold mb-1">{b.name}</h3>
                  <p className="text-xs opacity-80 mb-2">{b.desc}</p>
                  <p className="text-xs opacity-60">{b.holders} holders</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Weekly Prizes ── */}
        <section className="py-10 border-t border-border">
          <div className="section-container">
            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
              🎁 Weekly Prizes & Recognition
            </h2>
            <p className="text-muted-foreground mb-8">Top performers receive certificates and recruiter visibility</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {WEEKLY_PRIZES.map((p) => (
                <div key={p.place} className={cn("rounded-xl border p-5 hover-lift", p.color)}>
                  <h3 className="text-base font-semibold text-foreground mb-2">{p.place}</h3>
                  <p className="text-sm text-muted-foreground">{p.prize}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── College Rankings ── */}
        <section className="py-10 border-t border-border bg-card/30">
          <div className="section-container">
            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
              🏫 College-Wide Rankings
            </h2>
            <p className="text-muted-foreground mb-8">How colleges stack up against each other</p>
            <div className="card-surface overflow-hidden">
              <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 p-4 border-b border-border text-xs font-semibold text-muted-foreground">
                <span>Rank</span>
                <span>College</span>
                <span className="text-center">Students</span>
                <span className="text-center">Avg Score</span>
                <span className="text-right">Top Skill</span>
              </div>
              {COLLEGE_RANKINGS.map((c) => (
                <div
                  key={c.rank}
                  className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 p-4 border-b border-border last:border-0 items-center hover:bg-muted/30 transition-colors"
                >
                  <span className="text-sm font-bold text-muted-foreground w-8 text-center">
                    {c.rank <= 3 ? c.badge : `#${c.rank}`}
                  </span>
                  <span className="text-sm font-semibold text-foreground">{c.name}</span>
                  <span className="text-sm text-muted-foreground text-center">{c.students.toLocaleString()}</span>
                  <div className="flex items-center gap-2 justify-center">
                    <Progress value={c.avgScore} className="h-1.5 w-16" />
                    <span className="text-sm font-semibold text-foreground">{c.avgScore}%</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary text-right whitespace-nowrap">
                    {c.topSkill}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default LeaderboardPage;
