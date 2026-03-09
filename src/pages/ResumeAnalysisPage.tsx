import { useState } from "react";
import { Zap, FileText, Loader2, CheckCircle2, XCircle, AlertTriangle, Copy, ArrowRight, Sparkles, Shield, Target, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface ATSIssue {
  type: "error" | "warning" | "success";
  message: string;
  category: string;
}

interface WeakBullet {
  original: string;
  improved: string;
  reason: string;
}

interface ATSResult {
  ats_score: number;
  summary: string;
  issues: ATSIssue[];
  missing_keywords: string[];
  strong_points: string[];
  weak_bullets: WeakBullet[];
}

const SAMPLE_RESUME = `RAHUL SHARMA
Software Developer | rahul@email.com | +91 9876543210

EXPERIENCE
Junior Developer at TechCorp (2023-Present)
- Worked on building web applications using React
- Helped the team with bug fixes and testing
- Participated in daily standups and sprint planning

Intern at StartupXYZ (2022-2023)
- Made some frontend pages
- Used JavaScript and HTML/CSS
- Did some backend work with Node.js

EDUCATION
B.Tech Computer Science, XYZ University (2022)

SKILLS
JavaScript, React, HTML, CSS, Node.js, Git`;

const ResumeAnalysisPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [resumeText, setResumeText] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);
  const [expandedBullets, setExpandedBullets] = useState<Set<number>>(new Set());
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const analyze = async () => {
    if (!resumeText.trim()) {
      toast({ title: "Paste your resume first", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("ats-score", {
        body: { resumeText: resumeText.trim(), jobTitle: jobTitle.trim() || undefined },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      setResult(data as ATSResult);
    } catch (e: any) {
      toast({ title: "Analysis failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyImproved = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const toggleBullet = (idx: number) => {
    setExpandedBullets(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const scoreColor = (score: number) =>
    score >= 80 ? "text-secondary" : score >= 60 ? "text-amber-400" : "text-destructive";

  const scoreLabel = (score: number) =>
    score >= 80 ? "Strong" : score >= 60 ? "Needs Work" : "Weak";

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
          <button onClick={() => navigate("/")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Home
          </button>
        </div>
      </div>

      {/* Hero */}
      <section className="py-12 border-b border-border">
        <div className="section-container max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Shield className="w-4 h-4" /> ATS Resume Scanner
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-foreground mb-3">
            Will Your Resume Pass the <span className="text-primary">ATS Filter</span>?
          </h1>
          <p className="text-muted-foreground text-lg">
            75% of resumes are rejected by Applicant Tracking Systems before a human ever sees them. Check yours now.
          </p>
        </div>
      </section>

      {/* Input Section */}
      <section className="py-10 border-b border-border">
        <div className="section-container max-w-3xl">
          <div className="card-surface p-6 sm:p-8 space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Target Job Title (optional)</label>
              <Input
                placeholder="e.g. Software Engineer, Data Analyst, Product Manager"
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                className="bg-muted/50"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">Paste Your Resume</label>
                <button
                  onClick={() => setResumeText(SAMPLE_RESUME)}
                  className="text-xs text-primary hover:underline"
                >
                  Use sample resume
                </button>
              </div>
              <Textarea
                placeholder="Paste your full resume text here..."
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
                rows={10}
                className="bg-muted/50 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">{resumeText.length.toLocaleString()} characters</p>
            </div>
            <Button
              onClick={analyze}
              disabled={loading || !resumeText.trim()}
              className="w-full h-12 text-base font-semibold glow-box-blue"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Scanning Resume...
                </>
              ) : (
                <>
                  <Target className="w-5 h-5" /> Analyze for ATS Compatibility
                </>
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* Results */}
      {result && (
        <>
          {/* Score */}
          <section className="py-12 border-b border-border">
            <div className="section-container max-w-3xl">
              <div className="card-surface p-8 text-center">
                <p className="text-sm text-muted-foreground mb-3">Your ATS Compatibility Score</p>
                <div className={`text-6xl sm:text-7xl font-heading font-extrabold mb-2 ${scoreColor(result.ats_score)}`}>
                  {result.ats_score}%
                </div>
                <p className={`text-lg font-semibold mb-4 ${scoreColor(result.ats_score)}`}>
                  {scoreLabel(result.ats_score)}
                </p>
                <div className="max-w-md mx-auto mb-4">
                  <Progress value={result.ats_score} className="h-3" />
                </div>
                <p className="text-muted-foreground">
                  Your resume will pass <span className="text-foreground font-semibold">{result.ats_score}%</span> of ATS filters
                </p>
                <p className="text-sm text-muted-foreground mt-2">{result.summary}</p>
              </div>
            </div>
          </section>

          {/* Issues List */}
          <section className="py-12 border-b border-border bg-surface-secondary">
            <div className="section-container max-w-3xl">
              <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
                Detailed Findings
              </h2>
              <div className="space-y-3">
                {result.issues.map((issue, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-4 rounded-lg border ${
                      issue.type === "error"
                        ? "border-destructive/30 bg-destructive/5"
                        : issue.type === "warning"
                        ? "border-amber-500/30 bg-amber-500/5"
                        : "border-secondary/30 bg-secondary/5"
                    }`}
                  >
                    {issue.type === "error" ? (
                      <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    ) : issue.type === "warning" ? (
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm text-foreground">{issue.message}</p>
                      <span className="text-xs text-muted-foreground capitalize">{issue.category.replace("_", " ")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Missing Keywords */}
          {result.missing_keywords.length > 0 && (
            <section className="py-12 border-b border-border">
              <div className="section-container max-w-3xl">
                <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
                  🔑 Missing Keywords
                </h2>
                <p className="text-muted-foreground mb-6">Add these to your resume to improve ATS match rate</p>
                <div className="flex flex-wrap gap-2">
                  {result.missing_keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 text-sm rounded-full bg-destructive/10 text-destructive border border-destructive/20 font-medium"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Strong Points */}
          {result.strong_points.length > 0 && (
            <section className="py-12 border-b border-border bg-surface-secondary">
              <div className="section-container max-w-3xl">
                <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
                  ✅ What You're Doing Right
                </h2>
                <div className="space-y-2">
                  {result.strong_points.map((pt, i) => (
                    <div key={i} className="flex items-start gap-3 p-3">
                      <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground">{pt}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Bullet Rewrites */}
          {result.weak_bullets.length > 0 && (
            <section className="py-12 border-b border-border">
              <div className="section-container max-w-3xl">
                <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
                  <Sparkles className="w-6 h-6 inline text-primary mr-2" />
                  AI-Improved Bullet Points
                </h2>
                <p className="text-muted-foreground mb-6">Click to see the AI-rewritten version</p>
                <div className="space-y-4">
                  {result.weak_bullets.map((bullet, i) => (
                    <div key={i} className="card-surface overflow-hidden">
                      <button
                        onClick={() => toggleBullet(i)}
                        className="w-full flex items-start gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
                      >
                        <XCircle className="w-4 h-4 text-destructive shrink-0 mt-1" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-muted-foreground line-through">{bullet.original}</p>
                          <p className="text-xs text-destructive/70 mt-1">{bullet.reason}</p>
                        </div>
                        {expandedBullets.has(i) ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                        )}
                      </button>
                      {expandedBullets.has(i) && (
                        <div className="border-t border-border p-4 bg-secondary/5">
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-1" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-foreground font-medium">{bullet.improved}</p>
                              <button
                                onClick={() => copyImproved(bullet.improved, i)}
                                className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                              >
                                <Copy className="w-3 h-3" />
                                {copiedIdx === i ? "Copied!" : "Copy improved version"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="py-12">
            <div className="section-container max-w-3xl">
              <div className="card-surface p-8 text-center glow-box-blue">
                <h2 className="text-2xl font-heading font-bold text-foreground mb-3">
                  Want to fix all skill gaps too?
                </h2>
                <p className="text-muted-foreground mb-6">
                  Get a full skill analysis and personalized learning roadmap
                </p>
                <Button
                  onClick={() => navigate("/analyze")}
                  className="h-12 px-8 text-base font-semibold glow-box-blue group"
                >
                  Full Skill Analysis <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default ResumeAnalysisPage;
