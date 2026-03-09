import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Clock,
  DollarSign,
  Briefcase,
  TrendingUp,
  GitBranch,
  ChevronRight,
  Columns2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

/* ─── Data ─── */

interface PathNode {
  id: string;
  label: string;
  skills: string[];
  timeMonths: number;
  salaryLPA: string;
  jobsAvailable: number;
  matchPercent: number;
}

interface CareerPath {
  id: string;
  name: string;
  emoji: string;
  color: "primary" | "secondary" | "amber" | "purple";
  destination: string;
  salaryRange: string;
  totalMonths: number;
  nodes: PathNode[];
}

const colorMap: Record<string, { bg: string; border: string; text: string; badge: string; glow: string }> = {
  primary: {
    bg: "bg-primary/10",
    border: "border-primary/30",
    text: "text-primary",
    badge: "bg-primary/15 text-primary",
    glow: "shadow-primary/10",
  },
  secondary: {
    bg: "bg-secondary/10",
    border: "border-secondary/30",
    text: "text-secondary",
    badge: "bg-secondary/15 text-secondary",
    glow: "shadow-secondary/10",
  },
  amber: {
    bg: "bg-[hsl(45_100%_60%/0.1)]",
    border: "border-[hsl(45_100%_60%/0.3)]",
    text: "text-[hsl(45_100%_60%)]",
    badge: "bg-[hsl(45_100%_60%/0.15)] text-[hsl(45_100%_60%)]",
    glow: "shadow-[hsl(45_100%_60%/0.1)]",
  },
  purple: {
    bg: "bg-[hsl(280_80%_60%/0.1)]",
    border: "border-[hsl(280_80%_60%/0.3)]",
    text: "text-[hsl(280_80%_60%)]",
    badge: "bg-[hsl(280_80%_60%/0.15)] text-[hsl(280_80%_60%)]",
    glow: "shadow-[hsl(280_80%_60%/0.1)]",
  },
};

const PATHS: CareerPath[] = [
  {
    id: "frontend",
    name: "Frontend Expert",
    emoji: "🎨",
    color: "primary",
    destination: "Senior UI Engineer",
    salaryRange: "₹12–25 LPA",
    totalMonths: 8,
    nodes: [
      {
        id: "fe-1",
        label: "Advanced React",
        skills: ["React 19", "Server Components", "Suspense"],
        timeMonths: 2,
        salaryLPA: "₹8–12 LPA",
        jobsAvailable: 4200,
        matchPercent: 85,
      },
      {
        id: "fe-2",
        label: "Vue / Next.js",
        skills: ["Vue 3", "Next.js 15", "SSR/ISR"],
        timeMonths: 3,
        salaryLPA: "₹12–18 LPA",
        jobsAvailable: 3100,
        matchPercent: 55,
      },
      {
        id: "fe-3",
        label: "Design Systems & Perf",
        skills: ["Storybook", "Web Vitals", "Micro-Frontends"],
        timeMonths: 3,
        salaryLPA: "₹18–25 LPA",
        jobsAvailable: 1800,
        matchPercent: 30,
      },
    ],
  },
  {
    id: "fullstack",
    name: "Full Stack (MERN)",
    emoji: "⚡",
    color: "secondary",
    destination: "Tech Lead",
    salaryRange: "₹18–40 LPA",
    totalMonths: 12,
    nodes: [
      {
        id: "fs-1",
        label: "Backend Mastery",
        skills: ["Node.js", "Express", "REST/GraphQL"],
        timeMonths: 3,
        salaryLPA: "₹10–15 LPA",
        jobsAvailable: 5600,
        matchPercent: 70,
      },
      {
        id: "fs-2",
        label: "Database & Auth",
        skills: ["PostgreSQL", "MongoDB", "OAuth/JWT"],
        timeMonths: 3,
        salaryLPA: "₹14–22 LPA",
        jobsAvailable: 4100,
        matchPercent: 60,
      },
      {
        id: "fs-3",
        label: "Architecture & Scale",
        skills: ["System Design", "Microservices", "Caching"],
        timeMonths: 3,
        salaryLPA: "₹22–32 LPA",
        jobsAvailable: 2200,
        matchPercent: 35,
      },
      {
        id: "fs-4",
        label: "Leadership & Delivery",
        skills: ["Code Reviews", "Mentoring", "Sprint Planning"],
        timeMonths: 3,
        salaryLPA: "₹30–40 LPA",
        jobsAvailable: 1100,
        matchPercent: 20,
      },
    ],
  },
  {
    id: "devops",
    name: "DevOps / Cloud",
    emoji: "☁️",
    color: "amber",
    destination: "Cloud Architect",
    salaryRange: "₹25–55 LPA",
    totalMonths: 14,
    nodes: [
      {
        id: "do-1",
        label: "CI/CD & Docker",
        skills: ["Docker", "GitHub Actions", "Jenkins"],
        timeMonths: 2,
        salaryLPA: "₹10–16 LPA",
        jobsAvailable: 3800,
        matchPercent: 45,
      },
      {
        id: "do-2",
        label: "AWS Core",
        skills: ["EC2", "S3", "Lambda", "IAM"],
        timeMonths: 4,
        salaryLPA: "₹16–28 LPA",
        jobsAvailable: 4500,
        matchPercent: 25,
      },
      {
        id: "do-3",
        label: "Kubernetes & IaC",
        skills: ["K8s", "Terraform", "Helm"],
        timeMonths: 4,
        salaryLPA: "₹28–40 LPA",
        jobsAvailable: 2800,
        matchPercent: 15,
      },
      {
        id: "do-4",
        label: "Cloud Architecture",
        skills: ["Multi-Cloud", "Cost Optimization", "Security"],
        timeMonths: 4,
        salaryLPA: "₹40–55 LPA",
        jobsAvailable: 900,
        matchPercent: 10,
      },
    ],
  },
  {
    id: "ai",
    name: "AI / ML Engineer",
    emoji: "🧠",
    color: "purple",
    destination: "ML Lead",
    salaryRange: "₹20–50 LPA",
    totalMonths: 15,
    nodes: [
      {
        id: "ai-1",
        label: "Python & Math",
        skills: ["NumPy", "Pandas", "Linear Algebra"],
        timeMonths: 3,
        salaryLPA: "₹8–14 LPA",
        jobsAvailable: 3200,
        matchPercent: 50,
      },
      {
        id: "ai-2",
        label: "ML Foundations",
        skills: ["Scikit-learn", "Feature Engineering", "Model Eval"],
        timeMonths: 4,
        salaryLPA: "₹14–24 LPA",
        jobsAvailable: 2600,
        matchPercent: 30,
      },
      {
        id: "ai-3",
        label: "Deep Learning & LLMs",
        skills: ["PyTorch", "Transformers", "Fine-tuning"],
        timeMonths: 4,
        salaryLPA: "₹24–38 LPA",
        jobsAvailable: 1800,
        matchPercent: 15,
      },
      {
        id: "ai-4",
        label: "MLOps & Production",
        skills: ["MLflow", "Model Serving", "A/B Testing"],
        timeMonths: 4,
        salaryLPA: "₹35–50 LPA",
        jobsAvailable: 800,
        matchPercent: 10,
      },
    ],
  },
];

/* ─── Component ─── */

const CareerTree = () => {
  const [selectedPaths, setSelectedPaths] = useState<string[]>(["frontend"]);
  const [comparing, setComparing] = useState(false);

  const togglePath = (id: string) => {
    if (comparing) {
      setSelectedPaths((prev) =>
        prev.includes(id) ? prev.filter((p) => p !== id) : prev.length < 3 ? [...prev, id] : prev
      );
    } else {
      setSelectedPaths([id]);
    }
  };

  const activePaths = PATHS.filter((p) => selectedPaths.includes(p.id));

  return (
    <section className="py-16 border-b border-border">
      <div className="section-container">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground flex items-center gap-2">
              <GitBranch className="w-7 h-7 text-primary" />
              Interactive Career Tree
            </h2>
            <p className="text-muted-foreground mt-1">
              Explore career paths from your current skills — see salary, timeline, and jobs at every step
            </p>
          </div>
          <Button
            variant={comparing ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setComparing(!comparing);
              if (!comparing && selectedPaths.length < 2) {
                setSelectedPaths(["frontend", "fullstack"]);
              }
            }}
          >
            <Columns2 className="w-4 h-4 mr-1.5" />
            {comparing ? "Exit Compare" : "Compare Paths"}
          </Button>
        </div>

        {comparing && (
          <p className="text-xs text-muted-foreground mb-6">Select up to 3 paths to compare side-by-side</p>
        )}

        {/* Current Skills Node */}
        <div className="flex justify-center mb-8 mt-6">
          <div className="card-surface px-6 py-4 text-center border-2 border-primary/40 shadow-lg shadow-primary/10">
            <p className="text-xs text-muted-foreground mb-1">You Are Here</p>
            <p className="text-lg font-heading font-bold text-foreground">Current Skills</p>
            <div className="flex flex-wrap justify-center gap-1.5 mt-2">
              {["React", "JavaScript", "Python", "SQL", "Git"].map((s) => (
                <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Branching Lines Visual */}
        <div className="flex justify-center mb-6">
          <div className="w-0.5 h-8 bg-border" />
        </div>

        {/* Path Selector Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {PATHS.map((path) => {
            const c = colorMap[path.color];
            const isActive = selectedPaths.includes(path.id);
            return (
              <button
                key={path.id}
                onClick={() => togglePath(path.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all border",
                  isActive
                    ? `${c.bg} ${c.border} ${c.text} shadow-lg ${c.glow}`
                    : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/40"
                )}
              >
                <span className="text-lg">{path.emoji}</span>
                <span>{path.name}</span>
                {comparing && isActive && (
                  <span className="w-2 h-2 rounded-full bg-current" />
                )}
              </button>
            );
          })}
        </div>

        {/* Path Cards — side by side in compare mode */}
        <div
          className={cn(
            "grid gap-6",
            comparing
              ? activePaths.length === 3
                ? "grid-cols-1 lg:grid-cols-3"
                : "grid-cols-1 lg:grid-cols-2"
              : "grid-cols-1 max-w-3xl mx-auto"
          )}
        >
          {activePaths.map((path) => {
            const c = colorMap[path.color];
            return (
              <div key={path.id} className="space-y-0">
                {/* Path header */}
                <div className={cn("card-surface p-5 border-l-4", c.border)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={cn("text-lg font-heading font-bold", c.text)}>
                        {path.emoji} {path.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        → {path.destination}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={cn("text-lg font-bold", c.text)}>{path.salaryRange}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3" />
                        {path.totalMonths} months
                      </p>
                    </div>
                  </div>
                </div>

                {/* Nodes */}
                {path.nodes.map((node, i) => (
                  <div key={node.id} className="relative">
                    {/* Connector line */}
                    <div className="flex justify-center">
                      <div className={cn("w-0.5 h-4", i === 0 ? "bg-border" : "bg-border")} />
                    </div>

                    <div className="card-surface p-5 hover-lift transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center",
                              c.badge
                            )}
                          >
                            {i + 1}
                          </span>
                          <div>
                            <h4 className="text-sm font-semibold text-foreground">{node.label}</h4>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {node.timeMonths} months
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-foreground flex items-center gap-1 justify-end">
                            <DollarSign className="w-3.5 h-3.5 text-secondary" />
                            {node.salaryLPA}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                            <Briefcase className="w-3 h-3" />
                            {node.jobsAvailable.toLocaleString()} jobs
                          </p>
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {node.skills.map((s) => (
                          <span
                            key={s}
                            className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground"
                          >
                            {s}
                          </span>
                        ))}
                      </div>

                      {/* Match */}
                      <div className="flex items-center gap-2">
                        <Progress value={node.matchPercent} className="h-1.5 flex-1" />
                        <span className="text-xs font-medium text-muted-foreground">
                          {node.matchPercent}% match
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Destination */}
                <div className="flex justify-center">
                  <div className="w-0.5 h-4 bg-border" />
                </div>
                <div className={cn("card-surface p-4 text-center border-2", c.border)}>
                  <p className="text-xs text-muted-foreground mb-0.5">Destination</p>
                  <p className={cn("text-base font-heading font-bold", c.text)}>
                    {path.destination}
                  </p>
                  <p className="text-sm font-semibold text-foreground">{path.salaryRange}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Compare Summary Table */}
        {comparing && activePaths.length >= 2 && (
          <div className="mt-10 card-surface overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-muted-foreground font-medium">Metric</th>
                  {activePaths.map((p) => (
                    <th key={p.id} className={cn("text-center p-4 font-semibold", colorMap[p.color].text)}>
                      {p.emoji} {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    label: "Destination Role",
                    key: "destination" as const,
                  },
                  {
                    label: "Salary Range",
                    key: "salaryRange" as const,
                  },
                  {
                    label: "Time to Achieve",
                    key: "totalMonths" as const,
                    format: (v: number) => `${v} months`,
                  },
                  {
                    label: "Total Jobs",
                    key: "jobs" as const,
                  },
                  {
                    label: "Current Match",
                    key: "match" as const,
                  },
                ].map((row) => (
                  <tr key={row.label} className="border-b border-border last:border-0">
                    <td className="p-4 text-muted-foreground">{row.label}</td>
                    {activePaths.map((p) => {
                      let value: string;
                      if (row.key === "jobs") {
                        value = p.nodes.reduce((s, n) => s + n.jobsAvailable, 0).toLocaleString();
                      } else if (row.key === "match") {
                        value = `${p.nodes[0].matchPercent}%`;
                      } else if (row.key === "totalMonths") {
                        value = row.format ? row.format(p[row.key]) : String(p[row.key]);
                      } else {
                        value = String(p[row.key]);
                      }
                      return (
                        <td key={p.id} className="p-4 text-center font-medium text-foreground">
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default CareerTree;
