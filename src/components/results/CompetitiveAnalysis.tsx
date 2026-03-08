import { useEffect, useState, useRef } from "react";

const CompetitiveAnalysis = () => {
  const [fillWidth, setFillWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setFillWidth(67);
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const cards = [
    { icon: "📊", title: "Top 10% applicants have", desc: "Docker, Kubernetes, System Design" },
    { icon: "👥", title: "Most common skill gap", desc: "Machine Learning (68% of applicants missing)" },
    { icon: "🎯", title: "Your biggest advantage", desc: "Strong React + Node.js stack" },
  ];

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
          You score higher than <span className="text-primary">67%</span> of applicants for this role
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {cards.map((c, i) => (
          <div key={i} className="card-surface p-5 hover-lift">
            <span className="text-2xl block mb-3">{c.icon}</span>
            <h4 className="text-sm text-muted-foreground mb-1">{c.title}</h4>
            <p className="text-foreground font-medium text-sm">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompetitiveAnalysis;
