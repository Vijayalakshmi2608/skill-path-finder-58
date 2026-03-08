import { useEffect, useState, useRef } from "react";

const stats = [
  { value: 10000, suffix: "+", label: "Students Analyzed" },
  { value: 94, suffix: "%", label: "Accuracy Rate" },
  { value: 30, suffix: " Days", label: "Avg time to job-ready" },
  { value: 3, suffix: "x", label: "More interview callbacks" },
];

function useCountUp(target: number, inView: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target]);
  return count;
}

const StatItem = ({ value, suffix, label, inView }: { value: number; suffix: string; label: string; inView: boolean }) => {
  const count = useCountUp(value, inView);
  return (
    <div className="text-center">
      <div className="text-4xl sm:text-5xl font-heading font-extrabold text-foreground">
        {count.toLocaleString()}{suffix}
      </div>
      <p className="text-muted-foreground mt-2">{label}</p>
    </div>
  );
};

const Stats = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-24 bg-surface-secondary">
      <div className="section-container">
        <h2 className="text-3xl sm:text-4xl font-heading font-bold text-center mb-14">
          The Numbers <span className="text-primary">Don't Lie</span>
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 card-surface p-8 sm:p-12">
          {stats.map((s) => (
            <StatItem key={s.label} {...s} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
