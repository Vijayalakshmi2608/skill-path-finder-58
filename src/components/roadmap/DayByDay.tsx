import { useState } from "react";
import { weeks, type Day } from "@/data/roadmapData";
import { ChevronDown, ChevronRight, CheckCircle2, Circle, List, LayoutGrid, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ViewMode = "list" | "week" | "calendar";

interface DayByDayProps {
  completedDays: Set<number>;
  toggleDay: (day: number) => void;
}

const DayByDay = ({ completedDays, toggleDay }: DayByDayProps) => {
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]));
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const toggleWeek = (w: number) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      next.has(w) ? next.delete(w) : next.add(w);
      return next;
    });
  };

  const taskBg: Record<string, string> = {
    video: "bg-primary/10 text-primary",
    read: "bg-secondary/10 text-secondary",
    practice: "bg-[hsl(45_100%_60%/0.1)] text-[hsl(45_100%_60%)]",
    project: "bg-[hsl(280_80%_60%/0.1)] text-[hsl(280_80%_60%)]",
    checkpoint: "bg-secondary/10 text-secondary",
    quiz: "bg-primary/10 text-primary",
    rest: "bg-muted text-muted-foreground",
  };

  return (
    <section className="py-12 border-b border-border">
      <div className="section-container">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl font-heading font-bold text-foreground">
            Day-by-Day Roadmap
          </h2>
          <div className="flex items-center gap-1 card-surface p-1">
            {([
              { mode: "list" as ViewMode, icon: List, label: "List" },
              { mode: "week" as ViewMode, icon: LayoutGrid, label: "Week" },
              { mode: "calendar" as ViewMode, icon: CalendarDays, label: "Calendar" },
            ]).map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  viewMode === mode
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
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
            {weeks.map((week) => (
              <div key={week.week} className="card-surface overflow-hidden">
                <button
                  onClick={() => toggleWeek(week.week)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{week.icon}</span>
                    <div>
                      <h3 className="text-lg font-heading font-semibold text-foreground">
                        Week {week.week} — {week.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{week.subtitle}</p>
                    </div>
                  </div>
                  {expandedWeeks.has(week.week) ? (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>

                {expandedWeeks.has(week.week) && (
                  <div className="border-t border-border">
                    {week.days.map((day) => (
                      <DayCard
                        key={day.day}
                        day={day}
                        isCompleted={completedDays.has(day.day)}
                        onToggle={() => toggleDay(day.day)}
                        taskBg={taskBg}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {viewMode === "week" && (
          <div className="space-y-8">
            {weeks.map((week) => (
              <div key={week.week}>
                <h3 className="text-lg font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span>{week.icon}</span> Week {week.week} — {week.title}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {week.days.map((day) => (
                    <button
                      key={day.day}
                      onClick={() => toggleDay(day.day)}
                      className={cn(
                        "card-surface p-3 text-left hover-lift cursor-pointer relative",
                        completedDays.has(day.day) && "border-secondary/50",
                        day.isToday && "ring-2 ring-primary"
                      )}
                    >
                      {completedDays.has(day.day) && (
                        <CheckCircle2 className="w-4 h-4 text-secondary absolute top-2 right-2" />
                      )}
                      <p className="text-xs text-muted-foreground mb-1">Day {day.day}</p>
                      <p className="text-sm font-semibold text-foreground leading-tight mb-1">
                        {day.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{day.duration}</p>
                      {day.isToday && (
                        <span className="text-xs text-primary font-medium mt-1 block">
                          Today 🔥
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === "calendar" && (
          <div className="grid grid-cols-7 gap-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">
                {d}
              </div>
            ))}
            {/* Offset for starting on a Monday */}
            {Array.from({ length: 30 }, (_, i) => {
              const dayNum = i + 1;
              const allDays = weeks.flatMap((w) => w.days);
              const day = allDays.find((d) => d.day === dayNum);
              return (
                <button
                  key={dayNum}
                  onClick={() => toggleDay(dayNum)}
                  className={cn(
                    "card-surface p-2 aspect-square flex flex-col items-center justify-center gap-1 hover-lift cursor-pointer text-center",
                    completedDays.has(dayNum) && "border-secondary/50 bg-secondary/5",
                    day?.isToday && "ring-2 ring-primary",
                    day?.isRest && "opacity-70"
                  )}
                >
                  <span className="text-lg font-bold text-foreground">{dayNum}</span>
                  {day && (
                    <span className="text-[10px] text-muted-foreground leading-tight line-clamp-2">
                      {day.title}
                    </span>
                  )}
                  {completedDays.has(dayNum) && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

const DayCard = ({
  day,
  isCompleted,
  onToggle,
  taskBg,
}: {
  day: Day;
  isCompleted: boolean;
  onToggle: () => void;
  taskBg: Record<string, string>;
}) => {
  return (
    <div
      className={cn(
        "p-5 border-b border-border last:border-b-0 transition-colors",
        isCompleted && "bg-secondary/5"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <button onClick={onToggle} className="mt-0.5">
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-secondary" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
            )}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h4 className={cn("font-semibold text-foreground", isCompleted && "line-through opacity-60")}>
                Day {day.day} — {day.title}
              </h4>
              {day.isToday && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                  Today 🔥
                </span>
              )}
              {day.isRest && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  Rest Day
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{day.duration}</p>
          </div>
        </div>
      </div>

      <div className="ml-8 space-y-2">
        {day.tasks.map((task, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-md font-medium shrink-0 mt-0.5",
                taskBg[task.type] || "bg-muted text-muted-foreground"
              )}
            >
              {task.icon}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground leading-snug">{task.title}</p>
              {(task.duration || task.source) && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {[task.duration, task.source && `${task.source}${task.isFree ? " · Free" : ""}`]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DayByDay;
