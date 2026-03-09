import { Calendar, Clock, BookOpen, Target, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoadmapHeaderProps {
  completedDays: number;
}

const RoadmapHeader = ({ completedDays }: RoadmapHeaderProps) => {
  return (
    <section className="py-12 border-b border-border">
      <div className="section-container">
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-3">
          Your 30-Day Job-Ready Roadmap 🗺️
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Personalized for:{" "}
          <span className="text-primary font-semibold">
            Software Engineer @ Google — Entry Level
          </span>
        </p>

        <div className="flex flex-wrap gap-4 md:gap-6 mb-8">
          {[
            { icon: Calendar, label: "30 Days", emoji: "📅" },
            { icon: Clock, label: "1 hour/day", emoji: "⏱️" },
            { icon: BookOpen, label: "12 skills to learn", emoji: "📚" },
            { icon: Target, label: "Target score: 85+", emoji: "🎯" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-2 card-surface px-4 py-2.5"
            >
              <span className="text-lg">{stat.emoji}</span>
              <span className="text-sm font-medium text-foreground">
                {stat.label}
              </span>
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
              Day{" "}
              <span className="text-primary font-bold text-lg">
                {completedDays}
              </span>{" "}
              of 30 —{" "}
              {completedDays === 0
                ? "Let's begin!"
                : `${Math.round((completedDays / 30) * 100)}% complete`}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoadmapHeader;
