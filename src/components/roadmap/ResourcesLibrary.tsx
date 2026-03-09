import { useState } from "react";
import { resources } from "@/data/roadmapData";
import { Star, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Filter = "all" | "free" | "paid" | "video" | "project";

const platformColors: Record<string, string> = {
  YouTube: "bg-destructive/10 text-destructive",
  Coursera: "bg-primary/10 text-primary",
  Udemy: "bg-[hsl(280_80%_60%/0.1)] text-[hsl(280_80%_60%)]",
  LeetCode: "bg-[hsl(45_100%_60%/0.1)] text-[hsl(45_100%_60%)]",
  GitHub: "bg-muted text-foreground",
  freeCodeCamp: "bg-secondary/10 text-secondary",
  Kaggle: "bg-primary/10 text-primary",
};

const ResourcesLibrary = () => {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = resources.filter((r) => {
    if (filter === "all") return true;
    if (filter === "free") return r.isFree;
    if (filter === "paid") return !r.isFree;
    if (filter === "video") return r.type === "video" || r.type === "course";
    if (filter === "project") return r.type === "project";
    return true;
  });

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: "All Resources" },
    { key: "free", label: "Free" },
    { key: "paid", label: "Paid" },
    { key: "video", label: "Videos" },
    { key: "project", label: "Projects" },
  ];

  return (
    <section className="py-12 border-b border-border">
      <div className="section-container">
        <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
          📚 Resources Library
        </h2>

        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                filter === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r, i) => (
            <div key={i} className="card-surface p-5 hover-lift flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span
                  className={cn(
                    "text-xs font-semibold px-2.5 py-1 rounded-full",
                    platformColors[r.platform] || "bg-muted text-muted-foreground"
                  )}
                >
                  {r.platform}
                </span>
                <span
                  className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full",
                    r.isFree
                      ? "bg-secondary/10 text-secondary"
                      : "bg-primary/10 text-primary"
                  )}
                >
                  {r.price}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-2 leading-snug flex-1">
                {r.title}
              </h3>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                <span>{r.duration}</span>
                <span>·</span>
                <span>{r.difficulty}</span>
                <span>·</span>
                <span className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-[hsl(45_100%_60%)] text-[hsl(45_100%_60%)]" />
                  {r.rating}
                </span>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-auto">
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add to Plan
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ResourcesLibrary;
