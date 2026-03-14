import { useEffect, useState, useRef } from "react";

interface CompetitiveAnalysisProps {
  percentile?: number;
}

const CompetitiveAnalysis = ({ percentile = 0 }: CompetitiveAnalysisProps) => {
  const [fillWidth, setFillWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setFillWidth(percentile);
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [percentile]);

  return (
    <div ref={ref} className="space-y-8">
      <div className="card-surface p-6">
        <p className="text-sm text-muted-foreground mb-3">Your position among applicants for this role</p>
        <div className="h-4 bg-muted rounded-full overflow-hidden relative mb-2">
          <div
            className="h-full bg-gradient-to-r from-destructive via-amber-400 to-secondary rounded-full transition-all duration-[2s] ease-out"
            style={{ width: `${fillWidth}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-foreground rounded-full border-2 border-primary shadow-lg transition-all duration-[2s] ease-out"
            style={{ left: `calc(${fillWidth}% - 8px)` }}
          />
        </div>
        <p className="text-foreground font-heading font-bold text-lg">
          You score higher than <span className="text-primary">{percentile}%</span> of applicants for this role
        </p>
      </div>
    </div>
  );
};

export default CompetitiveAnalysis;