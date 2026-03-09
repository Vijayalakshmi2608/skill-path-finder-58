import { Zap, Download, Share2, ArrowRight, MessageSquare } from "lucide-react";
import ReadinessGauge from "@/components/results/ReadinessGauge";
import SkillBreakdown from "@/components/results/SkillBreakdown";
import SkillRadar from "@/components/results/SkillRadar";
import CompetitiveAnalysis from "@/components/results/CompetitiveAnalysis";
import QuickWins from "@/components/results/QuickWins";
import InterviewPredictor from "@/components/results/InterviewPredictor";
import CompanyReadiness from "@/components/results/CompanyReadiness";
import { useNavigate } from "react-router-dom";

const floatingWords = [
  "Python", "React", "Docker", "ML", "AWS", "SQL", "Kubernetes", "GraphQL",
  "TypeScript", "Node.js", "CI/CD", "Redis", "Go", "System Design", "TensorFlow",
];

const ResultsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="border-b border-border bg-surface-secondary">
        <div className="section-container flex items-center justify-between h-14">
          <a href="/" className="flex items-center gap-2 text-lg font-heading font-bold">
            <Zap className="w-5 h-5 text-primary" />
            <span className="text-foreground">Skill</span>
            <span className="text-primary">Scan</span>
          </a>
          <div className="flex gap-3">
            <button onClick={() => navigate("/chat")} className="flex items-center gap-1.5 text-sm text-primary hover:brightness-110 transition-colors">
              <MessageSquare className="w-4 h-4" /> AI Chat
            </button>
            <button onClick={() => navigate("/")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Home
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1 — Report Header */}
      <section className="relative py-12 overflow-hidden border-b border-border">
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          {floatingWords.map((w, i) => (
            <span
              key={i}
              className="absolute text-foreground/[0.03] font-heading font-bold text-2xl animate-float"
              style={{
                left: `${(i * 17) % 90}%`,
                top: `${(i * 23) % 80}%`,
                animationDelay: `${i * 0.7}s`,
                animationDuration: `${6 + (i % 4)}s`,
              }}
            >
              {w}
            </span>
          ))}
        </div>

        <div className="section-container relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Your SkillScan Report</p>
              <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-foreground mb-2">
                Rahul Sharma
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1.5 text-sm rounded-full bg-primary/15 text-primary border border-primary/30 font-medium">
                  Software Engineer @ Google — Entry Level
                </span>
                <span className="text-xs text-muted-foreground">Generated {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 text-sm border border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-muted-foreground/50 transition-all">
                <Download className="w-4 h-4" /> Download PDF
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 text-sm border border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-muted-foreground/50 transition-all">
                <Share2 className="w-4 h-4" /> Share Report
              </button>
              <button
                onClick={() => navigate("/roadmap")}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-lg glow-box-blue hover:brightness-110 transition-all group"
              >
                Start Roadmap
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — Readiness Score */}
      <section className="py-16 border-b border-border">
        <div className="section-container">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-8">
            Overall Readiness Score
          </h2>
          <ReadinessGauge score={64} />
        </div>
      </section>

      {/* SECTION 2.5 — Company Readiness */}
      <CompanyReadiness />

      {/* SECTION 3 — Skill Breakdown */}
      <section className="py-16 border-b border-border bg-surface-secondary">
        <div className="section-container">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-2">
            Your Complete Skill Analysis
          </h2>
          <p className="text-muted-foreground mb-8">Every skill ranked and compared against real job requirements</p>
          <SkillBreakdown />
        </div>
      </section>

      {/* SECTION 4 — Radar Chart */}
      <section className="py-16 border-b border-border">
        <div className="section-container max-w-3xl">
          <SkillRadar />
        </div>
      </section>

      {/* SECTION 5 — Competitive Analysis */}
      <section className="py-16 border-b border-border bg-surface-secondary">
        <div className="section-container">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-2">
            How You Compare to Other Applicants
          </h2>
          <p className="text-muted-foreground mb-8">Based on analysis of applicant pools for similar roles</p>
          <CompetitiveAnalysis />
        </div>
      </section>

      {/* SECTION 6 — Quick Wins */}
      <section className="py-16 border-b border-border">
        <div className="section-container">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-2">
            ⚡ 3 Skills That Will Boost Your Score the Most
          </h2>
          <p className="text-muted-foreground mb-8">High impact, low effort — the fastest way to close your gap</p>
          <QuickWins />
        </div>
      </section>

      {/* SECTION 6.5 — Interview Predictor */}
      <section className="py-16 border-b border-border bg-surface-secondary">
        <div className="section-container max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-2">
            🎯 AI Interview Predictor
          </h2>
          <p className="text-muted-foreground mb-8">Get AI-powered predictions for your target company interviews</p>
          <InterviewPredictor />
        </div>
      </section>

      {/* SECTION 7 — CTA Banner */}
      <section className="py-16">
        <div className="section-container">
          <div className="card-surface p-8 sm:p-12 text-center glow-box-blue">
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-foreground mb-3">
              Ready to close these gaps?
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Your personalized 30-day roadmap is waiting →
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate("/roadmap")}
                className="px-10 py-4 text-base font-semibold bg-primary text-primary-foreground rounded-lg glow-box-blue hover:brightness-110 transition-all duration-300 inline-flex items-center gap-2 group"
              >
                View My Roadmap
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => navigate("/chat")}
                className="px-10 py-4 text-base font-semibold border border-border text-foreground rounded-lg hover:border-primary/50 transition-all duration-300 inline-flex items-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                Ask AI Career Advisor
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ResultsPage;
