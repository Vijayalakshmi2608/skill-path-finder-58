import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAnalyze } from "@/contexts/AnalyzeContext";
import { generateRoadmap } from "@/lib/ai";
import type { GeneratedRoadmap } from "@/lib/ai";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShareExport from "@/components/roadmap/ShareExport";
import CertificateGenerator from "@/components/roadmap/CertificateGenerator";
import { Loader2, CheckCircle2, Circle, ChevronDown, ChevronRight, Calendar, Clock, BookOpen, Target, Flame, List, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ViewMode = "list" | "week";

const RoadmapPage = () => {
  const navigate = useNavigate();
  const { data, setData } = useAnalyze();
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]));
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const hasStarted = useRef(false);

  const roadmap = data.generatedRoadmap;

  // Generate roadmap if not available
  useEffect(() => {
    if (roadmap || hasStarted.current) return;
    if (!data.skillAnalysis) {
      toast.error("Please complete the skill analysis first.");
      navigate("/analyze");
      return;
    }
    hasStarted.current = true;
    setLoading(true);

    generateRoadmap({
      missingSkills: data.skillAnalysis.missing_skills,
      quickWins: data.skillAnalysis.top_3_quick_wins,
      timeCommitment: data.timeCommitment,
      learningStyles: data.learningStyles,
      budget: data.budget,
      jobTitle: data.jobTitle,
      experienceLevel: data.experienceLevel,
    })
      .then((result) => {
        setData({ generatedRoadmap: result });
      })
      .catch((err) => {
        console.error("Roadmap generation error:", err);
        setError(err.message || "Failed to generate roadmap");
        toast.error("Failed to generate roadmap. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [roadmap, data, setData, navigate]);

  const toggleDay = useCallback((day: number) => {
    setCompletedDays((prev) => {
      const next = new Set(prev);
      next.has(day) ? next.delete(day) : next.add(day);
      return next;
    });
  }, []);

  const toggleWeek = (w: number) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      next.has(w) ? next.delete(w) : next.add(w);
      return next;
    });
  };

  // Streak calc
  let streak = 0;
  const totalDays = roadmap?.weeks.reduce((sum, w) => sum + w.days.length, 0) ?? 30;
  for (let i = 1; i <= totalDays; i++) {
    if (completedDays.has(i)) streak++;
    else break;
  }

  const jobTitle = data.jobTitle || "Software Engineer";
  const experienceLevel = data.experienceLevel || "Entry Level";

  const taskBg: Record<string, string> = {
    video: "bg-primary/10 text-primary",
    read: "bg-secondary/10 text-secondary",
    practice: "bg-amber-400/10 text-amber-400",
    project: "bg-purple-500/10 text-purple-400",
    checkpoint: "bg-secondary/10 text-secondary",
    quiz: "bg-primary/10 text-primary",
    rest: "bg-muted text-muted-foreground",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <div className="text-center">
            <p className="text-xl font-heading font-bold text-foreground mb-2">Generating Your Roadmap...</p>
            <p className="text-muted-foreground">AI is building a personalized 30-day plan based on your skill gaps</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
          <p className="text-destructive text-lg">{error}</p>
          <Button onClick={() => { hasStarted.current = false; setError(null); }}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
          <p className="text-muted-foreground text-lg">No roadmap data. Please complete the analysis first.</p>
          <Button onClick={() => navigate("/analyze")}>Go to Analysis</Button>
        </div>
      </div>
    );
  }

  const allSkills = roadmap.weeks.flatMap(w => w.skills);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        {/* Header */}
        <section className="py-12 border-b border-border">
          <div className="section-container">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-3">
              Your {totalDays}-Day Job-Ready Roadmap 🗺️
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Personalized for:{" "}
              <span className="text-primary font-semibold">
                {jobTitle} — {experienceLevel}
              </span>
            </p>

            <div className="flex flex-wrap gap-4 md:gap-6 mb-8">
              {[
                { label: `${totalDays} Days`, emoji: "📅" },
                { label: "1 hour/day", emoji: "⏱️" },
                { label: `${allSkills.length} skills to learn`, emoji: "📚" },
                { label: "Target score: 85+", emoji: "🎯" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-2 card-surface px-4 py-2.5">
                  <span className="text-lg">{stat.emoji}</span>
                  <span className="text-sm font-medium text-foreground">{stat.label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 h-12 text-base font-semibold">
                <Flame className="w-5 h-5 mr-2" />
                Start Today
              </Button>
              <div className="card-surface px-5 py-3">
                <p className="text-sm text-muted-foreground">
                  Day <span className="text-primary font-bold text-lg">{completedDays.size}</span> of {totalDays} —{" "}
                  {completedDays.size === 0 ? "Let's begin!" : `${Math.round((completedDays.size / totalDays) * 100)}% complete`}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Week Overview */}
        <section className="py-12 border-b border-border">
          <div className="section-container">
            <h2 className="text-2xl font-heading font-bold text-foreground mb-8">Roadmap Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {roadmap.weeks.map((week) => (
                <div key={week.week_number} className="card-surface p-5 hover-lift group relative overflow-hidden">
                  <div className="absolute top-0 left-0 h-1 w-full bg-primary/20 group-hover:bg-primary transition-colors" />
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{week.icon}</span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Week {week.week_number}</span>
                  </div>
                  <h3 className="text-lg font-heading font-semibold text-foreground mb-1">{week.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{week.subtitle}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {week.skills.map((skill) => (
                      <span key={skill} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{skill}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Day-by-Day */}
        <section className="py-12 border-b border-border">
          <div className="section-container">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <h2 className="text-2xl font-heading font-bold text-foreground">Day-by-Day Roadmap</h2>
              <div className="flex items-center gap-1 card-surface p-1">
                {([
                  { mode: "list" as ViewMode, icon: List, label: "List" },
                  { mode: "week" as ViewMode, icon: LayoutGrid, label: "Week" },
                ]).map(({ mode, icon: Icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                      viewMode === mode ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {viewMode === "list" && (
              <div className="space-y-4">
                {roadmap.weeks.map((week) => (
                  <div key={week.week_number} className="card-surface overflow-hidden">
                    <button
                      onClick={() => toggleWeek(week.week_number)}
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{week.icon}</span>
                        <div>
                          <h3 className="text-lg font-heading font-semibold text-foreground">
                            Week {week.week_number} — {week.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">{week.subtitle}</p>
                        </div>
                      </div>
                      {expandedWeeks.has(week.week_number) ? (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>

                    {expandedWeeks.has(week.week_number) && (
                      <div className="border-t border-border">
                        {week.days.map((day) => (
                          <div
                            key={day.day}
                            className={cn(
                              "p-5 border-b border-border last:border-b-0 transition-colors",
                              completedDays.has(day.day) && "bg-secondary/5"
                            )}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <button onClick={() => toggleDay(day.day)} className="mt-0.5">
                                  {completedDays.has(day.day) ? (
                                    <CheckCircle2 className="w-5 h-5 text-secondary" />
                                  ) : (
                                    <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                                  )}
                                </button>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className={cn("font-semibold text-foreground", completedDays.has(day.day) && "line-through opacity-60")}>
                                      Day {day.day} — {day.title}
                                    </h4>
                                    {day.is_rest && (
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Rest Day</span>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground">{day.duration_minutes} min</p>
                                </div>
                              </div>
                            </div>

                            <div className="ml-8 space-y-2">
                              {day.tasks.map((task, i) => (
                                <div key={i} className="flex items-start gap-2.5">
                                  <span className={cn("text-xs px-2 py-0.5 rounded-md font-medium shrink-0 mt-0.5", taskBg[task.type] || "bg-muted text-muted-foreground")}>
                                    {task.icon}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-foreground leading-snug">{task.title}</p>
                                    {(task.duration_minutes || task.platform) && (
                                      <p className="text-xs text-muted-foreground mt-0.5">
                                        {[task.duration_minutes ? `${task.duration_minutes} min` : null, task.platform && `${task.platform}${task.is_free ? " · Free" : ""}`]
                                          .filter(Boolean)
                                          .join(" · ")}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {day.checkpoint && (
                              <div className="ml-8 mt-3 flex items-center gap-2 text-xs text-secondary">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{day.checkpoint}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {viewMode === "week" && (
              <div className="space-y-8">
                {roadmap.weeks.map((week) => (
                  <div key={week.week_number}>
                    <h3 className="text-lg font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
                      <span>{week.icon}</span> Week {week.week_number} — {week.title}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                      {week.days.map((day) => (
                        <button
                          key={day.day}
                          onClick={() => toggleDay(day.day)}
                          className={cn(
                            "card-surface p-3 text-left hover-lift cursor-pointer relative",
                            completedDays.has(day.day) && "border-secondary/50"
                          )}
                        >
                          {completedDays.has(day.day) && (
                            <CheckCircle2 className="w-4 h-4 text-secondary absolute top-2 right-2" />
                          )}
                          <p className="text-xs text-muted-foreground mb-1">Day {day.day}</p>
                          <p className="text-sm font-semibold text-foreground leading-tight mb-1">{day.title}</p>
                          <p className="text-xs text-muted-foreground">{day.duration_minutes} min</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Progress + Certificate + Share */}
        <section className="py-12 border-b border-border bg-surface-secondary">
          <div className="section-container">
            <h2 className="text-2xl font-heading font-bold text-foreground mb-6">Your Progress</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="card-surface p-6 text-center">
                <p className="text-4xl font-heading font-extrabold text-primary">{completedDays.size}</p>
                <p className="text-sm text-muted-foreground">Days Completed</p>
              </div>
              <div className="card-surface p-6 text-center">
                <p className="text-4xl font-heading font-extrabold text-secondary">{streak}</p>
                <p className="text-sm text-muted-foreground">Day Streak 🔥</p>
              </div>
              <div className="card-surface p-6 text-center">
                <p className="text-4xl font-heading font-extrabold text-foreground">{Math.round((completedDays.size / totalDays) * 100)}%</p>
                <p className="text-sm text-muted-foreground">Complete</p>
              </div>
            </div>
          </div>
        </section>

        <CertificateGenerator completedDays={completedDays.size} />
        <ShareExport />
      </main>
      <Footer />
    </div>
  );
};

export default RoadmapPage;