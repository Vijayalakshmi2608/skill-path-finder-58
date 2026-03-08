import { Plus, Clock, TrendingUp } from "lucide-react";

const wins = [
  { skill: "Docker", time: "1 week to basics", impact: "+8 points", desc: "Used in 69% of SWE listings. Quick to learn with your existing Node.js skills." },
  { skill: "System Design", time: "2 weeks fundamentals", impact: "+12 points", desc: "The #1 interview topic. Your DS&A foundation makes this easier." },
  { skill: "CI/CD Pipelines", time: "3 days basics", impact: "+5 points", desc: "Quick win — most concepts transfer from your Git knowledge." },
];

const QuickWins = () => (
  <div className="grid md:grid-cols-3 gap-5">
    {wins.map((w, i) => (
      <div key={i} className="card-surface p-6 hover-lift flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">⚡</span>
          <h4 className="text-lg font-heading font-bold text-foreground">{w.skill}</h4>
        </div>
        <p className="text-sm text-muted-foreground mb-4 flex-1">{w.desc}</p>
        <div className="flex items-center gap-4 mb-4 text-sm">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-3.5 h-3.5" /> {w.time}
          </span>
          <span className="flex items-center gap-1 text-secondary">
            <TrendingUp className="w-3.5 h-3.5" /> {w.impact}
          </span>
        </div>
        <button className="w-full py-2.5 text-sm font-medium bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Add to My Roadmap
        </button>
      </div>
    ))}
  </div>
);

export default QuickWins;
