import { useState } from "react";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Skill {
  name: string;
  status: "strong" | "learning" | "missing";
  pct: number;
  note?: string;
  usage?: number;
}

interface SkillCategoryData {
  icon: string;
  title: string;
  skills: Skill[];
}

interface SkillBreakdownProps {
  categories?: { name: string; icon: string; skills: { name: string; status: "strong" | "learning" | "missing"; percent: number; reason?: string }[] }[];
}

const statusConfig = {
  strong: { badge: "✅ Strong", barColor: "bg-secondary", badgeColor: "bg-secondary/15 text-secondary border-secondary/30" },
  learning: { badge: "🔄 Learning", barColor: "bg-amber-400", badgeColor: "bg-amber-400/15 text-amber-400 border-amber-400/30" },
  missing: { badge: "❌ Missing", barColor: "bg-destructive", badgeColor: "bg-destructive/15 text-destructive border-destructive/30" },
};

const SkillCategory = ({ icon, title, skills }: SkillCategoryData) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="card-surface overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors"
      >
        <span className="flex items-center gap-3 font-heading font-bold text-foreground">
          <span className="text-xl">{icon}</span>
          {title}
          <span className="text-xs text-muted-foreground font-normal">
            ({skills.filter((s) => s.status === "strong").length}/{skills.length} matched)
          </span>
        </span>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {expanded && (
        <div className="px-5 pb-4 space-y-3">
          {skills.map((skill) => {
            const cfg = statusConfig[skill.status];
            return (
              <div key={skill.name} className={cn("rounded-lg p-3 transition-colors", skill.status === "missing" ? "bg-destructive/5 border border-destructive/10" : "bg-muted/20")}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-medium text-foreground flex-1">{skill.name}</span>
                  <span className={cn("px-2.5 py-0.5 text-xs font-medium rounded-full border", cfg.badgeColor)}>
                    {cfg.badge}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-1000", cfg.barColor)}
                      style={{ width: `${skill.pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{skill.pct}%</span>
                  {skill.status === "missing" && (
                    <button className="flex items-center gap-1 px-2.5 py-1 text-xs bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors">
                      <Plus className="w-3 h-3" /> Roadmap
                    </button>
                  )}
                </div>
                {skill.note && (
                  <p className="text-xs text-destructive mt-2">{skill.note}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const SkillBreakdown = ({ categories }: SkillBreakdownProps) => {
  const skillData: SkillCategoryData[] = categories && categories.length > 0
    ? categories.map(cat => ({
        icon: cat.icon,
        title: cat.name,
        skills: cat.skills.map(s => ({
          name: s.name,
          status: s.status,
          pct: s.percent,
          note: s.reason,
        })),
      }))
    : [];

  if (skillData.length === 0) {
    return (
      <div className="card-surface p-8 text-center">
        <p className="text-muted-foreground">No skill analysis data available. Complete the analysis first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-secondary" />
          <span className="text-xs text-muted-foreground">Your Current Skills</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-xs text-muted-foreground">Required for This Role</span>
        </div>
      </div>
      {skillData.map((cat) => (
        <SkillCategory key={cat.title} {...cat} />
      ))}
    </div>
  );
};

export default SkillBreakdown;