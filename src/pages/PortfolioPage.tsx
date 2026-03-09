import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { QRCodeSVG } from "qrcode.react";
import {
  Github,
  Globe,
  ExternalLink,
  Download,
  Share2,
  Copy,
  CheckCircle2,
  Star,
  TrendingUp,
  Award,
  Briefcase,
  Code2,
  Zap,
  Clock,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/* ─── Mock Data ─── */
const PROFILE = {
  name: "Priya Sharma",
  username: "priyasharma",
  tagline: "Full-Stack Developer · ML Enthusiast",
  avatar: "PS",
  readinessScore: 78,
  subdomain: "priyasharma.skillscan.dev",
  githubUrl: "https://github.com/priyasharma-portfolio",
  completedDays: 18,
  totalDays: 30,
  streakDays: 12,
  joinedDate: "Feb 2026",
};

const SKILLS_IN_PROGRESS = [
  { name: "React.js", level: 85, status: "advanced" as const },
  { name: "Node.js", level: 70, status: "intermediate" as const },
  { name: "Docker", level: 45, status: "learning" as const },
  { name: "System Design", level: 55, status: "learning" as const },
  { name: "TypeScript", level: 80, status: "advanced" as const },
  { name: "PostgreSQL", level: 60, status: "intermediate" as const },
];

const PROJECTS = [
  {
    title: "E-Commerce REST API",
    description: "Full CRUD API with auth, pagination, and rate limiting using Express & MongoDB.",
    tech: ["Node.js", "Express", "MongoDB", "JWT"],
    status: "completed" as const,
    stars: 12,
    liveUrl: "#",
    githubUrl: "#",
    day: "Day 8",
  },
  {
    title: "Real-Time Chat App",
    description: "WebSocket-based chat with rooms, typing indicators, and message history.",
    tech: ["React", "Socket.io", "Redis", "Tailwind"],
    status: "completed" as const,
    stars: 8,
    liveUrl: "#",
    githubUrl: "#",
    day: "Day 14",
  },
  {
    title: "ML Price Predictor",
    description: "Housing price prediction using regression models with interactive visualization.",
    tech: ["Python", "Scikit-learn", "Pandas", "Streamlit"],
    status: "in-progress" as const,
    stars: 5,
    liveUrl: null,
    githubUrl: "#",
    day: "Day 18",
  },
  {
    title: "CI/CD Pipeline Setup",
    description: "Docker + GitHub Actions pipeline for automated testing and deployment.",
    tech: ["Docker", "GitHub Actions", "Nginx"],
    status: "upcoming" as const,
    stars: 0,
    liveUrl: null,
    githubUrl: null,
    day: "Day 22",
  },
];

const ACHIEVEMENTS = [
  { icon: "🔥", title: "12-Day Streak", desc: "Consecutive days of learning" },
  { icon: "🚀", title: "3 Projects Shipped", desc: "Deployed to production" },
  { icon: "💡", title: "Quick Learner", desc: "Completed Week 1 in 5 days" },
  { icon: "🤝", title: "Study Group Leader", desc: "Led Docker study group" },
];

const statusColors: Record<string, string> = {
  advanced: "bg-secondary/20 text-secondary border-secondary/30",
  intermediate: "bg-primary/20 text-primary border-primary/30",
  learning: "bg-[hsl(45_100%_60%/0.2)] text-[hsl(45_100%_60%)] border-[hsl(45_100%_60%/0.3)]",
};

const projectStatusStyles: Record<string, { bg: string; label: string }> = {
  completed: { bg: "bg-secondary/20 text-secondary", label: "Completed" },
  "in-progress": { bg: "bg-primary/20 text-primary", label: "In Progress" },
  upcoming: { bg: "bg-muted text-muted-foreground", label: "Upcoming" },
};

/* ─── Component ─── */
const PortfolioPage = () => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"projects" | "skills" | "achievements">("projects");

  const portfolioUrl = `https://${PROFILE.subdomain}`;

  const copyLink = () => {
    navigator.clipboard.writeText(portfolioUrl);
    setCopied(true);
    toast.success("Portfolio link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const readinessColor =
    PROFILE.readinessScore >= 80
      ? "text-secondary"
      : PROFILE.readinessScore >= 50
        ? "text-primary"
        : "text-destructive";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        {/* ── Hero / Profile Header ── */}
        <section className="py-12 border-b border-border">
          <div className="section-container">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Left: Profile */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-2xl font-bold text-primary">
                    {PROFILE.avatar}
                  </div>
                  <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground">
                      {PROFILE.name}
                    </h1>
                    <p className="text-muted-foreground">{PROFILE.tagline}</p>
                  </div>
                </div>

                {/* Subdomain + GitHub */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <a
                    href={portfolioUrl}
                    className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <Globe className="w-4 h-4" />
                    {PROFILE.subdomain}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={PROFILE.githubUrl}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    GitHub Portfolio
                  </a>
                </div>

                {/* Stats Row */}
                <div className="flex flex-wrap gap-4 mb-6">
                  {[
                    {
                      icon: CheckCircle2,
                      label: "Days Completed",
                      value: `${PROFILE.completedDays}/${PROFILE.totalDays}`,
                    },
                    { icon: Zap, label: "Day Streak", value: PROFILE.streakDays },
                    { icon: Code2, label: "Projects", value: PROJECTS.filter((p) => p.status === "completed").length },
                    { icon: Clock, label: "Joined", value: PROFILE.joinedDate },
                  ].map((stat) => (
                    <div key={stat.label} className="card-surface px-4 py-3 flex items-center gap-2.5">
                      <stat.icon className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-lg font-bold text-foreground">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button onClick={copyLink} variant="outline" size="sm">
                    {copied ? <CheckCircle2 className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
                    {copied ? "Copied!" : "Copy Link"}
                  </Button>
                  <Button onClick={() => toast.success("Portfolio shared!")} variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-1.5" />
                    Share
                  </Button>
                  <Button onClick={() => toast.success("Downloading PDF...")} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1.5" />
                    Download PDF
                  </Button>
                </div>
              </div>

              {/* Right: QR + Readiness + Hire Me */}
              <div className="flex flex-col items-center gap-6 lg:w-72">
                {/* QR Code */}
                <div className="card-surface p-6 flex flex-col items-center gap-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Scan to View Portfolio
                  </p>
                  <div className="bg-white rounded-xl p-3">
                    <QRCodeSVG
                      value={portfolioUrl}
                      size={140}
                      bgColor="#ffffff"
                      fgColor="#0a0a1a"
                      level="M"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{PROFILE.subdomain}</p>
                </div>

                {/* Readiness Score + Hire Me */}
                <div className="card-surface p-6 w-full text-center">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Job Readiness
                  </p>
                  <p className={cn("text-5xl font-heading font-extrabold mb-1", readinessColor)}>
                    {PROFILE.readinessScore}%
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    {PROFILE.readinessScore >= 80
                      ? "Ready to apply!"
                      : `${100 - PROFILE.readinessScore}% more to go`}
                  </p>
                  <Button
                    className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold"
                    onClick={() => toast.success("Hire request sent! Recruiters will be notified.")}
                  >
                    <Briefcase className="w-4 h-4 mr-2" />
                    Hire Me
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Skills In Progress Badge ── */}
        <section className="py-10 border-b border-border">
          <div className="section-container">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                Skills in Progress
              </h2>
              <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                <Eye className="w-3 h-3 mr-1" />
                Auto-updating badge
              </Badge>
            </div>

            {/* Embeddable Badge Preview */}
            <div className="card-surface p-5 mb-6">
              <p className="text-xs text-muted-foreground mb-3">
                📌 Embed this badge on your GitHub README or LinkedIn:
              </p>
              <div className="inline-flex items-center gap-2 bg-background rounded-full px-4 py-2 border border-border">
                <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span className="text-sm font-medium text-foreground">
                  Currently learning:{" "}
                  {SKILLS_IN_PROGRESS.filter((s) => s.status === "learning")
                    .map((s) => s.name)
                    .join(", ")}
                </span>
                <span className="text-xs text-muted-foreground">via SkillScan</span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `![Skills Badge](https://${PROFILE.subdomain}/badge.svg)`
                  );
                  toast.success("Badge markdown copied!");
                }}
                className="block mt-3 text-xs text-primary hover:underline cursor-pointer"
              >
                Copy embed code →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SKILLS_IN_PROGRESS.map((skill) => (
                <div key={skill.name} className="card-surface p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-foreground">{skill.name}</h3>
                    <span
                      className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full border",
                        statusColors[skill.status]
                      )}
                    >
                      {skill.status}
                    </span>
                  </div>
                  <Progress value={skill.level} className="h-2 mb-1" />
                  <p className="text-xs text-muted-foreground text-right">{skill.level}%</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Tabs: Projects / Skills / Achievements ── */}
        <section className="py-10">
          <div className="section-container">
            <div className="flex items-center gap-1 card-surface p-1 w-fit mb-8">
              {(
                [
                  { key: "projects" as const, label: "Projects", icon: Code2 },
                  { key: "skills" as const, label: "Skill Map", icon: TrendingUp },
                  { key: "achievements" as const, label: "Achievements", icon: Award },
                ] as const
              ).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    activeTab === key
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Projects Tab */}
            {activeTab === "projects" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">
                    {PROJECTS.filter((p) => p.status === "completed").length} completed ·{" "}
                    {PROJECTS.filter((p) => p.status === "in-progress").length} in progress ·{" "}
                    {PROJECTS.filter((p) => p.status === "upcoming").length} upcoming
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.success("GitHub repo synced!")}
                  >
                    <Github className="w-4 h-4 mr-1.5" />
                    Sync to GitHub
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PROJECTS.map((project) => (
                    <div
                      key={project.title}
                      className={cn(
                        "card-surface p-5 hover-lift transition-all",
                        project.status === "upcoming" && "opacity-60"
                      )}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-semibold text-foreground">
                              {project.title}
                            </h3>
                            <span
                              className={cn(
                                "text-xs px-2 py-0.5 rounded-full font-medium",
                                projectStatusStyles[project.status].bg
                              )}
                            >
                              {projectStatusStyles[project.status].label}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{project.day}</p>
                        </div>
                        {project.stars > 0 && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="w-3.5 h-3.5 fill-[hsl(45_100%_60%)] text-[hsl(45_100%_60%)]" />
                            {project.stars}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {project.tech.map((t) => (
                          <span
                            key={t}
                            className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        {project.githubUrl && (
                          <Button variant="outline" size="sm" className="text-xs">
                            <Github className="w-3.5 h-3.5 mr-1" />
                            Code
                          </Button>
                        )}
                        {project.liveUrl && (
                          <Button variant="outline" size="sm" className="text-xs">
                            <ExternalLink className="w-3.5 h-3.5 mr-1" />
                            Live Demo
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skill Map Tab */}
            {activeTab === "skills" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SKILLS_IN_PROGRESS.map((skill) => (
                  <div key={skill.name} className="card-surface p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-foreground">{skill.name}</h3>
                      <span className="text-2xl font-heading font-bold text-foreground">
                        {skill.level}%
                      </span>
                    </div>
                    <Progress value={skill.level} className="h-3 mb-2" />
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full border",
                          statusColors[skill.status]
                        )}
                      >
                        {skill.status}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {skill.level >= 80
                          ? "Portfolio-ready"
                          : skill.level >= 50
                            ? "Growing"
                            : "Just started"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === "achievements" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {ACHIEVEMENTS.map((ach) => (
                  <div key={ach.title} className="card-surface p-5 text-center hover-lift">
                    <span className="text-4xl mb-3 block">{ach.icon}</span>
                    <h3 className="text-sm font-semibold text-foreground mb-1">{ach.title}</h3>
                    <p className="text-xs text-muted-foreground">{ach.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PortfolioPage;
