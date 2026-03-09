import { Flame } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine } from "recharts";

interface ProgressTrackerProps {
  completedDays: number;
  streak: number;
}

const projectionData = Array.from({ length: 31 }, (_, i) => ({
  day: i,
  score: Math.round(64 + (25 * (1 - Math.exp(-i / 12)))),
}));

const chartConfig = {
  score: { label: "Readiness Score", color: "hsl(var(--primary))" },
};

const ProgressTracker = ({ completedDays, streak }: ProgressTrackerProps) => {
  const pct = Math.round((completedDays / 30) * 100);
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <section className="py-12 border-b border-border">
      <div className="section-container">
        <h2 className="text-2xl font-heading font-bold text-foreground mb-8">
          📈 Progress Tracker
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Circular ring */}
          <div className="card-surface p-6 flex flex-col items-center justify-center">
            <svg width="140" height="140" className="mb-4">
              <circle cx="70" cy="70" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
              <circle
                cx="70"
                cy="70"
                r={r}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                transform="rotate(-90 70 70)"
                className="transition-all duration-1000"
              />
              <text x="70" y="66" textAnchor="middle" className="fill-foreground text-2xl font-bold" fontSize="28">
                {completedDays}
              </text>
              <text x="70" y="86" textAnchor="middle" className="fill-muted-foreground" fontSize="12">
                of 30 days
              </text>
            </svg>
            <p className="text-sm text-muted-foreground">{pct}% complete</p>
          </div>

          {/* Projection chart */}
          <div className="card-surface p-6 lg:col-span-1">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Score Projection
            </h3>
            <ChartContainer config={chartConfig} className="h-[180px] w-full">
              <LineChart data={projectionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis domain={[60, 95]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ReferenceLine y={85} stroke="hsl(var(--secondary))" strokeDasharray="4 4" label={{ value: "Target", fontSize: 10, fill: "hsl(var(--secondary))" }} />
                {completedDays > 0 && (
                  <ReferenceLine x={completedDays} stroke="hsl(var(--primary))" strokeDasharray="4 4" />
                )}
                <Line type="monotone" dataKey="score" stroke="var(--color-score)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Current: <span className="text-primary font-semibold">64</span> → Day 30: <span className="text-secondary font-semibold">89</span>
            </p>
          </div>

          {/* Streak */}
          <div className="card-surface p-6 flex flex-col items-center justify-center text-center">
            <Flame className="w-12 h-12 text-destructive mb-3" />
            <p className="text-4xl font-heading font-bold text-foreground mb-1">
              {streak}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              day streak
            </p>
            {streak === 0 ? (
              <p className="text-sm text-primary font-medium">
                🔥 Start your streak today!
              </p>
            ) : (
              <p className="text-sm text-secondary font-medium">
                Keep it going! 💪
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProgressTracker;
