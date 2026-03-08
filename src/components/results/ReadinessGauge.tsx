import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface ReadinessGaugeProps {
  score: number;
}

const getZone = (score: number) => {
  if (score <= 40) return { label: "Not Ready", emoji: "🔴", color: "text-destructive", strokeColor: "hsl(347, 77%, 60%)" };
  if (score <= 70) return { label: "Getting There", emoji: "🚀", color: "text-amber-400", strokeColor: "hsl(38, 92%, 50%)" };
  return { label: "Job Ready", emoji: "🎉", color: "text-secondary", strokeColor: "hsl(160, 84%, 39%)" };
};

const ReadinessGauge = ({ score }: ReadinessGaugeProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const zone = getZone(score);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setAnimatedScore(Math.floor(eased * score));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, score]);

  const r = 80;
  const circumference = 2 * Math.PI * r;
  const arcLength = circumference * 0.75;
  const offset = arcLength - (arcLength * animatedScore) / 100;

  return (
    <div ref={ref} className="flex flex-col lg:flex-row items-center gap-10">
      <div className="relative w-56 h-56 shrink-0">
        <svg viewBox="0 0 200 200" className="w-full h-full" style={{ transform: "rotate(135deg)" }}>
          <circle cx="100" cy="100" r={r} fill="none" stroke="hsl(240, 16%, 19%)" strokeWidth="12" strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference}`} />
          <circle cx="100" cy="100" r={r} fill="none" stroke={zone.strokeColor} strokeWidth="12" strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 2s cubic-bezier(0.33, 1, 0.68, 1)" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-heading font-extrabold text-foreground">{animatedScore}</span>
          <span className={cn("text-sm font-medium mt-1", zone.color)}>{zone.label} {zone.emoji}</span>
        </div>
      </div>

      <div className="space-y-4 text-center lg:text-left">
        <p className="text-lg text-muted-foreground">
          You're <span className="text-foreground font-semibold">{100 - score} points</span> away from being fully job-ready for this role
        </p>
        <div className="flex flex-wrap justify-center lg:justify-start gap-4">
          {[
            { icon: "✅", label: "Skills Matched", value: "28/47", color: "text-secondary" },
            { icon: "⚠️", label: "Skills to Learn", value: "12", color: "text-amber-400" },
            { icon: "❌", label: "Critical Gaps", value: "7", color: "text-destructive" },
          ].map((s) => (
            <div key={s.label} className="card-surface px-4 py-3 min-w-[120px]">
              <div className="text-xs text-muted-foreground mb-1">{s.icon} {s.label}</div>
              <div className={cn("text-xl font-heading font-bold", s.color)}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReadinessGauge;
