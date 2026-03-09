import { useState } from "react";
import { Building2, CheckCircle2, AlertTriangle, ArrowRight, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const COMPANIES = [
  {
    id: "google",
    name: "Google",
    logo: "🟢",
    score: 67,
    gap: "System Design",
    strengths: ["DSA", "Coding", "Problem Solving"],
    weaknesses: ["System Design", "Distributed Systems", "Scale Thinking"],
    top3: [
      {
        q: "Design a URL shortener like bit.ly — how would you handle 1B+ URLs?",
        topic: "System Design",
        difficulty: "Hard",
      },
      {
        q: "Given a stream of events, design a real-time anomaly detection system.",
        topic: "System Design",
        difficulty: "Hard",
      },
      {
        q: "Implement an LRU Cache with O(1) get and put operations.",
        topic: "Data Structures",
        difficulty: "Medium",
      },
    ],
  },
  {
    id: "microsoft",
    name: "Microsoft",
    logo: "🟦",
    score: 74,
    gap: "Cloud & Azure",
    strengths: ["OOP", "Coding", "Communication"],
    weaknesses: ["Azure Services", "Cloud Architecture", "CI/CD Pipelines"],
    top3: [
      {
        q: "How would you design the backend for Microsoft Teams' real-time messaging?",
        topic: "System Design",
        difficulty: "Hard",
      },
      {
        q: "Explain the SOLID principles with real-world examples from your projects.",
        topic: "OOP & Design",
        difficulty: "Medium",
      },
      {
        q: "Design a file synchronization system like OneDrive for offline-first usage.",
        topic: "Distributed Systems",
        difficulty: "Hard",
      },
    ],
  },
  {
    id: "amazon",
    name: "Amazon",
    logo: "🟠",
    score: 82,
    gap: "Leadership Principles",
    strengths: ["Data Structures", "Algorithms", "Problem Solving"],
    weaknesses: ["LP Stories", "Behavioral Depth", "Ownership Examples"],
    top3: [
      {
        q: "Tell me about a time you disagreed with your manager and how you handled it. (Have Backbone; Disagree and Commit)",
        topic: "Leadership Principles",
        difficulty: "Behavioral",
      },
      {
        q: "Describe a project where you took ownership beyond your role. What was the outcome? (Ownership)",
        topic: "Leadership Principles",
        difficulty: "Behavioral",
      },
      {
        q: "Design an order processing system that handles 100K orders/sec during Prime Day.",
        topic: "System Design",
        difficulty: "Hard",
      },
    ],
  },
  {
    id: "startup",
    name: "Startup",
    logo: "🚀",
    score: 91,
    gap: "None critical",
    strengths: ["Full Stack", "Speed", "Versatility", "React", "Node.js"],
    weaknesses: ["DevOps depth", "Investor metrics"],
    top3: [
      {
        q: "Build a full-stack feature from scratch in 2 hours: real-time notification system with WebSockets.",
        topic: "Full Stack",
        difficulty: "Live Coding",
      },
      {
        q: "Our API is slow — walk me through how you'd debug and optimize it in production.",
        topic: "Performance",
        difficulty: "Medium",
      },
      {
        q: "We need to ship an MVP in 2 weeks. How do you decide what to build and what to skip?",
        topic: "Product Thinking",
        difficulty: "Behavioral",
      },
    ],
  },
];

const difficultyColors: Record<string, string> = {
  Hard: "bg-destructive/15 text-destructive",
  Medium: "bg-[hsl(45_100%_60%/0.15)] text-[hsl(45_100%_60%)]",
  Behavioral: "bg-primary/15 text-primary",
  "Live Coding": "bg-secondary/15 text-secondary",
};

const CompanyReadiness = () => {
  const [selected, setSelected] = useState("google");
  const company = COMPANIES.find((c) => c.id === selected)!;

  const scoreColor =
    company.score >= 85
      ? "text-secondary"
      : company.score >= 70
        ? "text-primary"
        : "text-destructive";

  return (
    <section className="py-16 border-b border-border">
      <div className="section-container">
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-2">
          🏢 Check Your Readiness For
        </h2>
        <p className="text-muted-foreground mb-8">
          See how prepared you are for specific companies and their interview styles
        </p>

        {/* Company Toggle */}
        <div className="flex flex-wrap gap-2 mb-10">
          {COMPANIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all border",
                selected === c.id
                  ? "bg-primary/15 border-primary/40 text-primary shadow-lg shadow-primary/10"
                  : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/40"
              )}
            >
              <span className="text-lg">{c.logo}</span>
              {c.name}
              <span
                className={cn(
                  "ml-1 text-xs font-bold",
                  c.score >= 85
                    ? "text-secondary"
                    : c.score >= 70
                      ? "text-primary"
                      : "text-destructive"
                )}
              >
                {c.score}%
              </span>
            </button>
          ))}
        </div>

        {/* Company Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Score + Gaps */}
          <div className="space-y-5">
            {/* Score Card */}
            <div className="card-surface p-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">
                {company.name} Readiness
              </p>
              <p className={cn("text-6xl font-heading font-extrabold mb-2", scoreColor)}>
                {company.score}%
              </p>
              <Progress value={company.score} className="h-2.5 mb-3" />
              <p className="text-sm text-muted-foreground">
                {company.score >= 85
                  ? "You're interview-ready! 🎉"
                  : `Key gap: ${company.gap}`}
              </p>
            </div>

            {/* Strengths */}
            <div className="card-surface p-5">
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-secondary" />
                Your Strengths
              </h4>
              <div className="flex flex-wrap gap-2">
                {company.strengths.map((s) => (
                  <span
                    key={s}
                    className="text-xs px-2.5 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Weaknesses */}
            <div className="card-surface p-5">
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                Areas to Improve
              </h4>
              <div className="flex flex-wrap gap-2">
                {company.weaknesses.map((w) => (
                  <span
                    key={w}
                    className="text-xs px-2.5 py-1 rounded-full bg-destructive/10 text-destructive border border-destructive/20"
                  >
                    {w}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Top 3 Questions */}
          <div className="lg:col-span-2">
            <div className="card-surface p-6">
              <h3 className="text-lg font-heading font-bold text-foreground mb-1 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Top 3 Things to Crack {company.name} Interviews
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Based on recent interview patterns from {company.name}
              </p>

              <div className="space-y-4">
                {company.top3.map((item, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-xl bg-background border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-7 h-7 rounded-lg bg-primary/15 text-primary text-sm font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">
                        {item.topic}
                      </span>
                      <span
                        className={cn(
                          "text-xs font-semibold px-2 py-0.5 rounded-full ml-auto",
                          difficultyColors[item.difficulty] || "bg-muted text-muted-foreground"
                        )}
                      >
                        {item.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                      "{item.q}"
                    </p>
                  </div>
                ))}
              </div>

              <button
                className="mt-6 flex items-center gap-2 text-sm text-primary hover:underline font-medium group"
                onClick={() => {}}
              >
                Practice {company.name} questions in Mock Interview
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompanyReadiness;
