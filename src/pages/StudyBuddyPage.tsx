import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Users, UserPlus, Trophy, Flame, Target, BookOpen,
  MessageSquare, Clock, Star, ChevronRight, CheckCircle2, Zap,
  Calendar, Award, TrendingUp, Sparkles
} from "lucide-react";

/* ───── mock data ───── */

const MATCHES = [
  { id: 1, name: "Arjun Mehta", college: "IIT Delhi", avatar: "AM", skills: ["Docker", "Kubernetes"], streak: 12, readiness: 68, online: true },
  { id: 2, name: "Priya Sharma", college: "IIT Delhi", avatar: "PS", skills: ["Docker", "AWS"], streak: 8, readiness: 72, online: true },
  { id: 3, name: "Rahul Verma", college: "IIT Delhi", avatar: "RV", skills: ["Docker", "CI/CD"], streak: 5, readiness: 61, online: false },
  { id: 4, name: "Sneha Patel", college: "BITS Pilani", avatar: "SP", skills: ["System Design", "Docker"], streak: 15, readiness: 75, online: true },
  { id: 5, name: "Karan Singh", college: "IIT Bombay", avatar: "KS", skills: ["Docker", "Terraform"], streak: 3, readiness: 55, online: false },
];

const GROUPS = [
  {
    id: 1, name: "Docker Deep Dive", skill: "Docker", members: [
      { name: "You", avatar: "YU", progress: 65 },
      { name: "Arjun M.", avatar: "AM", progress: 58 },
      { name: "Priya S.", avatar: "PS", progress: 71 },
    ], weeklyGoal: 5, completed: 3, streak: 4,
  },
  {
    id: 2, name: "System Design Squad", skill: "System Design", members: [
      { name: "You", avatar: "YU", progress: 40 },
      { name: "Sneha P.", avatar: "SP", progress: 52 },
    ], weeklyGoal: 4, completed: 2, streak: 2,
  },
];

const LEADERBOARD = [
  { rank: 1, name: "Sneha Patel", avatar: "SP", streak: 15, points: 2340, badge: "🔥" },
  { rank: 2, name: "Arjun Mehta", avatar: "AM", streak: 12, points: 1890, badge: "⚡" },
  { rank: 3, name: "You", avatar: "YU", streak: 9, points: 1650, badge: "🌟", isYou: true },
  { rank: 4, name: "Priya Sharma", avatar: "PS", streak: 8, points: 1420, badge: "" },
  { rank: 5, name: "Rahul Verma", avatar: "RV", streak: 5, points: 980, badge: "" },
  { rank: 6, name: "Karan Singh", avatar: "KS", streak: 3, points: 640, badge: "" },
];

const CHALLENGES = [
  { id: 1, title: "Dockerize a Node App", points: 100, deadline: "2 days left", participants: 14, difficulty: "medium", completed: false },
  { id: 2, title: "Design a URL Shortener", points: 150, deadline: "4 days left", participants: 9, difficulty: "hard", completed: false },
  { id: 3, title: "CI/CD Pipeline Setup", points: 80, deadline: "6 days left", participants: 21, difficulty: "easy", completed: true },
  { id: 4, title: "Kubernetes Pod Networking", points: 120, deadline: "Next week", participants: 7, difficulty: "hard", completed: false },
];

/* ───── component ───── */

const StudyBuddyPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"matches" | "groups" | "leaderboard" | "challenges">("matches");
  const [selectedSkill, setSelectedSkill] = useState("Docker");

  const skills = ["Docker", "System Design", "AWS", "Kubernetes", "CI/CD", "React"];

  const getDiffColor = (d: string) => {
    if (d === "easy") return "bg-secondary/15 text-secondary border-secondary/25";
    if (d === "medium") return "bg-amber-400/15 text-amber-400 border-amber-400/25";
    return "bg-destructive/15 text-destructive border-destructive/25";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <h1 className="font-heading font-bold text-lg">Find a Study Buddy</h1>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Hero banner */}
        <div className="card-surface p-6 sm:p-8 bg-gradient-to-r from-primary/10 via-card to-secondary/10 border-primary/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-heading font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                3 others in your college are learning Docker this week
              </h2>
              <p className="text-muted-foreground mt-1">Connect with peers who share your skill gaps and learn together</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {["AM", "PS", "RV"].map(a => (
                  <div key={a} className="w-8 h-8 rounded-full bg-primary/20 border-2 border-card flex items-center justify-center text-xs font-bold text-primary">
                    {a}
                  </div>
                ))}
              </div>
              <span className="text-sm text-muted-foreground ml-2">+2 more</span>
            </div>
          </div>
        </div>

        {/* Streak & Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Flame, label: "Your Streak", value: "9 days", color: "text-amber-400", bg: "bg-amber-400/10" },
            { icon: Users, label: "Study Groups", value: "2 active", color: "text-primary", bg: "bg-primary/10" },
            { icon: Trophy, label: "Leaderboard", value: "#3 rank", color: "text-secondary", bg: "bg-secondary/10" },
            { icon: Target, label: "Challenges Won", value: "7 total", color: "text-primary", bg: "bg-primary/10" },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="card-surface p-4 text-center">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mx-auto mb-2`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="text-lg font-heading font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted p-1 rounded-xl">
          {([
            { key: "matches", label: "Find Buddies", icon: UserPlus },
            { key: "groups", label: "My Groups", icon: Users },
            { key: "leaderboard", label: "Leaderboard", icon: Trophy },
            { key: "challenges", label: "Challenges", icon: Target },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" /> <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* ─── MATCHES TAB ─── */}
        {activeTab === "matches" && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Skill filter */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Match by skill gap</label>
              <div className="flex flex-wrap gap-2">
                {skills.map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSkill(s)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                      selectedSkill === s
                        ? "bg-primary/15 border-primary text-primary"
                        : "bg-muted border-border text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Match cards */}
            <div className="space-y-3">
              {MATCHES.filter(m => m.skills.includes(selectedSkill)).map(m => (
                <div key={m.id} className="card-surface p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary">
                      {m.avatar}
                    </div>
                    {m.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-secondary rounded-full border-2 border-card" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground">{m.name}</h4>
                      {m.online && <span className="text-xs text-secondary">Online</span>}
                    </div>
                    <p className="text-sm text-muted-foreground">{m.college} · Readiness: {m.readiness}%</p>
                    <div className="flex gap-1.5 mt-1.5">
                      {m.skills.map(s => (
                        <span key={s} className={`px-2 py-0.5 text-xs rounded-full border ${
                          s === selectedSkill ? "bg-primary/15 text-primary border-primary/25" : "bg-muted text-muted-foreground border-border"
                        }`}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-amber-400">
                        <Flame className="w-3.5 h-3.5" />
                        <span className="text-sm font-bold">{m.streak}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">streak</p>
                    </div>
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:brightness-110 transition-all flex items-center gap-1.5">
                      <UserPlus className="w-3.5 h-3.5" /> Connect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── GROUPS TAB ─── */}
        {activeTab === "groups" && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Create group CTA */}
            <button className="w-full card-surface p-5 border-dashed border-2 border-primary/30 hover:border-primary/60 transition-all flex items-center justify-center gap-3 text-primary">
              <UserPlus className="w-5 h-5" />
              <span className="font-medium">Create a New Study Group (2-4 people)</span>
            </button>

            {GROUPS.map(g => (
              <div key={g.id} className="card-surface p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading font-bold text-foreground flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      {g.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">Focus: {g.skill} · {g.members.length} members</p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Flame className="w-4 h-4" />
                    <span className="font-bold">{g.streak} week streak</span>
                  </div>
                </div>

                {/* Members progress */}
                <div className="space-y-3">
                  {g.members.map(m => (
                    <div key={m.name} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">
                        {m.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-foreground font-medium">{m.name}</span>
                          <span className="text-xs text-muted-foreground">{m.progress}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${m.progress >= 70 ? "bg-secondary" : m.progress >= 40 ? "bg-primary" : "bg-amber-400"}`}
                            style={{ width: `${m.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Weekly goal */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground">Weekly Goal: {g.completed}/{g.weeklyGoal} tasks</span>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: g.weeklyGoal }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full ${i < g.completed ? "bg-secondary" : "bg-border"}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 py-2.5 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-all flex items-center justify-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Group Chat
                  </button>
                  <button className="flex-1 py-2.5 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-all flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4" /> Schedule Session
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── LEADERBOARD TAB ─── */}
        {activeTab === "leaderboard" && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="card-surface p-6">
              <h3 className="font-heading font-bold text-foreground flex items-center gap-2 mb-5">
                <Trophy className="w-5 h-5 text-amber-400" /> Study Streak Leaderboard
              </h3>

              {/* Top 3 podium */}
              <div className="flex items-end justify-center gap-4 mb-8">
                {[LEADERBOARD[1], LEADERBOARD[0], LEADERBOARD[2]].map((p, idx) => {
                  const heights = ["h-24", "h-32", "h-20"];
                  const ranks = [2, 1, 3];
                  const medalColors = [
                    "bg-gray-300/20 border-gray-300/40",
                    "bg-amber-400/20 border-amber-400/40",
                    "bg-amber-600/20 border-amber-600/40",
                  ];
                  return (
                    <div key={p.name} className="flex flex-col items-center">
                      <div className={`w-14 h-14 rounded-full ${p.isYou ? "bg-primary/20 ring-2 ring-primary" : "bg-primary/15"} flex items-center justify-center text-sm font-bold text-primary mb-2`}>
                        {p.avatar}
                      </div>
                      <p className={`text-sm font-medium ${p.isYou ? "text-primary" : "text-foreground"}`}>{p.isYou ? "You" : p.name.split(" ")[0]}</p>
                      <p className="text-xs text-muted-foreground">{p.points} pts</p>
                      <div className={`${heights[idx]} w-20 ${medalColors[idx]} border rounded-t-lg mt-2 flex items-center justify-center`}>
                        <span className="text-2xl font-heading font-extrabold text-foreground">#{ranks[idx]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Full list */}
              <div className="space-y-2">
                {LEADERBOARD.map(p => (
                  <div
                    key={p.rank}
                    className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                      p.isYou ? "bg-primary/10 border border-primary/20" : "hover:bg-muted"
                    }`}
                  >
                    <span className={`w-8 text-center font-heading font-bold ${p.rank <= 3 ? "text-amber-400" : "text-muted-foreground"}`}>
                      {p.rank}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">
                      {p.avatar}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${p.isYou ? "text-primary" : "text-foreground"}`}>
                        {p.isYou ? "You" : p.name} {p.badge}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400">
                      <Flame className="w-3.5 h-3.5" />
                      <span className="text-sm font-bold">{p.streak}</span>
                    </div>
                    <span className="text-sm text-muted-foreground w-20 text-right">{p.points} pts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* How points work */}
            <div className="card-surface p-5">
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" /> How to Earn Points
              </h4>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { action: "Complete daily study task", pts: "+10" },
                  { action: "Maintain 7-day streak", pts: "+50 bonus" },
                  { action: "Win a weekly challenge", pts: "+100-150" },
                  { action: "Help a buddy (peer review)", pts: "+25" },
                ].map(r => (
                  <div key={r.action} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm text-foreground">{r.action}</span>
                    <span className="text-sm font-bold text-secondary">{r.pts}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── CHALLENGES TAB ─── */}
        {activeTab === "challenges" && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-foreground">Weekly Challenges</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" /> Resets every Monday
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {CHALLENGES.map(c => (
                <div key={c.id} className={`card-surface p-5 space-y-4 ${c.completed ? "opacity-60" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getDiffColor(c.difficulty)}`}>
                          {c.difficulty}
                        </span>
                        {c.completed && (
                          <span className="flex items-center gap-1 text-xs text-secondary">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Done
                          </span>
                        )}
                      </div>
                      <h4 className="font-medium text-foreground">{c.title}</h4>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-amber-400">
                        <Zap className="w-4 h-4" />
                        <span className="font-bold">{c.points}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {c.deadline}
                    </span>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {c.participants} participating
                    </span>
                  </div>

                  {!c.completed ? (
                    <button className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:brightness-110 transition-all flex items-center justify-center gap-2">
                      <Target className="w-4 h-4" /> Join Challenge
                    </button>
                  ) : (
                    <div className="w-full py-2.5 bg-secondary/10 text-secondary rounded-lg text-sm font-medium text-center flex items-center justify-center gap-2">
                      <Award className="w-4 h-4" /> Challenge Completed!
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Past challenges */}
            <div className="card-surface p-5">
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Your Challenge Stats
              </h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-heading font-bold text-foreground">7</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold text-secondary">680</p>
                  <p className="text-xs text-muted-foreground">Points Earned</p>
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold text-amber-400">3</p>
                  <p className="text-xs text-muted-foreground">Win Streak</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudyBuddyPage;
