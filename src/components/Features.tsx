import { TrendingUp, BarChart3, Calendar, Target } from "lucide-react";

const features = [
  {
    title: "Real-Time Job Market Intelligence",
    desc: "AI scans live job postings to understand what companies actually want TODAY — not what was relevant 6 months ago.",
    icon: TrendingUp,
    visual: (
      <div className="space-y-3">
        {["Frontend Engineer — Google", "ML Engineer — Meta", "DevOps — Amazon"].map((j, i) => (
          <div key={i} className="card-surface p-3 flex items-center gap-3 hover-lift" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-sm text-foreground">{j}</span>
            <span className="ml-auto text-xs text-muted-foreground">Live</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Your Personal Skill Gap Report",
    desc: "Color-coded breakdown of every skill: Strong ✅, Learning 🔄, or Missing ❌ — so you know exactly where you stand.",
    icon: BarChart3,
    visual: (
      <div className="space-y-3">
        {[
          { name: "React", pct: 90, color: "bg-secondary" },
          { name: "TypeScript", pct: 65, color: "bg-primary" },
          { name: "Docker", pct: 15, color: "bg-destructive" },
        ].map((s) => (
          <div key={s.name}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-foreground">{s.name}</span>
              <span className="text-muted-foreground">{s.pct}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className={`h-full ${s.color} rounded-full transition-all duration-1000`} style={{ width: `${s.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "AI-Curated 30-Day Learning Roadmap",
    desc: "Day-by-day plan with courses from Coursera, YouTube, and GitHub — tailored exactly to your skill gaps.",
    icon: Calendar,
    visual: (
      <div className="space-y-2">
        {[
          { day: "Day 1-5", task: "Docker fundamentals", src: "YouTube" },
          { day: "Day 6-15", task: "System Design basics", src: "Coursera" },
          { day: "Day 16-25", task: "Build portfolio project", src: "GitHub" },
          { day: "Day 26-30", task: "Mock interviews", src: "Practice" },
        ].map((d) => (
          <div key={d.day} className="flex items-center gap-3 card-surface p-3">
            <span className="text-xs font-medium text-primary min-w-[65px]">{d.day}</span>
            <span className="text-sm text-foreground flex-1">{d.task}</span>
            <span className="text-xs text-muted-foreground">{d.src}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Interview Readiness Score",
    desc: "Know exactly how ready you are before you apply — no more guessing or wasted applications.",
    icon: Target,
    visual: (
      <div className="flex items-center justify-center">
        <div className="relative w-36 h-36">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(240 16% 19%)" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="52" fill="none" stroke="hsl(217 91% 60%)" strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 52 * 0.73} ${2 * Math.PI * 52}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-heading font-bold text-foreground">73%</span>
            <span className="text-xs text-muted-foreground">Ready</span>
          </div>
        </div>
      </div>
    ),
  },
];

const Features = () => (
  <section id="features" className="py-24">
    <div className="section-container">
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-center mb-16">
        Powerful <span className="text-primary">Features</span>
      </h2>
      <div className="space-y-20">
        {features.map((f, i) => (
          <div
            key={i}
            className={`flex flex-col ${i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} items-center gap-12`}
          >
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <f.icon className="w-4 h-4" />
                Feature {i + 1}
              </div>
              <h3 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">{f.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
            <div className="flex-1 w-full card-surface p-6">{f.visual}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;
