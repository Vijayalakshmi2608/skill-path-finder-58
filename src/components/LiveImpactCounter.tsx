import { useEffect, useRef, useState } from "react";

interface Stat {
  label: string;
  target: number;
  suffix?: string;
  prefix?: string;
}

const ANALYZED_KEY = "skillscan_analyzed_count";
const BASE_ANALYZED = 1247;
const BASE_GAPS = 8392;

function getCounts() {
  let extra = 0;
  try {
    extra = parseInt(localStorage.getItem(ANALYZED_KEY) || "0", 10) || 0;
  } catch { /* noop */ }
  return {
    analyzed: BASE_ANALYZED + extra,
    gaps: BASE_GAPS + extra * 7,
  };
}

export function bumpAnalyzedCounter() {
  try {
    const n = parseInt(localStorage.getItem(ANALYZED_KEY) || "0", 10) || 0;
    localStorage.setItem(ANALYZED_KEY, String(n + 1));
  } catch { /* noop */ }
}

const Counter = ({ target, prefix, suffix }: { target: number; prefix?: string; suffix?: string }) => {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();
            const dur = 2000;
            const tick = (t: number) => {
              const p = Math.min(1, (t - start) / dur);
              const eased = 1 - Math.pow(1 - p, 3);
              setVal(Math.floor(eased * target));
              if (p < 1) requestAnimationFrame(tick);
              else setVal(target);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{val.toLocaleString()}{suffix}
    </span>
  );
};

const LiveImpactCounter = () => {
  const [counts] = useState(getCounts);

  const stats: Stat[] = [
    { label: "Resumes Analyzed", target: counts.analyzed },
    { label: "Skill Gaps Detected", target: counts.gaps },
    { label: "Found Their #1 Missing Skill", target: 94, suffix: "%" },
  ];

  return (
    <section className="py-12 border-y border-border bg-surface-secondary">
      <div className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((s) => (
            <div
              key={s.label}
              className="card-surface p-6 text-center hover-lift"
            >
              <div className="text-4xl sm:text-5xl font-heading font-extrabold text-primary glow-blue mb-2">
                <Counter target={s.target} suffix={s.suffix} prefix={s.prefix} />
              </div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LiveImpactCounter;
