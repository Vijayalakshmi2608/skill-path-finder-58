import { Plus, Clock, TrendingUp } from "lucide-react";

interface QuickWinsProps {
  wins?: { skill: string; days_to_learn: number; score_boost: number }[];
}

const QuickWins = ({ wins = [] }: QuickWinsProps) => {
  if (wins.length === 0) {
    return (
      <div className="card-surface p-8 text-center">
        <p className="text-muted-foreground">No quick wins data available.</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-5">
      {wins.map((w, i) => (
        <div key={i} className="card-surface p-6 hover-lift flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">⚡</span>
            <h4 className="text-lg font-heading font-bold text-foreground">{w.skill}</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-4 flex-1">
            Learn this skill to boost your readiness score significantly.
          </p>
          <div className="flex items-center gap-4 mb-4 text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3.5 h-3.5" /> {w.days_to_learn} days
            </span>
            <span className="flex items-center gap-1 text-secondary">
              <TrendingUp className="w-3.5 h-3.5" /> +{w.score_boost} points
            </span>
          </div>
          <button className="w-full py-2.5 text-sm font-medium bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Add to My Roadmap
          </button>
        </div>
      ))}
    </div>
  );
};

export default QuickWins;