import { weeks } from "@/data/roadmapData";

const WeekOverview = () => {
  return (
    <section className="py-12 border-b border-border">
      <div className="section-container">
        <h2 className="text-2xl font-heading font-bold text-foreground mb-8">
          Roadmap Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {weeks.map((week) => (
            <div
              key={week.week}
              className="card-surface p-5 hover-lift group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 h-1 w-full bg-primary/20 group-hover:bg-primary transition-colors" />
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{week.icon}</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Week {week.week}
                </span>
              </div>
              <h3 className="text-lg font-heading font-semibold text-foreground mb-1">
                {week.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {week.subtitle}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {week.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WeekOverview;
