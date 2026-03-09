import { useState } from "react";
import { Zap, Code2, Play, Copy, CheckCircle2, ChevronDown, ChevronRight, Terminal, Globe, Braces, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-gateway`;

interface Endpoint {
  method: "GET" | "POST";
  path: string;
  description: string;
  route: string;
  params?: { name: string; type: string; required: boolean; description: string }[];
  body?: Record<string, unknown>;
  sampleResponse: Record<string, unknown>;
}

const ENDPOINTS: Endpoint[] = [
  {
    method: "GET",
    path: "/api/v1/skills/{job_title}",
    description: "Returns required skills for any job title with importance levels and salary impact",
    route: "skills/Software Engineer",
    params: [{ name: "job_title", type: "string", required: true, description: "The job title to look up (URL-encoded)" }],
    sampleResponse: {
      status: "success",
      data: {
        job_title: "Software Engineer",
        required_skills: [
          { name: "JavaScript", category: "Programming", importance: "critical", avg_salary_impact_percent: 15 },
          { name: "System Design", category: "Architecture", importance: "important", avg_salary_impact_percent: 20 },
        ],
        total_jobs_available: 45000,
        avg_salary_range: "₹8L - ₹25L",
      },
    },
  },
  {
    method: "POST",
    path: "/api/v1/analyze",
    description: "Analyzes skill gaps for a target role and returns readiness score with recommendations",
    route: "analyze",
    body: {
      skills: ["JavaScript", "React", "Node.js", "CSS"],
      job_title: "Frontend Engineer",
      experience_level: "mid",
    },
    sampleResponse: {
      status: "success",
      data: {
        readiness_score: 72,
        matched_skills: [
          { name: "JavaScript", match_percent: 95 },
          { name: "React", match_percent: 88 },
        ],
        missing_skills: [
          { name: "TypeScript", priority: "critical", learning_time_days: 14 },
          { name: "Testing", priority: "important", learning_time_days: 7 },
        ],
        recommendation: "Focus on TypeScript and testing to boost your readiness to 85%+",
      },
    },
  },
  {
    method: "GET",
    path: "/api/v1/trending",
    description: "Returns the top trending tech skills this month with growth data",
    route: "trending",
    sampleResponse: {
      status: "success",
      data: {
        month: "March 2026",
        trending: [
          { rank: 1, skill: "AI/ML Engineering", growth_percent: 340, category: "AI", reason: "Explosion of LLM-powered applications" },
          { rank: 2, skill: "Rust", growth_percent: 120, category: "Systems", reason: "Growing adoption in infrastructure tools" },
        ],
      },
    },
  },
];

const generateCode = (endpoint: Endpoint, lang: "curl" | "javascript" | "python") => {
  const fullUrl = `${BASE_URL}?route=${encodeURIComponent(endpoint.route)}`;

  if (lang === "curl") {
    if (endpoint.method === "GET") {
      return `curl "${fullUrl}" \\
  -H "Content-Type: application/json"`;
    }
    return `curl -X POST "${fullUrl}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(endpoint.body, null, 2)}'`;
  }

  if (lang === "javascript") {
    if (endpoint.method === "GET") {
      return `const response = await fetch(
  "${fullUrl}"
);
const data = await response.json();
console.log(data);`;
    }
    return `const response = await fetch("${fullUrl}", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(${JSON.stringify(endpoint.body, null, 4)})
});
const data = await response.json();
console.log(data);`;
  }

  // python
  if (endpoint.method === "GET") {
    return `import requests

response = requests.get(
    "${fullUrl}"
)
print(response.json())`;
  }
  return `import requests

response = requests.post(
    "${fullUrl}",
    json=${JSON.stringify(endpoint.body, null, 4)}
)
print(response.json())`;
};

const ApiPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [expandedEndpoint, setExpandedEndpoint] = useState<number | null>(0);
  const [playgroundRoute, setPlaygroundRoute] = useState("skills/Software Engineer");
  const [playgroundMethod, setPlaygroundMethod] = useState<"GET" | "POST">("GET");
  const [playgroundBody, setPlaygroundBody] = useState("");
  const [playgroundResult, setPlaygroundResult] = useState("");
  const [playgroundLoading, setPlaygroundLoading] = useState(false);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard!" });
  };

  const runPlayground = async () => {
    setPlaygroundLoading(true);
    setPlaygroundResult("");
    try {
      const url = `${BASE_URL}?route=${encodeURIComponent(playgroundRoute)}`;
      const opts: RequestInit = {
        method: playgroundMethod,
        headers: { "Content-Type": "application/json" },
      };
      if (playgroundMethod === "POST" && playgroundBody.trim()) {
        opts.body = playgroundBody;
      }
      const resp = await fetch(url, opts);
      const data = await resp.json();
      setPlaygroundResult(JSON.stringify(data, null, 2));
    } catch (e: any) {
      setPlaygroundResult(JSON.stringify({ error: e.message }, null, 2));
    } finally {
      setPlaygroundLoading(false);
    }
  };

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
      <section className="py-16 border-b border-border">
        <div className="section-container max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Code2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">v1.0</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-foreground mb-4">
            SkillScan <span className="text-primary">API</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl">
            Integrate real-time skill intelligence into your applications. AI-powered endpoints for skill requirements, gap analysis, and market trends.
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="w-4 h-4" /> REST API
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Braces className="w-4 h-4" /> JSON responses
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Terminal className="w-4 h-4" /> No auth required
            </div>
          </div>
          <div className="mt-6 p-3 rounded-lg bg-muted/50 border border-border inline-block">
            <code className="text-sm font-mono text-primary">
              Base URL: <span className="text-foreground">{BASE_URL}</span>
            </code>
          </div>
        </div>
      </section>

      {/* Endpoints */}
      <section className="py-12 border-b border-border">
        <div className="section-container max-w-4xl">
          <h2 className="text-2xl font-heading font-bold text-foreground mb-8">Endpoints</h2>
          <div className="space-y-4">
            {ENDPOINTS.map((ep, i) => (
              <div key={i} className="card-surface overflow-hidden">
                <button
                  onClick={() => setExpandedEndpoint(expandedEndpoint === i ? null : i)}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/20 transition-colors"
                >
                  <span className={`px-2.5 py-1 text-xs font-mono font-bold rounded ${
                    ep.method === "GET" ? "bg-secondary/15 text-secondary" : "bg-primary/15 text-primary"
                  }`}>
                    {ep.method}
                  </span>
                  <code className="text-sm font-mono text-foreground flex-1">{ep.path}</code>
                  {expandedEndpoint === i ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>

                {expandedEndpoint === i && (
                  <div className="border-t border-border p-5 space-y-6">
                    <p className="text-sm text-muted-foreground">{ep.description}</p>

                    {/* Params */}
                    {ep.params && (
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-2">Parameters</h4>
                        <div className="space-y-2">
                          {ep.params.map((p, j) => (
                            <div key={j} className="flex items-start gap-3 text-sm">
                              <code className="font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs">{p.name}</code>
                              <span className="text-muted-foreground">{p.type}</span>
                              {p.required && <span className="text-destructive text-xs">required</span>}
                              <span className="text-muted-foreground">— {p.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Request Body */}
                    {ep.body && (
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-2">Request Body</h4>
                        <div className="relative">
                          <pre className="bg-muted/50 border border-border rounded-lg p-4 text-xs font-mono text-foreground overflow-x-auto">
                            {JSON.stringify(ep.body, null, 2)}
                          </pre>
                          <button onClick={() => copyText(JSON.stringify(ep.body, null, 2))} className="absolute top-2 right-2 p-1.5 rounded bg-muted hover:bg-border transition-colors">
                            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Code Samples */}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Code Examples</h4>
                      <Tabs defaultValue="curl">
                        <TabsList className="bg-muted/50">
                          <TabsTrigger value="curl" className="text-xs font-mono">cURL</TabsTrigger>
                          <TabsTrigger value="javascript" className="text-xs font-mono">JavaScript</TabsTrigger>
                          <TabsTrigger value="python" className="text-xs font-mono">Python</TabsTrigger>
                        </TabsList>
                        {(["curl", "javascript", "python"] as const).map(lang => (
                          <TabsContent key={lang} value={lang}>
                            <div className="relative">
                              <pre className="bg-muted/50 border border-border rounded-lg p-4 text-xs font-mono text-foreground overflow-x-auto whitespace-pre-wrap">
                                {generateCode(ep, lang)}
                              </pre>
                              <button onClick={() => copyText(generateCode(ep, lang))} className="absolute top-2 right-2 p-1.5 rounded bg-muted hover:bg-border transition-colors">
                                <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                              </button>
                            </div>
                          </TabsContent>
                        ))}
                      </Tabs>
                    </div>

                    {/* Sample Response */}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Sample Response</h4>
                      <pre className="bg-muted/50 border border-border rounded-lg p-4 text-xs font-mono text-foreground overflow-x-auto">
                        {JSON.stringify(ep.sampleResponse, null, 2)}
                      </pre>
                    </div>

                    {/* Try It button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPlaygroundRoute(ep.route);
                        setPlaygroundMethod(ep.method);
                        setPlaygroundBody(ep.body ? JSON.stringify(ep.body, null, 2) : "");
                        document.getElementById("playground")?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      <Play className="w-4 h-4" /> Try it in Playground
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Playground */}
      <section id="playground" className="py-12 border-b border-border bg-surface-secondary">
        <div className="section-container max-w-4xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center">
              <Terminal className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h2 className="text-2xl font-heading font-bold text-foreground">API Playground</h2>
              <p className="text-sm text-muted-foreground">Test endpoints live — no setup needed</p>
            </div>
          </div>

          <div className="card-surface p-6 space-y-4">
            {/* Method + Route */}
            <div className="flex gap-3">
              <select
                value={playgroundMethod}
                onChange={e => setPlaygroundMethod(e.target.value as "GET" | "POST")}
                className="px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
              <Input
                value={playgroundRoute}
                onChange={e => setPlaygroundRoute(e.target.value)}
                placeholder="e.g. skills/Software Engineer"
                className="font-mono text-sm bg-muted/50"
              />
              <Button onClick={runPlayground} disabled={playgroundLoading} className="shrink-0 glow-box-blue">
                {playgroundLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Run
              </Button>
            </div>

            {/* Body (POST) */}
            {playgroundMethod === "POST" && (
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Request Body (JSON)</label>
                <Textarea
                  value={playgroundBody}
                  onChange={e => setPlaygroundBody(e.target.value)}
                  rows={6}
                  className="font-mono text-xs bg-muted/50"
                  placeholder='{ "skills": ["React", "Node.js"], "job_title": "Frontend Engineer" }'
                />
              </div>
            )}

            {/* Response */}
            {playgroundResult && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-foreground">Response</label>
                  <button onClick={() => copyText(playgroundResult)} className="text-xs text-primary hover:underline flex items-center gap-1">
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>
                <pre className="bg-muted/50 border border-border rounded-lg p-4 text-xs font-mono text-foreground overflow-x-auto max-h-96 overflow-y-auto whitespace-pre-wrap">
                  {playgroundResult}
                </pre>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Rate Limits & Info */}
      <section className="py-12 border-b border-border">
        <div className="section-container max-w-4xl">
          <h2 className="text-2xl font-heading font-bold text-foreground mb-6">Rate Limits & Info</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: "Rate Limit", value: "60 req/min", desc: "Per IP address" },
              { label: "Max Payload", value: "50 KB", desc: "Request body limit" },
              { label: "Response Format", value: "JSON", desc: "UTF-8 encoded" },
            ].map((item, i) => (
              <div key={i} className="card-surface p-5 text-center">
                <p className="text-2xl font-heading font-bold text-primary mb-1">{item.value}</p>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12">
        <div className="section-container max-w-3xl text-center">
          <div className="card-surface p-8 glow-box-blue">
            <h2 className="text-2xl font-heading font-bold text-foreground mb-3">
              Ready to build with SkillScan?
            </h2>
            <p className="text-muted-foreground mb-6">
              Integrate skill intelligence into your career platform, HR tool, or learning app
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={() => navigate("/analyze")} className="h-11 glow-box-blue group">
                Try Full Analysis <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button onClick={() => navigate("/")} variant="outline" className="h-11">
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ApiPage;
